import express from 'express';
const router = express.Router();

import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../utils/db.js';

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',          // cookie is only sent to routes under this path
  maxAge: REFRESH_MS,
};

const hash = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

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
        console.log(token)
    } catch (err) {
        res.status(400).json({"error": `refresh token issue failed ${err}`});
    }
}

router.post('/refresh', async (req, res) => {
    const token = req.cookies.refreshToken;
    console.log(req.cookies)
    if (!token) {
        return res.status(401).json({ error: 'No refresh token' });
    } 

    // do not cycle tokens used within 5 seconds to handle duplicate refreshes on re-mounts
    const recently_used = await query(
        `UPDATE refresh_tokens
        SET used_at = COALESCE(used_at, now())
        WHERE token_hash = $1
            AND expires_at > now()
            AND (used_at IS NULL OR now() < used_at + interval '5 seconds') 
        RETURNING user_id, expires_at`,
        [hash(token)]
    );
    if (recently_used.rows.length !== 0) {
        const userId = recently_used.rows[0].user_id;
        const user = await query('SELECT user_id, username FROM users WHERE user_id = $1', [userId]);
        res.json({ token: signAccess(userId), user: user.rows[0] });
        return res;
    }

    const to_refresh = await query(
        `SELECT *
        FROM refresh_tokens
        WHERE token_hash = $1
            AND expires_at > now()
            AND (used_at IS NOT NULL AND now() > used_at + interval '5 seconds')`,
        [hash(token)]
    );
    if (to_refresh.rows.length === 0) {
        res.clearCookie('refreshToken', { path: cookieOpts.path });
        return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // has valid refresh token
    const userId = to_refresh.rows[0].user_id;
    const user = await query('SELECT user_id, username FROM users WHERE user_id = $1', [userId]);
    await issueRefreshToken(res, userId)
    res.json({ token: signAccess(userId), user: user.rows[0] });
});

router.post('/login', async (req, res) => {
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
            res.status(200).json({"response": `${content.username} ${token}`});
            return;
        }
    }
    return res.status(400).json({"error": `username or password is incorrect`});
});

router.post('/logout', async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash(token)]);
    res.clearCookie('refreshToken', { path: cookieOpts.path });
    res.status(204).send();
});

router.post('/signup', async (req, res) => {
    const content = req.body;
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

const checkUserExists = async (username) => {
    const exists = "SELECT * FROM users WHERE username = $1";
    const existsResult = await query(exists, [username]);

    return existsResult.rows.length !== 0;
}

router.get('/me', async (req, res) => {
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

export default router;