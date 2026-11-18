<?php
/**
 * SOURCE/web-app/secure/config/session/session_security.php
 * Cấu hình khởi tạo và quản lý phiên an toàn cho hệ thống PHP Backend
 * Thành viên thực hiện: Thành viên 2 (Frontend & XSS Security Specialist)
 */

function init_secure_session() {
    // 1. Chỉ cho phép phiên làm việc lưu bằng Cookie, cấm truyền Session ID qua URL query string
    ini_set('session.use_only_cookies', 1);
    ini_set('session.use_trans_sid', 0);

    // 2. Thiết lập các thuộc tính cờ bảo mật cho Cookie phiên (tương thích Reverse Proxy HTTPS)
    $is_https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['SERVER_PORT'] ?? 0) == 443)
        || (strtolower($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_set_cookie_params([
        'lifetime' => 86400,            // Thời gian sống: 24 giờ
        'path'     => '/',
        'secure'   => $is_https,         // True khi chạy HTTPS
        'httponly' => true,              // QUAN TRỌNG: Ngăn chặn JavaScript đọc document.cookie
        'samesite' => 'Lax'              // Chống tấn công CSRF
    ]);

    // 3. Khởi động phiên
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 4. Cơ chế chống Session Fixation: Tái tạo Session ID sau mỗi lần đổi quyền hạn
    if (!isset($_SESSION['initialized'])) {
        session_regenerate_id(true);
        $_SESSION['initialized'] = true;
    }
}
