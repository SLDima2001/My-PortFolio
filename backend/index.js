import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, mongodbURL } from './config.js';
import Route from './routes/Route.js';
import emailRoute from './routes/emailRoute.js';
import 'dotenv/config'




const app = express();

// Middleware for parsing request body
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  return res.status(200).send("Welcome to MERN stack");
});

app.use('/send-email', emailRoute);



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
