// routes/emailRoute.js
import express from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config'

const router = express.Router();

// Route for the first form
router.post('/form1', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and message' 
      });
    }

    // Create a transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'lahirutoursorg@gmail.com',
        pass: process.env.EMAIL_PASS || 'wnvddlqypbboyutp'
      }
    });

    // Email options
    let mailOptions = {
      from: process.env.EMAIL_USER || 'lahirutoursorg@gmail.com',
      to: 'dimalshapraveen2001@gmail.com',
      subject: 'New Contact Form Submission - Portfolio',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

export default router;