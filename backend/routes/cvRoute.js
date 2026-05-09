import express from 'express';
import multer from 'multer';
import path from 'path';
import { CV } from '../models/CV.js';
import authMiddleware from '../middleware/authMiddleware.js';
import fs from 'fs';

const router = express.Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { 
        fieldSize: 10 * 1024 * 1024,
        fileSize: 10 * 1024 * 1024
    }
});

// Route to upload CV (Protected)
router.post('/upload', authMiddleware, upload.single('cv'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Delete previous CV entries if any
        await CV.deleteMany({});

        const newCV = new CV({
            filename: req.file.originalname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            data: req.file.buffer.toString('base64'),
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

        const buffer = Buffer.from(cv.data, 'base64');
        res.setHeader('Content-Type', cv.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${cv.originalname}"`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
