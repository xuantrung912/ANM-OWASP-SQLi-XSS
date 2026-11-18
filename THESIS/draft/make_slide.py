# -*- coding: utf-8 -*-
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

slides_data = [
    {
        'num': 'SLIDE 8',
        'title': 'Lỗ Hổng Cross-Site Scripting (XSS - CWE-79)',
        'bullets': [
            'XSS xảy ra khi ứng dụng in trực tiếp dữ liệu người dùng ra HTML mà không kiểm tra.',
            'Trình duyệt không phân biệt được kịch bản hợp pháp và mã độc, tự động thực thi.',
            'XSS thuộc nhóm nguy cơ hàng đầu A03:2021 – Injection trong OWASP Top 10.',
            'Hậu quả nghiêm trọng: Đánh cắp phiên, giả mạo danh tính và can thiệp giao diện.'
        ]
    },
    {
        'num': 'SLIDE 9',
        'title': 'Phân Loại XSS & Cơ Chế Cướp Phiên Đăng Nhập',
        'bullets': [
            'Reflected XSS: Mã độc phản xạ ngay trong phản hồi HTTP qua URL tìm kiếm.',
            'Stored XSS: Script lưu vĩnh viễn trong CSDL (bình luận), tự động kích hoạt khi xem.',
            'DOM-based XSS: Khai thác hoàn toàn phía Client qua location.hash và innerHTML.',
            'Cơ chế cướp phiên: JavaScript đọc document.cookie gửi về Webhook do thiếu HttpOnly.'
        ]
    },
    {
        'num': 'SLIDE 22',
        'title': 'Giao Diện VulnShop & Khảo Sát Bề Mặt XSS',
        'bullets': [
            'Xây dựng giao diện sàn TMĐT: Trang chủ, Chi tiết sản phẩm, Giỏ hàng, Hồ sơ, Vận đơn.',
            'Bề mặt 1: Thanh tìm kiếm /search?q=... (Nguy cơ Reflected XSS).',
            'Bề mặt 2: Form bình luận /product và Hồ sơ /profile (Nguy cơ Stored XSS).',
            'Bề mặt 3: Tra cứu mã vận đơn /order-track#... (Nguy cơ DOM-based XSS).'
        ]
    },
    {
        'num': 'SLIDE 23',
        'title': 'Demo 1: Khai Thác Reflected XSS (/search)',
        'bullets': [
            'Kẻ tấn công gửi liên kết tìm kiếm chứa thẻ script: <script>alert("Reflected_XSS")</script>.',
            'Máy chủ VulnShop ở chế độ Vulnerable phản xạ nguyên văn payload ra HTML.',
            'Trình duyệt nạn nhân biên dịch mã và hiển thị popup cảnh báo tức thì.',
            'Tác động: Lừa đảo người mua click link độc hại để đánh cắp token hoặc phishing.'
        ]
    },
    {
        'num': 'SLIDE 24',
        'title': 'Demo 2: Khai Thác Stored XSS (/product)',
        'bullets': [
            'Kẻ tấn công gửi bình luận chứa mã JavaScript độc hại tại trang chi tiết sản phẩm.',
            'Chuỗi kịch bản được lưu trữ vĩnh viễn vào bảng reviews trong cơ sở dữ liệu.',
            'Bất kỳ người dùng hay Quản trị viên nào vào xem đều bị kích hoạt mã độc thụ động.',
            'Lỗ hổng phát sinh do giao diện render bình luận bằng thuộc tính không an toàn innerHTML.'
        ]
    },
    {
        'num': 'SLIDE 25',
        'title': 'Demo 3: Đánh Cắp Cookie Admin & Giả Mạo Phiên',
        'bullets': [
            'Payload Stored XSS âm thầm đọc document.cookie và gửi về Logger cổng 8888.',
            'Quản trị viên truy cập trang /admin, mã độc kích hoạt ngầm trong phiên của Admin.',
            'Máy chủ Attacker nhận được Session ID của Admin tại tab /attacker-logs.',
            'Kẻ tấn công chạy script giả mạo phiên, đột nhập trang Quản trị không cần mật khẩu.'
        ]
    },
    {
        'num': 'SLIDE 26',
        'title': 'Demo 4: Khai Thác DOM-based XSS (/order-track)',
        'bullets': [
            'Kẻ tấn công lợi dụng nguồn đầu vào Client-side: window.location.hash.',
            'Chèn payload qua URL: /order-track#<img src=x onerror=alert("DOM_XSS")>.',
            'Script frontend lấy hash và gán thẳng vào DOM Sink nguy hiểm innerHTML.',
            'Mã độc chạy trực tiếp trên trình duyệt mà không hề gửi lên Web Server hay WAF.'
        ]
    },
    {
        'num': 'SLIDE 27',
        'title': 'Giải Pháp Phòng Thủ XSS Phía Ứng Dụng',
        'bullets': [
            'Mã hóa đầu ra: Dùng html.escape() biến <script> thành văn bản thô &lt;script&gt;.',
            'An toàn DOM: Thay thế toàn bộ innerHTML bằng thuộc tính an toàn textContent.',
            'Làm sạch HTML: Tích hợp thư viện DOMPurify loại bỏ thẻ và sự kiện độc hại.',
            'Bảo vệ Cookie: Bật cờ HttpOnly chặn đứng 100% nguy cơ cướp phiên qua XSS.'
        ]
    },
    {
        'num': 'SLIDE 28',
        'title': 'Kết Quả Kiểm Thử Lại (Re-test Comparison)',
        'bullets': [
            'Toàn bộ payload Reflected, Stored và DOM XSS đều bị vô hiệu hóa khi bật SECURE.',
            'Script hiển thị dưới dạng văn bản thuần túy, không có popup hay mã ngầm thực thi.',
            'Cờ HttpOnly bảo vệ thành công: document.cookie trả về rỗng đối với JavaScript.',
            'Đánh giá: Hệ thống đạt chuẩn an toàn theo OWASP XSS Prevention Cheat Sheet.'
        ]
    }
]

