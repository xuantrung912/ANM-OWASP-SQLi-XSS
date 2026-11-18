/**
 * VulnShop Frontend Interactive Engine - TV2 (Frontend & XSS Security Specialist)
 * Quản lý tương tác người dùng, giỏ hàng, bình luận, và các luồng gọi API Backend của TV1.
 */

// 1. Quản lý Giỏ hàng (Local Cart State)
let cart = [];
try {
    const parsedCart = JSON.parse(localStorage.getItem('vulnshop_cart') || '[]');
    if (Array.isArray(parsedCart)) {
        cart = parsedCart.filter(item => item && typeof item === 'object');
    }
} catch (e) {
    cart = [];
    localStorage.removeItem('vulnshop_cart');
}

function formatVND(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('vi-VN') + ' đ';
}

function renderCartTable() {
    const tbody = document.getElementById('cart-table-body');
    const subtotalEl = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');
    if (!tbody) return;

    tbody.textContent = '';
    if (cart.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 5;
        emptyCell.textContent = 'Giỏ hàng của bạn đang trống.';
        emptyCell.style.textAlign = 'center';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        if (subtotalEl) subtotalEl.textContent = '0 đ';
        if (grandTotalEl) grandTotalEl.textContent = '0 đ';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const price = Math.max(0, Number(item.price) || 0);
        const lineTotal = price * qty;
        total += lineTotal;

        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        const bold = document.createElement('b');
        bold.textContent = String(item.name || 'Sản phẩm');
        tdName.appendChild(bold);

        const tdPrice = document.createElement('td');
        tdPrice.textContent = formatVND(price);

        const tdQty = document.createElement('td');
        tdQty.textContent = String(qty);

        const tdTotal = document.createElement('td');
        tdTotal.textContent = formatVND(lineTotal);

        const tdRemove = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = '✕';
        removeBtn.addEventListener('click', () => {
            cart.splice(index, 1);
                localStorage.setItem('vulnshop_cart', JSON.stringify(cart));
            updateCartUI();
            renderCartTable();
        });
        tdRemove.appendChild(removeBtn);

        tr.appendChild(tdName);
        tr.appendChild(tdPrice);
        tr.appendChild(tdQty);
        tr.appendChild(tdTotal);
        tr.appendChild(tdRemove);
        tbody.appendChild(tr);
    });

    if (subtotalEl) subtotalEl.textContent = formatVND(total);
    if (grandTotalEl) grandTotalEl.textContent = formatVND(total);
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countEl.textContent = totalItems;
    }
}

function addToCart(id, name, price) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    localStorage.setItem('vulnshop_cart', JSON.stringify(cart));
    updateCartUI();
    renderCartTable();
    alert(`Đã thêm "${name}" vào giỏ hàng thành công!`);
}

// 2. Xử lý Tìm kiếm
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    renderCartTable();

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Giỏ hàng đang trống!');
                return;
            }
            const orderCode = 'ORD' + Math.floor(100 + Math.random() * 900);
            cart = [];
            localStorage.setItem('vulnshop_cart', JSON.stringify(cart));
            updateCartUI();
            renderCartTable();
            alert('Đơn hàng mô phỏng đã được ghi nhận! Mã vận đơn: ' + orderCode);
        });
    }

    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        const triggerSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                // Điều hướng sang endpoint backend tìm kiếm (nơi kiểm thử Reflected XSS & SQLi)
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        };

        searchBtn.addEventListener('click', triggerSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
    }

    // 3. Xử lý DOM Hash Sink (Trang order_track.html)
    const domMsgBox = document.getElementById('dom-status-msg');
    if (domMsgBox && window.location.hash) {
        const rawHash = window.location.hash.slice(1);
        let decoded = rawHash;
        try {
            decoded = decodeURIComponent(rawHash);
        } catch (e) {
            decoded = rawHash;
        }
        
        // Mô phỏng kiểm tra cờ bảo mật cho bản prototype HTML tĩnh;
        // Trên server Python (app.py), cờ mode từ session server sẽ quyết định trực tiếp.
        const isSecure = document.cookie.includes('app_sec_mode=SECURE');
        if (!isSecure) {
            // LỖ HỔNG DOM XSS: Gán trực tiếp chuỗi hash không qua lọc vào innerHTML
            domMsgBox.innerHTML = `Mã hash đơn hàng: <b>${decoded}</b>`;
        } else {
            // CƠ CHẾ AN TOÀN: Gán văn bản thô bằng textContent
            domMsgBox.textContent = `Mã hash đơn hàng: ${decoded}`;
        }
    }
});

// 4. Xử lý Gửi Bình Luận Đánh Giá (Review Handler)
function handleReviewSubmit(e) {
    e.preventDefault();
    const authorInput = document.getElementById('review-author');
    const ratingInput = document.getElementById('review-rating');
    const commentInput = document.getElementById('review-comment');
    const container = document.getElementById('reviews-container');

    if (!authorInput || !commentInput || !container) return;

    const author = authorInput.value;
    const rating = parseInt(ratingInput.value || 5);
    const comment = commentInput.value;
    const stars = '⭐'.repeat(rating);

    // Tạo phần tử hiển thị mới
    const reviewItem = document.createElement('div');
    reviewItem.className = 'review-item';

    // Kiểm tra chế độ bảo mật:
    const isSecure = document.cookie.includes('app_sec_mode=SECURE');

    if (!isSecure) {
        // [VULNERABLE]: Chèn trực tiếp comment của user vào innerHTML -> Kích hoạt Stored/DOM XSS
        reviewItem.innerHTML = `
            <div class="review-header">
                <span class="author-name">${author}</span>
                <span class="review-stars">${stars}</span>
                <span class="review-date">Vừa xong</span>
            </div>
            <div class="review-body">${comment}</div>
        `;
    } else {
        // [SECURE]: Sử dụng textContent hoặc escape các ký tự đặc biệt
        const header = document.createElement('div');
        header.className = 'review-header';
        
        const authorSpan = document.createElement('span');
        authorSpan.className = 'author-name';
        authorSpan.textContent = author;

        const starSpan = document.createElement('span');
        starSpan.className = 'review-stars';
        starSpan.textContent = stars;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'review-date';
        dateSpan.textContent = 'Vừa xong';

        header.appendChild(authorSpan);
        header.appendChild(starSpan);
        header.appendChild(dateSpan);

        const body = document.createElement('div');
        body.className = 'review-body';
        body.textContent = comment; // AN TOÀN 100%

        reviewItem.appendChild(header);
        reviewItem.appendChild(body);
    }

    container.prepend(reviewItem);
    commentInput.value = '';
    alert('Đã gửi nhận xét thành công!');
}

// 5. Xử lý Cập nhật Hồ Sơ Cá Nhân (Profile Update Handler)
function handleProfileUpdate(e) {
    e.preventDefault();
    const nameInput = document.getElementById('display-name-input');
    const targetDisplay = document.getElementById('current-display-name');
    const statusText = document.getElementById('update-status');

    if (!nameInput || !targetDisplay) return;

    const newName = nameInput.value;
    const isSecure = document.cookie.includes('app_sec_mode=SECURE');

    if (!isSecure) {
        // [VULNERABLE]: Gán trực tiếp chuỗi vào innerHTML không mã hóa
        targetDisplay.innerHTML = newName;
    } else {
        // [SECURE]: Gán bằng textContent an toàn tuyệt đối
        targetDisplay.textContent = newName;
    }

    if (statusText) {
        statusText.textContent = '✓ Đã cập nhật thành công!';
        setTimeout(() => { statusText.textContent = ''; }, 3000);
    }
}
