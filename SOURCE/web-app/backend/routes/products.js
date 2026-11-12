const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/search', async (req, res) => {
    const { q } = req.query;

    if (process.env.MODE === 'vulnerable') {
        const query = `SELECT id, name, description, price FROM products WHERE name LIKE '%${q}%'`;
        const [rows] = await pool.query(query);
        return res.json(rows);
    }

    const [rows] = await pool.query(
        'SELECT id, name, description, price FROM products WHERE name LIKE ?',
        [`%${q}%`]
    );
    res.json(rows);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    // Validate input: chỉ cho phép số nguyên
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    if (process.env.MODE === 'vulnerable') {
        const query = `SELECT * FROM products WHERE id = ${id}`;
        const [rows] = await pool.query(query);
        return res.json(rows[0] || {});
    }
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0] || {});
});

module.exports = router;