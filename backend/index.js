import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, mongodbURL } from './config.js';
import Route from './routes/Route.js';
import emailRoute from './routes/emailRoute.js';
import adminRoute from './routes/adminRoute.js';
import projectRoute from './routes/projectRoute.js';
import cvRoute from './routes/cvRoute.js';
import profileRoute from './routes/profileRoute.js';
import path from 'path';

const app = express();

// Manual CORS Middleware for Vercel Reliability
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://dimalshapraveen.vercel.app',
    'http://localhost:5173',
    'http://localhost:5555',
    'https://my-port-folio-onn7.vercel.app'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.status(200).send("Welcome to MERN stack");
});

app.use('/send-email', emailRoute);
app.use('/feedback', Route); 
app.use('/admin', adminRoute);
app.use('/projects', projectRoute);
app.use('/cv', cvRoute);
app.use('/profile', profileRoute);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

mongoose
  .connect(mongodbURL, {})
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });