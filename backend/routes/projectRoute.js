import express from 'express';
import { Project } from '../models/Project.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

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
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, image, tech, liveUrl, githubUrl, featured } = req.body;

    try {
        const newProject = new Project({
            title,
            description,
            image,
            tech,
            liveUrl,
            githubUrl,
            featured,
        });

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (Update) a project (Protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
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
