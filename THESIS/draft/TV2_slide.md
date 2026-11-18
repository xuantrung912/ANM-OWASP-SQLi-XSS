# TỔNG HỢP NỘI DUNG 9 SLIDE THUYẾT TRÌNH BÀI TẬP LỚN - THÀNH VIÊN 2
**Trường Đại học Giao thông vận tải TP.HCM (UTH)**  
**Đề tài:** Khai thác lỗ hổng Web (OWASP Top 10) & Giải pháp khắc phục: SQL Injection & XSS  
**Thành viên thực hiện:** Thành viên 2 (Frontend & XSS Security Specialist)  
**Quy chuẩn định dạng:** Template UTH, Tiêu đề cỡ 32, Nội dung cỡ 26, tối đa 5 dòng/slide.  

---

### SLIDE 8: LÝ THUYẾT XSS - CƠ CHẾ VÀ NGUYÊN NHÂN PHÁT SINH (CWE-79)
- **Tiêu đề (Cỡ 32):** Lỗ Hổng Cross-Site Scripting (XSS - CWE-79)
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. XSS xảy ra khi ứng dụng web in trực tiếp dữ liệu người dùng ra HTML mà không kiểm tra hoặc mã hóa.
  2. Trình duyệt không phân biệt được mã kịch bản hợp pháp với mã độc, tự động thực thi dưới quyền nạn nhân.
  3. XSS thuộc nhóm rủi ro hàng đầu **A03:2021 – Injection** trong bảng xếp hạng OWASP Top 10.
  4. Hậu quả: Đánh cắp phiên làm việc, giả mạo danh tính, thay đổi giao diện và chuyển hướng độc hại.

---

### SLIDE 9: PHÂN LOẠI 3 DẠNG XSS & CƠ CHẾ CƯỚP SESSION COOKIE
- **Tiêu đề (Cỡ 32):** Phân Loại XSS & Cơ Chế Cướp Phiên (Session Hijacking)
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. **Reflected XSS:** Kịch bản độc hại phản xạ ngay trong phản hồi HTTP (qua URL tìm kiếm).
  2. **Stored XSS:** Mã độc lưu vĩnh viễn trong CSDL (bình luận), tự động kích hoạt khi người khác xem.
  3. **DOM-based XSS:** Khai thác hoàn toàn phía Client qua `location.hash` và sink `innerHTML`.
  4. **Cơ chế cướp phiên:** JavaScript đọc `document.cookie` gửi về Webhook do thiếu cờ **HttpOnly**.

---

### SLIDE 22: GIAO DIỆN TMĐT VÀ BỀ MẶT TẤN CÔNG XSS (VULNSHOP)
- **Tiêu đề (Cỡ 32):** Giao Diện VulnShop & Khảo Sát Bề Mặt XSS
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. Xây dựng giao diện sàn TMĐT chuẩn: Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Hồ sơ và Vận đơn.
  2. **Điểm nhập 1:** Thanh tìm kiếm `/search?q=...` (Nguy cơ Reflected XSS).
  3. **Điểm nhập 2:** Form bình luận `/product?id=...` & Hồ sơ `/profile` (Nguy cơ Stored XSS).
  4. **Điểm nhập 3:** Tra cứu mã vận đơn `/order-track#...` (Nguy cơ DOM-based XSS).

---

### SLIDE 23: DEMO REFLECTED XSS QUA THANH TÌM KIẾM SẢN PHẨM
- **Tiêu đề (Cỡ 32):** Demo 1: Khai Thác Reflected XSS (/search)
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. Kẻ tấn công gửi liên kết tìm kiếm chứa thẻ script: `<script>alert('Reflected_XSS')</script>`.
  2. Máy chủ VulnShop ở chế độ Vulnerable phản xạ nguyên văn payload ra thẻ `<h1>`.
  3. Trình duyệt nạn nhân biên dịch mã và bật popup cảnh báo ngay lập tức.
  4. Tác động: Kẻ tấn công có thể lừa nạn nhân nhấp link để đánh cắp token hoặc phishing.

