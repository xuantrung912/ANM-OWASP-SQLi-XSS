const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Phục vụ giao diện tĩnh Frontend (TV2)
const frontendPath = fs.existsSync(path.join(__dirname, '../frontend'))
    ? path.join(__dirname, '../frontend')
    : path.join(__dirname, 'frontend');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
}

const securePath = path.join(__dirname, '../secure');
if (fs.existsSync(securePath)) {
    app.use('/secure', express.static(securePath));
}

const vulnPath = path.join(__dirname, '../vulnerable');
if (fs.existsSync(vulnPath)) {
    app.use('/vulnerable', express.static(vulnPath));
}

// 2. Các API routes của Backend (TV1)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// 3. Xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error(err); // vẫn log đầy đủ ra console để debug, chỉ ẩn với người dùng
    if (process.env.MODE === 'vulnerable') {
        return res.status(500).json({ error: err.sqlMessage || err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy ở cổng ${PORT}, chế độ ${process.env.MODE || 'secure'}`));