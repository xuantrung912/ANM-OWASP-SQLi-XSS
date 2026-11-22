const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (process.env.MODE === 'vulnerable') {
            // CỐ Ý KHÔNG dùng tham số hóa — chỉ phục vụ demo lỗ hổng SQLi trong môi trường lab cô lập
            const query = `SELECT * FROM users WHERE username = '${username}' AND password_hash = '${password}'`;
            const [rows] = await pool.query(query);
            if (rows.length > 0) {
                // Khởi tạo phiên làm việc trong session
                if (req.session) {
                    req.session.user = {
                        id: rows[0].id,
                        username: rows[0].username,
                        is_admin: Boolean(rows[0].is_admin)
                    };
                }
                return res.json({ success: true, user: rows[0] });
            }
            return res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
        }

        // Bản an toàn — Parameterized Query
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập' });

        const match = await bcrypt.compare(password, rows[0].password_hash);
        if (!match) return res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập' });

        // Khởi tạo phiên an toàn
        if (req.session) {
            req.session.user = {
                id: rows[0].id,
                username: rows[0].username,
                is_admin: Boolean(rows[0].is_admin)
            };
        }

        res.json({
            success: true,
            user: { id: rows[0].id, username: rows[0].username, is_admin: rows[0].is_admin }
        });
    } catch (err) {
        console.error('Lỗi trong auth/login:', err);
        if (process.env.MODE === 'vulnerable') {
            return res.status(500).json({ error: err.sqlMessage || err.message });
        }
        res.status(500).json({ error: 'Lỗi xác thực người dùng' });
    }
});

router.get('/me', (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ authenticated: true, user: req.session.user });
    }
    res.json({ authenticated: false, user: null });
});

router.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.json({ success: true, message: 'Đã đăng xuất' });
        });
    } else {
        res.json({ success: true });
    }
});

module.exports = router;
