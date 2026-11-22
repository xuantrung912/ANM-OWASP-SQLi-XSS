const express = require('express');
const router = express.Router();
const pool = require('../db');

// Tra cứu vận đơn / đơn hàng (Hỗ trợ kiểm thử SQLi của TV1 và làm cầu nối DOM XSS của TV2)
router.get('/track', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Vui lòng cung cấp mã đơn hàng' });
    }

    try {
        if (process.env.MODE === 'vulnerable') {
            // [VULNERABLE MODE - SQLi do TV1 xây dựng]: Nối chuỗi trực tiếp, dễ bị Blind / Error SQLi
            const query = `SELECT o.id, o.user_id, o.total, o.created_at, u.username FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = '${code}'`;
            const [rows] = await pool.query(query);
            if (rows.length > 0) {
                return res.json({ success: true, order: rows[0] });
            }
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // [SECURE MODE]: Parameterized query an toàn
        const [rows] = await pool.query(
            'SELECT o.id, o.user_id, o.total, o.created_at, u.username FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
            [code]
        );
        if (rows.length > 0) {
            return res.json({ success: true, order: rows[0] });
        }
        res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    } catch (err) {
        console.error('Lỗi tra cứu đơn hàng:', err);
        if (process.env.MODE === 'vulnerable') {
            return res.status(500).json({ error: err.sqlMessage || err.message });
        }
        res.status(500).json({ error: 'Lỗi máy chủ khi tra cứu' });
    }
});

module.exports = router;
