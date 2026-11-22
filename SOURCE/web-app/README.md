# Ứng Dụng TMĐT Giả Lập VulnShop (ANM-OWASP-SQLi-XSS)

Dự án Bài tập lớn môn An ninh mạng: Khai thác và khắc phục lỗ hổng SQL Injection & Cross-Site Scripting (XSS).

## Phân công nhóm
- **Thành viên 1 (TV1):** Backend API (Node.js/Express), CSDL MySQL, khai thác và vá lỗ hổng SQL Injection.
- **Thành viên 2 (TV2):** Frontend giao diện TMĐT, kịch bản khai thác XSS (Reflected, Stored, DOM), máy chủ Cookie Stealer, và giải pháp phòng vệ XSS đa lớp (Output Encoding, DOMPurify, CSP, Session Security).

---

## 1. Cấu trúc thư mục `SOURCE/web-app/`
```text
SOURCE/web-app/
├── backend/                  # [TV1] Node.js Express API & kết nối CSDL MySQL
│   ├── routes/               # Routes xác thực (/api/auth), sản phẩm (/api/products), bình luận (/api/reviews), vận đơn (/api/orders)
│   ├── db.js                 # Pool kết nối MySQL
│   ├── server.js             # Entrypoint chính (cổng 3000)
│   ├── Dockerfile            # Container Node.js
│   └── package.json
├── frontend/                 # [TV2] Giao diện người dùng Web TMĐT
│   ├── index.html            # Trang chủ hiển thị danh mục sản phẩm
│   ├── login.html            # Trang đăng nhập
│   ├── product_detail.html   # Chi tiết sản phẩm & bình luận đánh giá
│   ├── cart.html             # Giỏ hàng & thanh toán
│   ├── profile.html          # Hồ sơ cá nhân người dùng
│   ├── order_track.html      # Tra cứu vận đơn (Điểm kiểm thử DOM XSS)
│   ├── style.css             # Giao diện responsive hiện đại
│   └── app.js                # Xử lý tương tác client-side an toàn
├── secure/                   # [TV2] Module phòng vệ XSS nâng cao
│   ├── secure_encoder.js     # Thư viện Context-aware Output Encoding (OWASP)
│   ├── dompurify.min.js      # Bộ lọc DOMPurify chế độ Allowlist
│   ├── secure_review_component.html
│   └── config/session/       # Cấu hình an toàn phiên làm việc
└── vulnerable/               # [TV2] Module phục vụ minh họa lỗ hổng XSS
    ├── vulnerable_review_component.html
    ├── vulnerable_order_track.html
    └── vulnerable_profile.html
```

---

## 2. Hướng dẫn khởi chạy hệ thống
```bash
# Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up --build -d
```
- **Backend API:** `http://localhost:3000`
- **Chế độ kiểm thử (MODE):** Thay đổi `MODE=vulnerable` hoặc `MODE=secure` trong `docker-compose.yml`.

### Tài khoản mẫu
- `admin` / `123456` (hoặc `Admin@123`)
- `alice` / `123456`
- `bob`   / `123456`

---

## 3. Khởi chạy máy chủ Attacker Cookie Stealer (TV2)
Phục vụ kịch bản Stored XSS đánh cắp Session Cookie:
```bash
python SOURCE/exploits/cookie_stealer/stealer.py
```
- Lắng nghe tại: `http://localhost:8888/`
- Endpoint thu thập cookie: `http://localhost:8888/log?cookie=<COOKIE>`
