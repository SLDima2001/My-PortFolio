import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, mongodbURL } from './config.js';
import Route from './routes/Route.js';
import emailRoute from './routes/emailRoute.js';
import 'dotenv/config'

const app = express();

// CORS Configuration - MUST come before other middleware
const corsOptions = {
  origin: '*', // Allow all origins (you can specify your frontend URL for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware for parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.status(200).send("Welcome to MERN stack");
});

app.use('/send-email', emailRoute);
app.use('/feedback', Route); // Add your feedback route

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