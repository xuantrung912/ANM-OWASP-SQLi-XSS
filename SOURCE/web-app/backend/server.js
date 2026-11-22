const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

// Tích hợp module quản lý Session an toàn & CSP do TV2 phát triển
const sessionSecPath = fs.existsSync(path.join(__dirname, '../secure/config/session/session_security.js'))
    ? path.join(__dirname, '../secure/config/session/session_security.js')
    : path.join(__dirname, 'secure/config/session/session_security.js');
const { configureSession, securityHeaders } = require(sessionSecPath);

const app = express();
const currentMode = process.env.MODE || 'secure';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Quản lý Session Cookie & Security Headers (Cờ HttpOnly, CSP, nosniff)
app.use(configureSession(currentMode));
app.use(securityHeaders(currentMode));

// 2. Phục vụ giao diện tĩnh Frontend (TV2)
const frontendPath = fs.existsSync(path.join(__dirname, '../frontend'))
    ? path.join(__dirname, '../frontend')
    : path.join(__dirname, 'frontend');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
}

const securePath = fs.existsSync(path.join(__dirname, '../secure'))
    ? path.join(__dirname, '../secure')
    : path.join(__dirname, 'secure');
if (fs.existsSync(securePath)) {
    app.use('/secure', express.static(securePath));
}

const vulnPath = fs.existsSync(path.join(__dirname, '../vulnerable'))
    ? path.join(__dirname, '../vulnerable')
    : path.join(__dirname, 'vulnerable');
if (fs.existsSync(vulnPath)) {
    app.use('/vulnerable', express.static(vulnPath));
}

// 3. Các API routes chính của hệ thống
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/orders', require('./routes/orders'));

// API trạng thái hệ thống cho Frontend Banner
app.get('/api/system/status', (req, res) => {
    res.json({
        mode: currentMode,
        port: process.env.PORT || 3000,
        user: req.session ? req.session.user : null
    });
});

// Route tìm kiếm Web (Minh họa Reflected XSS trong kịch bản thực nghiệm của TV2)
app.get('/search', async (req, res) => {
    const q = req.query.q || '';
    let products = [];

    if (q) {
        try {
            if (currentMode === 'vulnerable') {
                const query = `SELECT id, name, description, price FROM products WHERE name LIKE '%${q}%'`;
                const [rows] = await pool.query(query);
                products = rows;
            } else {
                const [rows] = await pool.query(
                    'SELECT id, name, description, price FROM products WHERE name LIKE ?',
                    [`%${q}%`]
                );
                products = rows;
            }
        } catch (err) {
            console.error('Lỗi truy vấn SQLi /search:', err.message);
        }
    }

    if (currentMode === 'vulnerable') {
        // [LỖ HỔNG REFLECTED XSS]: Phản xạ trực tiếp tham số q vào mã HTML mà không mã hóa thực thể
        return res.send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Kết Quả Tìm Kiếm (Vulnerable Mode) - VulnShop</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header class="header">
                    <div class="top-bar">
                        <div class="container top-bar-flex">
                            <span style="color:#fca5a5; font-weight:bold;">⚠️ HỆ THỐNG ĐANG Ở CHẾ ĐỘ LỖ HỔNG (VULNERABLE) - PORT 3000</span>
                            <div class="top-links">
                                <a href="/index.html">Trang Chủ</a>
                                <a href="/login.html">Đăng Nhập</a>
                            </div>
                        </div>
                    </div>
                    <nav class="navbar">
                        <div class="container nav-flex">
                            <a href="/index.html" class="logo">🛒 <span>VulnShop</span></a>
                        </div>
                    </nav>
                </header>
                <main class="container main-container" style="margin-top:30px;">
                    <div class="search-card" style="background:white; padding:25px; border-radius:8px; border:1px solid #fca5a5;">
                        <h2 style="color:#b91c1c;">Kết quả tìm kiếm cho: <span>${q}</span></h2>
                        <p style="color:#64748b; font-size:14px;">Bề mặt kiểm thử Reflected XSS (CWE-79) - Tham số q được phản xạ trực tiếp vào DOM không qua encode.</p>
                        
                        <div class="product-grid" style="margin-top:20px;">
                            ${products.length > 0 ? products.map(p => `
                                <div class="card">
                                    <div class="card-body">
                                        <h3 class="card-title">${p.name}</h3>
                                        <p class="price">${Number(p.price).toLocaleString('vi-VN')} đ</p>
                                        <p class="desc">${p.description || ''}</p>
                                        <a href="/product_detail.html?id=${p.id}" class="btn-detail">Xem chi tiết</a>
                                    </div>
                                </div>
                            `).join('') : '<p>Không tìm thấy sản phẩm phù hợp.</p>'}
                        </div>
                    </div>
                </main>
            </body>
            </html>
        `);
    }

    // [SECURE MODE]: Context-aware Output Encoding an toàn
    const safeQ = q.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Kết Quả Tìm Kiếm (Secure Mode) - VulnShop</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <header class="header">
                <div class="top-bar">
                    <div class="container top-bar-flex">
                        <span style="color:#86efac; font-weight:bold;">🛡️ HỆ THỐNG ĐANG Ở CHẾ ĐỘ AN TOÀN (SECURE) - PORT 3000</span>
                        <div class="top-links">
                            <a href="/index.html">Trang Chủ</a>
                            <a href="/login.html">Đăng Nhập</a>
                        </div>
                    </div>
                </div>
                <nav class="navbar">
                    <div class="container nav-flex">
                        <a href="/index.html" class="logo">🛒 <span>VulnShop</span></a>
                    </div>
                </nav>
            </header>
            <main class="container main-container" style="margin-top:30px;">
                <div class="search-card" style="background:white; padding:25px; border-radius:8px; border:1px solid #86efac;">
                    <h2 style="color:#166534;">🛡️ Kết quả tìm kiếm cho: <span>${safeQ}</span></h2>
                    <p style="color:#15803d; font-size:14px;">Đã áp dụng Context-aware Output Encoding (chống Reflected XSS) và Parameterized Query (chống SQLi).</p>
                    
                    <div class="product-grid" style="margin-top:20px;">
                        ${products.length > 0 ? products.map(p => `
                            <div class="card">
                                <div class="card-body">
                                    <h3 class="card-title">${p.name}</h3>
                                    <p class="price">${Number(p.price).toLocaleString('vi-VN')} đ</p>
                                    <p class="desc">${p.description || ''}</p>
                                    <a href="/product_detail.html?id=${p.id}" class="btn-detail">Xem chi tiết</a>
                                </div>
                            </div>
                        `).join('') : '<p>Không tìm thấy sản phẩm phù hợp.</p>'}
                    </div>
                </div>
            </main>
        </body>
        </html>
    `);
});

