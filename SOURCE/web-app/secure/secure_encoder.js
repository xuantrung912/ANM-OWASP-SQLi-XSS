/**
 * Thư viện Mã Hóa Đầu Ra Theo Ngữ Cảnh Chuẩn OWASP (Context-Aware Output Encoder)
 * Phát triển bởi: Thành viên 2 (Frontend & XSS Security Specialist)
 * Dựa trên: OWASP Cross-Site Scripting Prevention Cheat Sheet
 */

const SecureEncoder = {
    /**
     * Quy tắc 1: Mã hóa cho ngữ cảnh Thân HTML (HTML Body Context)
     * Thay thế 5 ký tự nguy hiểm nhất thành HTML Entities
     */
    encodeForHTML: function(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    /**
     * Quy tắc 2: Mã hóa cho ngữ cảnh Thuộc tính thẻ HTML (HTML Attribute Context)
     * Thường áp dụng cho các thuộc tính như: value="...", title="...", placeholder="..."
     */
    encodeForAttribute: function(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[^a-zA-Z0-9,.\-_]/g, function(ch) {
            return '&#' + ch.charCodeAt(0) + ';';
        });
    },

    /**
     * Quy tắc 3: Mã hóa cho ngữ cảnh Biến trong khối JavaScript (JavaScript String Context)
     * Áp dụng khi truyền biến từ Backend vào các hàm JS (var username = '...';)
     */
    encodeForJavaScript: function(str) {
        if (str === null || str === undefined) return '';
        let out = '';
        for (const ch of String(str)) {
            if (/^[a-zA-Z0-9,._]$/.test(ch)) {
                out += ch;
            } else {
                const cp = ch.codePointAt(0);
                out += cp > 0xFFFF
                    ? '\\u{' + cp.toString(16) + '}'
                    : '\\u' + cp.toString(16).padStart(4, '0');
            }
        }
        return out;
    },

    /**
     * Quy tắc 4: Mã hóa cho ngữ cảnh Tham số đường dẫn (URL Parameter Context)
     */
    encodeForURL: function(str) {
        if (str === null || str === undefined) return '';
        return encodeURIComponent(String(str));
    },

    /**
     * Quy tắc 5: Gán nội dung an toàn vào phần tử DOM thay thế hoàn toàn cho innerHTML
     */
    safeSetText: function(elementOrId, text) {
        const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
        if (el) {
            // textContent sẽ coi toàn bộ mã <script> là văn bản thô, không thực thi
            el.textContent = text;
        }
    }
};

// Xuất module cho môi trường Browser và Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureEncoder;
}
