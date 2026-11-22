/**
 * SOURCE/web-app/secure/config/session/session_security.js
 * Cấu hình khởi tạo và quản lý Session Cookie cho ứng dụng Node.js Express (VulnShop)
 * Thành viên thực hiện: Thành viên 2 (Frontend & XSS Security Specialist)
 * Đồng bộ và tích hợp hoàn toàn với Backend Express / MySQL của Thành viên 1.
 *
 * TIÊU CHUẨN ĐỐI CHIẾU:
 * - OWASP Session Management Cheat Sheet
 * - OWASP Cross-Site Scripting (XSS) Prevention Cheat Sheet (Defense-in-Depth via HttpOnly & CSP)
 */

const session = require('express-session');

/**
 * Cấu hình middleware express-session tùy biến theo chế độ hệ thống:
 * - Chế độ VULNERABLE: Cờ httpOnly = false cho phép JavaScript đọc được document.cookie,
 *   phục vụ kịch bản tấn công Stored XSS & Cookie Stealer (Session Hijacking).
 * - Chế độ SECURE: Cờ httpOnly = true ngăn chặn tuyệt đối việc đọc cookie bằng JavaScript,
 *   bảo vệ phiên làm việc của Quản trị viên và người dùng ngay cả khi có lỗ hổng render.
 *
 * @param {string} mode - 'vulnerable' hoặc 'secure'
 * @returns {Function} Express session middleware
 */
function configureSession(mode = 'secure') {
    const isSecureMode = (mode === 'secure');

    return session({
        name: 'session_id', // Tên cookie quản lý phiên
        secret: process.env.SESSION_SECRET || (isSecureMode ? 'vulnshop_prod_secret_auth_key_uth_2026' : 'lab_insecure_key'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            path: '/',
            maxAge: 24 * 60 * 60 * 1000, // 24 giờ hiệu lực

            // [CƠ CHẾ PHÒNG VỆ CỐT LÕI CHỐNG XSS COOKIE THEFT]:
            // - SECURE: httpOnly = true (Trình duyệt chặn document.cookie đối với JS)
            // - VULNERABLE: httpOnly = false (Mã độc XSS có thể gửi cookie về Attacker port 8888)
            httpOnly: isSecureMode,

            // Cờ SameSite chống CSRF:
            sameSite: isSecureMode ? 'lax' : false,

            // Cờ Secure (chỉ bật khi triển khai HTTPS production):
            secure: process.env.NODE_ENV === 'production'
        }
    });
}

/**
 * Middleware bổ sung các tiêu đề bảo mật HTTP (Security Headers / CSP)
 * @param {string} mode - 'vulnerable' hoặc 'secure'
 */
function securityHeaders(mode = 'secure') {
    const isSecureMode = (mode === 'secure');

    return (req, res, next) => {
        if (isSecureMode) {
            // Chính sách bảo vệ tài nguyên nội dung CSP
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self' https://images.unsplash.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' https: data:; object-src 'none';"
            );
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('X-XSS-Protection', '1; mode=block');
        } else {
            // Vulnerable mode: Không kích hoạt CSP để minh họa XSS hoạt động
            res.removeHeader('Content-Security-Policy');
            res.removeHeader('X-Content-Type-Options');
        }
        next();
    };
}

module.exports = {
    configureSession,
    securityHeaders
};
