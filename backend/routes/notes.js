import express from 'express';
const router = express.Router();

import parseToken from '../utils/parseToken.js';
import { query } from '../db.js';

router.get('/list', async (req, res) => {
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
    const listNotes = async (user_id, year, month, day, res) => {
        const notes = "SELECT * FROM notes WHERE \
                        user_id = $1 and year = $2 and month = $3 and day = $4";
        try {
            const result = await query(notes, [user_id, year, month, day]);
            return res.status(200).json({"response": `${JSON.stringify(result.rows)}`});
        } catch (err) {
            return res.status(400).json({"error": "list notes failed"});
        }
    }
    return await listNotes(user_id, content.year,
                            content.month, content.day, res);
});

router.post('/create', async (req, res) => {
    const verifiedData = await parseToken(req.headers);
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

    return await createNote(user_id, content.year, content.month,
                                    content.day, content.note, res);
});

router.post('/delete', async (req, res) => {
    const verifiedData = await parseToken(req.headers);
    if (verifiedData === undefined || verifiedData.userId === undefined) {
        return res.status(401).json({"error": "token expired"});
    }
    const user_id = verifiedData.userId;

    const content = req.body;
    if (user_id === undefined ||
        content.note_id === undefined){
            return res.status(400).json({"error":"invalid request parameters"});
    }

    console.log(user_id, content.note_id)
    
    const deleteNote = async (user_id, note_id, res) => {
        const deleteCmd = `DELETE 
                        FROM notes 
                        WHERE user_id = $1 AND note_id = $2
                        RETURNING *`;

        try {
            const deleteResult = await query(deleteCmd, [user_id, note_id]);
            return res.status(200).json({"response": `note deleted`});
        } catch (err) {
            return res.status(400).json({"error": `note delete failed ${err}`});
        }
    }

    return await deleteNote(user_id, content.note_id, res);
});

export default router;