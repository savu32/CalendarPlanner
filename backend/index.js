import 'dotenv/config';
const PORT = process.env.PORT || 3001;

import express from 'express';
const app = express();
import cors from 'cors';
app.use(cors());
app.use(express.json());

import { query } from './db.js';
import argon2 from 'argon2';

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

app.get('/api/notes/list', async (req, res) => {
    const verifiedData = await parseToken(req.headers);
    if (verifiedData === undefined || verifiedData.user_id === undefined) {
        return res.status(400).json({"error": "token expired"});
    }
    const user_id = verifiedData.user_id;

    const content = req.query;
    if (content.year === undefined ||
          content.month === undefined || 
          content.day === undefined){
              res.status(400).json({"error":"invalid request parameters"});
    }
    // get notes from db
    console.log(content.year)
    const notes = await listNotes(user_id, content.year,
                                        content.month, content.day, res);
    // console.log(notes);

    return notes

    const notes1 = [
      { id: 1, content: 'First note' },
      { id: 2, content: 'Second note' },
      { id: 3, content: 'First note' },
      { id: 4, content: 'Second note' },
    ];
    // res.status(200).json(notes);
});

const listNotes = async (user_id, year, month, day, res) => {
    const notes = "SELECT * FROM notes WHERE \
                    user_id = $1 and year = $2 and month = $3 and day = $4";
    try {
        const result = await query(notes, [user_id, year, month, day]);
        return res.status(200).json({"response": `notes, ${JSON.stringify(result)}`});
    } catch (err) {
        console.log(err)
        return res.status(400).json({"error": "list notes failed"});
    }
}

app.post('/api/notes/create', async (req, res) => {
    const verifiedData = await parseToken(req.headers);
    if (verifiedData === undefined || verifiedData.user_id === undefined) {
        return res.status(400).json({"error": "token expired"});
    }
    const user_id = verifiedData.user_id;

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

app.post('/api/signup', async (req, res) => {
    const content = req.body;
    console.log(content)
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
    if (verifiedData !== undefined && verifiedData.user_id !== undefined) {
        const usernameQuery = "SELECT username FROM users WHERE user_id = $1";
        const usernameRow = await query(usernameQuery, [verifiedData.user_id]);
        if (usernameRow !== undefined) {
            const username = usernameRow.rows[0].username
            res.status(200).json({"response": `username: ${username}`});
        } else {
            res.status(200).json({"response": "invalid token"});
        }
    } else {
        res.status(200).json({"response": "not logged in"});
    }
});

const parseToken = async (headers) => {
    const authHeader = headers.authorization;
    const authorizationToken = authHeader?.split(' ')[1];
    console.log(headers)
    try {
        const verifiedData = await jwt.verify(authorizationToken, process.env.JWT_SECRET);
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

app.post('/api/login', async (req, res) => {
    const content = req.body;
    if (content.username === undefined || 
        content.password === undefined){
            res.status(400).json({"error":"invalid request parameters"});
    }
    
    const exists = "SELECT * FROM users WHERE username = $1";
    const existsResult = await query(exists, [content.username]);
    if (existsResult.rows.length !== 0) {
        const hash = existsResult.rows[0].password;
        const isCorrect = await argon2.verify(hash, content.password);
        const user_id = existsResult.rows[0].user_id;
        if (isCorrect) {
            // const JWT_SECRET = crypto.randomBytes(32).toString('hex');
            // console.log(typeof JWT_SECRET) 
            const token = jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.status(200).json({"response": `logged in: ${content.username}`, "token": token});
        }
    }
    return res.status(400).json({"error": `username or password is incorrect`});
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});