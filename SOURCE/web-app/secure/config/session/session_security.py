# -*- coding: utf-8 -*-
"""
SOURCE/web-app/secure/config/session/session_security.py
Thành viên 2: Module Cấu Hình Session Cookie An Toàn Cho Ứng Dụng Python WSGI / Web Frameworks
"""

from http import cookies
import uuid
import datetime

def generate_secure_session_cookie(session_id=None, is_https=False, max_age_seconds=86400):
    """
    Sinh Set-Cookie Header tuân thủ 100% nguyên tắc bảo mật phòng thủ XSS & CSRF:
    - HttpOnly = True : Ngăn chặn 100% việc trích xuất cookie qua document.cookie bằng JavaScript.
    - SameSite = 'Lax' hoặc 'Strict' : Ngăn chặn cookie bị gửi kèm trong các yêu cầu Cross-Site (Chống CSRF).
    - Secure = True (khi chạy HTTPS) : Chỉ cho phép truyền cookie qua kênh mã hóa SSL/TLS.
    - Path = '/' : Giới hạn phạm vi hợp lệ của phiên trên toàn domain.
    """
    if not session_id:
        session_id = uuid.uuid4().hex

    c = cookies.SimpleCookie()
    c["session_id"] = session_id
    c["session_id"]["path"] = "/"
    c["session_id"]["httponly"] = True   # BẢO VỆ CỐT LÕI CHỐNG XSS COOKIE STEALING
    c["session_id"]["samesite"] = "Lax"  # PHÒNG CHỐNG CSRF
    
    if is_https:
        c["session_id"]["secure"] = True

    c["session_id"]["max-age"] = max_age_seconds

    # Định dạng chuỗi Set-Cookie trả về cho HTTP Response Header
    cookie_header_value = c.output(header="").strip()
    return session_id, ("Set-Cookie", cookie_header_value)


def parse_incoming_cookies(environ):
    """Phân tích cookie an toàn từ WSGI environ"""
    cookie_header = environ.get("HTTP_COOKIE", "")
    cookie_jar = cookies.SimpleCookie()
    if cookie_header:
        cookie_jar.load(cookie_header)
    return cookie_jar