---

### SLIDE 24: DEMO STORED XSS QUA BÌNH LUẬN & ĐÁNH GIÁ SẢN PHẨM
- **Tiêu đề (Cỡ 32):** Demo 2: Khai Thác Stored XSS (/product)
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. Kẻ tấn công gửi bình luận chứa mã JavaScript độc hại tại trang chi tiết sản phẩm.
  2. Chuỗi kịch bản được lưu trữ vĩnh viễn vào bảng `reviews` trong cơ sở dữ liệu.
  3. Bất kỳ ai vào xem sản phẩm đều bị thực thi mã độc một cách hoàn toàn thụ động.
  4. Lỗ hổng tồn tại do giao diện render bình luận bằng thuộc tính không an toàn `innerHTML`.

---

### SLIDE 25: DEMO CƯỚP COOKIE ADMIN & GIẢ MẠO PHIÊN (SESSION HIJACKING)
- **Tiêu đề (Cỡ 32):** Demo 3: Đánh Cắp Cookie Admin & Giả Mạo Phiên
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. Payload Stored XSS âm thầm đọc `document.cookie` và gửi về Logger cổng 8888.
  2. Quản trị viên truy cập trang `/admin`, mã độc kích hoạt ngầm trong phiên của Admin.
  3. Máy chủ Attacker nhận được Session ID của Admin tại tab `/attacker-logs`.
  4. Kẻ tấn công chạy script giả mạo phiên, đột nhập trang Quản trị thành công không cần mật khẩu.

---

### SLIDE 26: DEMO DOM-BASED XSS QUA THAM SỐ URL HASH
- **Tiêu đề (Cỡ 32):** Demo 4: Khai Thác DOM-based XSS (/order-track)
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. Kẻ tấn công lợi dụng Source Client-side: `window.location.hash`.
  2. Chèn payload qua URL: `/order-track#<img src=x onerror=alert('DOM_XSS')>`.
  3. Script frontend lấy hash và gán thẳng vào DOM Sink nguy hiểm `innerHTML`.
  4. Mã độc chạy trực tiếp trên trình duyệt mà không hề gửi lên Web Server hay WAF.

---

### SLIDE 27: GIẢI PHÁP PHÒNG THỦ TOÀN DIỆN TẦNG ỨNG DỤNG
- **Tiêu đề (Cỡ 32):** Giải Pháp Phòng Thủ XSS Phía Ứng Dụng
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. **Mã hóa đầu ra:** Dùng `html.escape()` chuyển `<script>` thành text thô `&lt;script&gt;`.
  2. **An toàn DOM:** Thay thế toàn bộ `innerHTML` bằng thuộc tính an toàn `textContent`.
  3. **Làm sạch HTML:** Tích hợp thư viện `DOMPurify` loại bỏ thẻ và sự kiện độc hại.
  4. **Bảo vệ Cookie:** Bật cờ **HttpOnly** chặn đứng 100% nguy cơ cướp phiên qua XSS.

---

### SLIDE 28: KẾT QUẢ KIỂM THỬ LẠI & ĐỐI CHIẾU TRƯỚC/SAU KHI VÁ
- **Tiêu đề (Cỡ 32):** Kết Quả Kiểm Thử Lại (Re-test Comparison)
- **Nội dung chính (Cỡ 26, tối đa 5 dòng):**
  1. Toàn bộ payload Reflected, Stored và DOM XSS đều bị vô hiệu hóa khi bật SECURE.
  2. Script hiển thị dưới dạng văn bản thuần túy, không có popup hay mã ngầm thực thi.
  3. Cờ **HttpOnly** bảo vệ thành công: `document.cookie` trả về rỗng đối với JavaScript.
  4. Đánh giá: Hệ thống đạt chuẩn an toàn theo OWASP XSS Prevention Cheat Sheet.
