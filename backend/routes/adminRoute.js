import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD } from '../config.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check against hardcoded credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign(
            { id: 'admin_hardcoded_id' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        return res.json({ token, username: ADMIN_USERNAME });
    }

    // Fallback to database check (optional, but good for backward compatibility)
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: admin._id },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, username: admin.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Initialize admin (Only if no admin exists)
router.post('/init', async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify Token
router.get('/verify', (req, res) => {
    // Check Authorization header (case-insensitive)
    const authHeader = req.header('Authorization') || req.header('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied', debug: 'Token missing from headers' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ message: 'Token is valid', decoded, debug: { secret_used: JWT_SECRET ? 'Present' : 'Missing' } });
    } catch (error) {
        res.status(401).json({ 
            message: 'Token is not valid',
            debug: { error: error.message, secret_used: JWT_SECRET ? 'Present' : 'Missing' }
        });
    }
});

export default router;
