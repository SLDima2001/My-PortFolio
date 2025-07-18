// routes/emailRoute.js
import express from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config'

const router = express.Router();

// Route for the first form
router.post('/form1', async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Create a transporter
    let transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'lahirutoursorg@gmail.com', // Your email
        pass: 'wnvddlqypbboyutp' // Your email password
      }
    });

    // Email options
    let mailOptions = {
      from: 'lahirutoursorg@gmail.com',
      to: 'dimalshapraveen2001@gmail.com', // Recipient email
      subject: 'Contact Form Submission',
      text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
      `
    };

    // Send email using Promise-based approach
    await transporter.sendMail(mailOptions);
    
    // Return JSON response
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while sending the email',
      error: error.message 
    });
  }
});



export default router;
