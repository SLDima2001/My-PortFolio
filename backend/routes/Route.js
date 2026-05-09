import express from 'express';
import { feedback as Model } from '../models/Model.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for save a new feedback (Public)
router.post("/", async (request, response) => {
    try {
        const { name, email, phone, subject, message } = request.body;
        if (!name || !email || !phone || !message) {
            return response.status(400).send({
                message: "Send all required fields: name, email, phone, message",
            });
        }
        const newfeedback = { name, email, phone, subject, message };
        const feedback = await Model.create(newfeedback);
        return response.status(201).send(feedback);
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

// Route for get all feedbacks from database (Protected)
router.get('/', authMiddleware, async (request, response) => {
    try {
        const feedback = await Model.find({}).sort({ createdAt: -1 });
        return response.status(200).json({
            count: feedback.length,
            data: feedback
        });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message })
    }
});

// Route for delete a feedback (Protected)
router.delete('/:id', authMiddleware, async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Model.findByIdAndDelete(id);
        if (!result) {
            return response.status(404).send({ message: 'Feedback not found' });
        }
        return response.status(200).send({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });
    }
});

export default router;