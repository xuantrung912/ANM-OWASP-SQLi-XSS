const express = require('express');
const app = express();
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

app.use((err, req, res, next) => {
    console.error(err); // vẫn log đầy đủ ra console để debug, chỉ ẩn với người dùng
    if (process.env.MODE === 'vulnerable') {
        return res.status(500).json({ error: err.sqlMessage || err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(3000, () => console.log(`Server chạy ở chế độ ${process.env.MODE}`));

app.use((err, req, res, next) => {
    if (process.env.MODE === 'vulnerable') {
        return res.status(500).json({ error: err.sqlMessage || err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
});