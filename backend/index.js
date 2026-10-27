import 'dotenv/config';
const PORT = process.env.PORT || 3001;

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
import argon2 from 'argon2';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

app.get('/api/notes/list', async (req, res) => {
    const verifiedData = await parseToken(req.headers);
    if (verifiedData === undefined || verifiedData.userId === undefined) {
        return res.status(401).json({"error": "token expired"});
    }
    const user_id = verifiedData.userId;

    const content = req.query;
    if (content.year === undefined ||
          content.month === undefined || 
          content.day === undefined){
              res.status(400).json({"error":"invalid request parameters"});
    }
    // get notes from db
    const notesResponse = await listNotes(user_id, content.year,
                                        content.month, content.day, res);

    return notesResponse;

    // const notes1 = [
    //   { id: 1, content: 'First note' },
    //   { id: 2, content: 'Second note' },
    //   { id: 3, content: 'First note' },
    //   { id: 4, content: 'Second note' },
    // ];
    // res.status(200).json(notes);
});

const listNotes = async (user_id, year, month, day, res) => {
    const notes = "SELECT * FROM notes WHERE \
                    user_id = $1 and year = $2 and month = $3 and day = $4";
    try {
        const result = await query(notes, [user_id, year, month, day]);
        // console.log("result", result.rows);
        return res.status(200).json({"response": `${JSON.stringify(result.rows)}`});
    } catch (err) {
        return res.status(400).json({"error": "list notes failed"});
    }
}

app.post('/api/notes/create', async (req, res) => {
    console.log('create')
    const verifiedData = await parseToken(req.headers);
    console.log("req",verifiedData)
    if (verifiedData === undefined || verifiedData.userId === undefined) {
        return res.status(401).json({"error": "token expired"});
    }
    const user_id = verifiedData.userId;

    const content = req.body;
    if (user_id === undefined ||
        content.year === undefined || 
        content.month === undefined || 
        content.day === undefined || 
        content.note === undefined){
            return res.status(400).json({"error":"invalid request parameters"});
    }
    const create = await createNote(user_id, content.year, content.month,
                                    content.day, content.note, res);
    // console.log(content)
    return create;
});

const createNote = async (user_id, year, month, day, note, res) => {
    const create = "CREATE TABLE IF NOT EXISTS notes ( \
                        note_id SERIAL PRIMARY KEY, \
                        user_id INTEGER NOT NULL REFERENCES users(user_id), \
                        year INTEGER NOT NULL, \
                        month INTEGER NOT NULL, \
                        day INTEGER NOT NULL, \
                        content VARCHAR(1000) NOT NULL, \
                        created_at DATE NOT NULL \
                    )"
    const createResult = await query(create, [])

    const insert = "INSERT INTO notes (user_id, year, month, day, content, created_at) \
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

    try {
        const insertResult = await query(insert, [user_id, year, month, day, note, new Date()]);
        return res.status(200).json({"response": `note created`});
    } catch (err) {
        return res.status(400).json({"error": `note create failed ${err}`});
    }
}

const hash = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',          // cookie is only sent to routes under this path
  maxAge: REFRESH_MS,
};

const signAccess = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

const issueRefreshToken = async (res, user_id) => {
    const create = "CREATE TABLE IF NOT EXISTS refresh_tokens ( \
                        key_id SERIAL PRIMARY KEY, \
                        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, \
                        token_hash TEXT NOT NULL UNIQUE, \
                        used_at TIMESTAMPTZ, \
                        expires_at DATE NOT NULL \
                    )"
    const createResult = await query(create, [])

    const insert = "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) \
                                        VALUES ($1, $2, $3) RETURNING *";
    const token = crypto.randomBytes(48).toString('hex');
    try {
        console.log("HASH", hash(token))
        const insertResult = await query(insert, [user_id, hash(token), new Date(Date.now() + REFRESH_MS)]);
        res.cookie('refreshToken', token, cookieOpts);   // Set-Cookie header
    } catch (err) {
        res.status(400).json({"error": `refresh token issue failed ${err}`});
    }
}

app.post('/api/auth/refresh', async (req, res) => {
    console.log("cookies", req.cookies)
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    // const result = await query(
    //     'DELETE FROM refresh_tokens WHERE token_hash = $1' + 
    //                     'AND expires_at > now() RETURNING user_id',
    //     [hash(token)]
    // );

    const result = await query(
        `SELECT *
        FROM refresh_tokens
        WHERE token_hash = $1
            AND expires_at > now()`,
        [hash(token)]
    );
    if (result.rows.length === 0) {
        res.clearCookie('refreshToken', { path: cookieOpts.path });
        return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // has valid refresh token
    const userId = result.rows[0].user_id;
    const user = await query('SELECT user_id, username FROM users WHERE user_id = $1', [userId]);
    res.json({ token: signAccess(userId), user: user.rows[0] });
});

app.post('/api/auth/logout', async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash(token)]);
    res.clearCookie('refreshToken', { path: cookieOpts.path });
    res.status(204).send();
});

app.post('/api/signup', async (req, res) => {
    const content = req.body;
    if (content.username === undefined || 
        content.password === undefined){
            res.status(400).json({"error":`invalid request parameters: ${content}`});
    }
    // check if username already in use
    const exists = await checkUserExists(content.username) === true;
    if (exists) {
        return res.status(400).json({"error":`username ${content.username} already in use`});
    } else {
        // create account
        const insert = "INSERT INTO users (username, password, created_at) VALUES ($1, $2, $3)";
        const hash = await argon2.hash(content.password);
        await query(insert, [content.username, hash, new Date()])
        return res.status(200).json({"response": `account created: ${JSON.stringify(content)})`});
    }

});

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

const parseToken = async (headers) => {
    const authHeader = headers.authorization;
    const authorizationToken = authHeader?.split(' ')[1];
    try {
        const verifiedData = jwt.verify(authorizationToken, process.env.JWT_SECRET);
        return verifiedData;
    } catch (err) {
        return undefined;
    }
}

const checkUserExists = async (username) => {
    const create = "CREATE TABLE IF NOT EXISTS users ( \
                        user_id SERIAL PRIMARY KEY, \
                        username VARCHAR(40) UNIQUE NOT NULL, \
                        password VARCHAR(120) NOT NULL, \
                        created_at DATE NOT NULL \
                    )"
    const createResult = await query(create, [])

    const exists = "SELECT * FROM users WHERE username = $1";
    const existsResult = await query(exists, [username]);

    return existsResult.rows.length !== 0;
}

app.post('/api/auth/login', async (req, res) => {
    const content = req.body;
    if (content.username === undefined || 
        content.password === undefined){
            return res.status(400).json({"error":"invalid request parameters"});
    }
    
    const exists = "SELECT * FROM users WHERE username = $1";
    const existsResult = await query(exists, [content.username]);
    if (existsResult.rows.length !== 0) {
        const hash = existsResult.rows[0].password;
        const isCorrect = await argon2.verify(hash, content.password);
        const user_id = existsResult.rows[0].user_id;
        if (isCorrect) {
            await issueRefreshToken(res, user_id);
            const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.status(200).json({"response": `${content.username} ${token}`});
        }
    }
    return res.status(400).json({"error": `username or password is incorrect`});
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});