import 'dotenv/config';
const PORT = process.env.PORT || 3001;

import { default as notesRouter } from './routes/notes.js';
import { default as authRouter } from './routes/auth.js';

import express from 'express';
const app = express();

import cors from 'cors';
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,    
    secure: true,            
}));
app.use(express.json());

import cookieParser from 'cookie-parser';
app.use(cookieParser());   // populates req.cookies

app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});