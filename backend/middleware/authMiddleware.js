import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

const authMiddleware = (req, res, next) => {
    // Check Authorization header (case-insensitive)
    const authHeader = req.header('Authorization') || req.header('authorization');
    let token = authHeader?.split(' ')[1];

    if (!token) {
        console.log('Auth failed: No token provided in Authorization header');
        return res.status(401).json({ message: 'No token, authorization denied', headers: req.headers });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        res.status(401).json({ 
            message: 'Token is not valid',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
};

export default authMiddleware;