// Bảng Điều Khiển Quản Trị (Admin Dashboard) - Mục tiêu khai thác Session Hijacking của TV2
app.get('/admin', (req, res) => {
    const user = req.session ? req.session.user : null;
    if (!user || !user.is_admin) {
        return res.status(403).send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><title>403 Yêu Cầu Quyền Quản Trị Viên</title><link rel="stylesheet" href="/style.css"></head>
            <body style="text-align:center; padding:60px; background:#fef2f2;">
                <div class="auth-card" style="max-width:500px; margin:auto;">
                    <h2 style="color:#b91c1c;">403 Forbidden - Yêu Cầu Quyền Quản Trị Viên</h2>
                    <p>Chỉ tài khoản Administrator mới có quyền truy cập trang điều khiển này.</p>
                    <p style="margin-top:20px;"><a href="/login.html" class="btn-primary" style="display:inline-block; padding:8px 16px; text-decoration:none; color:white;">Đăng Nhập Quản Trị</a></p>
                </div>
            </body>
            </html>
        `);
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Bảng Điều Khiển Quản Trị - VulnShop</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body style="background:#f1f5f9;">
            <header class="header">
                <nav class="navbar">
                    <div class="container nav-flex">
                        <a href="/index.html" class="logo">🛒 <span>VulnShop Admin</span></a>
                        <div class="nav-actions">
                            <a href="/index.html" class="btn-secondary">Về Cửa Hàng</a>
                        </div>
                    </div>
                </nav>
            </header>
            <main class="container main-container" style="max-width:850px; margin-top:30px;">
                <div class="auth-card" style="text-align:left;">
                    <h1 style="color:#1e3a8a;">Bảng Điều Khiển Quản Trị (Admin Dashboard)</h1>
                    <p style="font-size:16px;">Tài khoản hiện tại: <b>${user.username}</b></p>
                    
                    <div style="background:#ecfdf5; border-left:4px solid #10b981; padding:15px; margin:20px 0; border-radius:4px;">
                        <h4 style="color:#065f46; margin:0 0 5px 0;">🎉 Xác thực phiên thành công!</h4>
                        <p style="margin:0; font-size:14px; color:#047857;">Bạn đang kiểm soát hệ thống với tư cách Quản trị viên. Kịch bản Session Hijacking qua Stored XSS đã chứng minh kẻ tấn công có thể truy cập trang này chỉ bằng cách đánh cắp chuỗi session_id khi cờ HttpOnly bị tắt.</p>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:20px;">
                        <div style="background:#f8fafc; padding:15px; border-radius:6px; border:1px solid #e2e8f0;">
                            <h3>📊 Thống kê sàn TMĐT</h3>
                            <p>Tổng số đơn hàng: <b>2</b></p>
                            <p>Doanh thu ghi nhận: <b>1.150.000 đ</b></p>
                        </div>
                        <div style="background:#f8fafc; padding:15px; border-radius:6px; border:1px solid #e2e8f0;">
                            <h3>👥 Quản lý bảo mật</h3>
                            <p>Chế độ hệ thống: <b>${currentMode.toUpperCase()}</b></p>
                            <p>Bảo vệ Cookie: <b>${currentMode === 'secure' ? 'HttpOnly: ON' : 'HttpOnly: OFF (Vulnerable)'}</b></p>
                        </div>
                    </div>
                </div>
            </main>
        </body>
        </html>
    `);
});

// Route điều hướng tương thích URL cho các trang giao diện
app.get('/order-track', (req, res) => res.sendFile(path.join(frontendPath, 'order_track.html')));
app.get('/product', (req, res) => {
    const id = req.query.id || 1;
    res.redirect(`/product_detail.html?id=${id}`);
});
app.post('/login', (req, res, next) => {
    // Điều hướng POST /login thẳng tới route auth.js để hỗ trợ form HTML submit trực tiếp
    req.url = '/login';
    return require('./routes/auth')(req, res, next);
});

// 4. Xử lý lỗi tập trung (Giữ nguyên logic của TV1)
app.use((err, req, res, next) => {
    console.error(err);
    if (process.env.MODE === 'vulnerable') {
        return res.status(500).json({ error: err.sqlMessage || err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy ở cổng ${PORT}, chế độ ${process.env.MODE || 'secure'}`));