for item in slides_data:
    slide = prs.slides.add_slide(blank_layout)
    
    # Background shape (Header banner)
    header_box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.3))
    header_box.fill.solid()
    header_box.fill.fore_color.rgb = RGBColor(0x00, 0x2D, 0x62) # UTH Navy
    header_box.line.color.rgb = RGBColor(0x00, 0x2D, 0x62)
    
    # Gold accent line
    accent_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(1.3), Inches(13.333), Inches(0.08))
    accent_line.fill.solid()
    accent_line.fill.fore_color.rgb = RGBColor(0xD9, 0x77, 0x06) # Gold
    accent_line.line.color.rgb = RGBColor(0xD9, 0x77, 0x06)

    # Sub-badge (Slide number & UTH watermark)
    badge_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.12), Inches(11.7), Inches(0.35))
    tf_b = badge_box.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI TP.HCM (UTH) | " + item['num'] + " - PHÂN HỆ THÀNH VIÊN 2"
    p_b.font.name = 'Times New Roman'
    p_b.font.size = Pt(13)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(0xFE, 0xF0, 0x8A) # Light gold

    # Title box (Size 32 pt as strictly required)
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(11.7), Inches(0.75))
    tf_t = title_box.text_frame
    p_t = tf_t.paragraphs[0]
    p_t.text = item['title']
    p_t.font.name = 'Times New Roman'
    p_t.font.size = Pt(32)
    p_t.font.bold = True
    p_t.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Content box (Size 26 pt as strictly required, max 5 lines)
    content_box = slide.shapes.add_textbox(Inches(0.9), Inches(1.8), Inches(11.5), Inches(5.0))
    tf_c = content_box.text_frame
    tf_c.word_wrap = True

    for idx, bullet in enumerate(item['bullets']):
        p = tf_c.paragraphs[0] if idx == 0 else tf_c.add_paragraph()
        p.text = "•  " + bullet
        p.font.name = 'Times New Roman'
        p.font.size = Pt(26)
        p.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
        p.space_after = Pt(22)
        p.line_spacing = 1.25

    # Footer banner
    footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(6.9), Inches(11.7), Inches(0.4))
    tf_f = footer_box.text_frame
    p_f = tf_f.paragraphs[0]
    p_f.text = 'BTL An toàn thông tin - Khai thác lỗ hổng Web OWASP Top 10 | TV2: Frontend & Cross-Site Scripting'
    p_f.font.name = 'Times New Roman'
    p_f.font.size = Pt(11)
    p_f.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

prs.save('THESIS/draft/TV2_slide.pptx')
print('Successfully generated THESIS/draft/TV2_slide.pptx')
