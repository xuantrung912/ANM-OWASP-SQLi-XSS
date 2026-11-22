const express = require('express');
const router = express.Router();
const pool = require('../db');

// Lấy danh sách bình luận theo sản phẩm
router.get('/', async (req, res) => {
    const productId = req.query.product_id || 1;
    try {
        const [rows] = await pool.query(
            'SELECT id, product_id, author, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY id DESC',
            [productId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Lỗi truy vấn reviews:', err);
        res.status(500).json({ error: 'Không thể tải bình luận' });
    }
});

// Gửi bình luận mới (Bề mặt thử nghiệm Stored XSS do TV2 phụ trách)
router.post('/', async (req, res) => {
    const { product_id, author, rating, comment } = req.body;
    const pid = parseInt(product_id, 10) || 1;
    const rate = parseInt(rating, 10) || 5;
    const safeAuthor = String(author || 'Khách vãng lai').slice(0, 100);
    const commentContent = String(comment || '');

    if (!commentContent.trim()) {
        return res.status(400).json({ error: 'Nội dung bình luận không được để trống' });
    }

    try {
        if (process.env.MODE === 'vulnerable') {
            // [VULNERABLE MODE]: Lưu trực tiếp comment thô vào CSDL để minh họa Stored XSS
            const query = `INSERT INTO reviews (product_id, author, rating, comment) VALUES (${pid}, '${safeAuthor.replace(/'/g, "''")}', ${rate}, '${commentContent.replace(/'/g, "''")}')`;
            await pool.query(query);
            return res.json({ success: true, message: 'Đã lưu bình luận (Chế độ Vulnerable - Có thể chứa payload Stored XSS)' });
        }

        // [SECURE MODE]: Parameterized query an toàn
        await pool.query(
            'INSERT INTO reviews (product_id, author, rating, comment) VALUES (?, ?, ?, ?)',
            [pid, safeAuthor, rate, commentContent]
        );
        res.json({ success: true, message: 'Đã gửi bình luận thành công (Chế độ Secure)' });
    } catch (err) {
        console.error('Lỗi lưu review:', err);
        res.status(500).json({ error: 'Lỗi máy chủ khi lưu bình luận' });
    }
});

module.exports = router;
