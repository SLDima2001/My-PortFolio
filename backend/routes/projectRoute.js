import express from 'express';
import { Project } from '../models/Project.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { 
        fieldSize: 10 * 1024 * 1024,
        fileSize: 10 * 1024 * 1024
    }
});

// GET all projects (Public)
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new project (Protected)
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
    const { title, description, tech, liveUrl, githubUrl, featured } = req.body;
    
    let images = [];
    if (req.body.images) {
        images = typeof req.body.images === 'string' ? [req.body.images] : req.body.images;
    }
    
    if (req.files && req.files.length > 0) {
        const uploadedImages = req.files.map(file => {
            const base64String = file.buffer.toString('base64');
            return `data:${file.mimetype};base64,${base64String}`;
        });
        images = [...images, ...uploadedImages];
    }

    try {
        const newProject = new Project({
            title,
            description,
            images,
            tech: typeof tech === 'string' ? tech.split(',').map(t => t.trim()) : tech,
            liveUrl,
            githubUrl,
            featured: featured === 'true' || featured === true,
        });

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (Update) a project (Protected)
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        let images = [];
        if (req.body.images) {
            images = typeof req.body.images === 'string' ? [req.body.images] : req.body.images;
        }

        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => {
                const base64String = file.buffer.toString('base64');
                return `data:${file.mimetype};base64,${base64String}`;
            });
            images = [...images, ...uploadedImages];
        }
        
        updateData.images = images;
        
        if (updateData.tech && typeof updateData.tech === 'string') {
            updateData.tech = updateData.tech.split(',').map(t => t.trim());
        }
        
        if (updateData.featured) {
            updateData.featured = updateData.featured === 'true' || updateData.featured === true;
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a project (Protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
