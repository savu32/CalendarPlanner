import 'dotenv/config';
const PORT = process.env.PORT || 3001;

import { default as notesRouter } from './routes/notes.js';
import { default as authRouter } from './routes/auth.js';

import parseToken from './utils/parseToken.js';

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

import { query } from './db.js';

app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

app.get('/api/me', async (req, res) => {
    const verifiedData = await parseToken(req.headers);
    if (verifiedData !== undefined && verifiedData.userId !== undefined) {
        const usernameQuery = "SELECT username FROM users WHERE user_id = $1";
        const usernameRow = await query(usernameQuery, [verifiedData.user_id]);
        if (usernameRow !== undefined) {
            const username = usernameRow.rows[0].username
            return res.status(200).json({"response": `username: ${username}`});
        } else {
            return res.status(401).json({"response": "invalid token"});
        }
    } else {
        return res.status(401).json({"response": "not logged in"});
    }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});