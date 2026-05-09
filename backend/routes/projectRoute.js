import express from 'express';
import { Project } from '../models/Project.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer configuration for project images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/projects';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `project-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

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
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    const { title, description, tech, liveUrl, githubUrl, featured } = req.body;
    
    // image can be a URL string or a file path from multer
    let image = req.body.image;
    if (req.file) {
        const apiUrl = process.env.API_URL || 'http://localhost:5555';
        image = `${apiUrl}/uploads/projects/${req.file.filename}`;
    }

    try {
        const newProject = new Project({
            title,
            description,
            image,
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
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        if (req.file) {
            const apiUrl = process.env.API_URL || 'http://localhost:5555';
            updateData.image = `${apiUrl}/uploads/projects/${req.file.filename}`;
        }
        
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
