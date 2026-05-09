import express from 'express';
import { Profile } from '../models/Profile.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/profile';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// GET profile (Public)
router.get('/', async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            // Create a default one if it doesn't exist
            profile = new Profile({ images: [] });
            await profile.save();
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile images (Protected)
router.post('/upload', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = new Profile({ images: [] });
        }

        let images = req.body.keepImages ? (typeof req.body.keepImages === 'string' ? [req.body.keepImages] : req.body.keepImages) : [];
        
        if (req.files && req.files.length > 0) {
            const apiUrl = process.env.API_URL || 'http://localhost:5555';
            const uploadedImages = req.files.map(file => `${apiUrl}/uploads/profile/${file.filename}`);
            images = [...images, ...uploadedImages];
        }

        profile.images = images;
        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
