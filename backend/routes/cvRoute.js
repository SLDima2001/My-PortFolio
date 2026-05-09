import express from 'express';
import multer from 'multer';
import path from 'path';
import { CV } from '../models/CV.js';
import authMiddleware from '../middleware/authMiddleware.js';
import fs from 'fs';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/cv';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `cv-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Route to upload CV (Protected)
router.post('/upload', authMiddleware, upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Delete previous CV entries if any
        await CV.deleteMany({});

        const newCV = new CV({
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
        });

        await newCV.save();
        res.status(201).json({ message: 'CV uploaded successfully', cv: newCV });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get latest CV (Public)
router.get('/latest', async (req, res) => {
    try {
        const cv = await CV.findOne().sort({ createdAt: -1 });
        if (!cv) {
            return res.status(404).json({ message: 'No CV found' });
        }
        res.json(cv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to download CV (Public)
router.get('/download', async (req, res) => {
    try {
        const cv = await CV.findOne().sort({ createdAt: -1 });
        if (!cv) {
            return res.status(404).json({ message: 'No CV found' });
        }

        const filePath = path.join('uploads/cv', cv.filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, cv.originalname);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
