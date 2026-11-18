# Báo Cáo Kỹ Thuật Các Điểm Nhập Liệu Chứa Lỗ Hổng (Vulnerable Frontend)
**Người thực hiện:** Thành viên 2 (Frontend & XSS Security Specialist)  
**Mục tiêu:** Bàn giao giao diện chứa các lỗ hổng cố ý theo đúng yêu cầu đề bài.

---

## 1. Danh sách các lỗ hổng giao diện cố ý để lại

| STT | Trang / Module | Cơ chế lỗ hổng | Tệp mã nguồn | Phân loại OWASP |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Bình luận & Đánh giá** | In nội dung bình luận vào DOM bằng `innerHTML` không qua sanitize | `vulnerable_review_component.html` | **Stored XSS** (CWE-79) |
| 2 | **Cập nhật Hồ sơ (Profile)** | Cập nhật và hiển thị Tên hiển thị công khai (Display Name) thô | `vulnerable_profile.html` | **Stored / DOM XSS** (CWE-79) |
| 3 | **Tìm kiếm sản phẩm** | Lấy tham số `q` từ URL in thẳng vào kết quả trang | `vulnerable_search.html` | **Reflected XSS** (CWE-79) |
| 4 | **Tra cứu vận đơn** | Đọc `window.location.hash` và gán vào `innerHTML` | `vulnerable_order_track.html` | **DOM-based XSS** (CWE-79) |

---

## 2. Nguyên nhân cốt lõi phát sinh lỗ hổng
- Lập trình viên sử dụng thuộc tính không an toàn `element.innerHTML` thay vì `element.textContent` hoặc `element.innerText`.
- Không sử dụng thư viện khử độc HTML (Sanitizer Library như DOMPurify) trước khi đưa dữ liệu vào cây phân cấp DOM.
- Phía backend trả về dữ liệu thô mà không thực hiện Context-aware Output Encoding (mã hóa các ký tự đặc biệt `<`, `>`, `"`, `'`, `&`).
