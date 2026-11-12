const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (process.env.MODE === 'vulnerable') {
        // CỐ Ý KHÔNG dùng tham số hóa — chỉ phục vụ demo lỗ hổng SQLi trong môi trường lab cô lập
        const query = `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`;
        const [rows] = await pool.query(query);
        if (rows.length > 0) return res.json({ success: true, user: rows[0] });
        return res.status(401).json({ success: false });
    }

    // Bản an toàn — Parameterized Query
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );
    if (rows.length === 0) return res.status(401).json({ success: false });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ success: false });

    res.json({ success: true, user: { id: rows[0].id, username: rows[0].username } });
});

module.exports = router;