/**
 * VulnShop Frontend Interactive Engine - TV2 (Frontend & XSS Security Specialist)
 * Tích hợp đồng bộ và toàn diện với Backend Express.js / MySQL của TV1 (Port 3000)
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

// Biến lưu trạng thái hệ thống từ backend (vulnerable / secure)
let currentSystemMode = 'vulnerable';

// 2. Khởi tạo và đồng bộ trạng thái hệ thống từ Backend Express của TV1
async function syncSystemStatus() {
    try {
        const res = await fetch('/api/system/status');
        if (!res.ok) return;
        const data = await res.json();
        currentSystemMode = data.mode || 'secure';

        // Cập nhật thanh banner trên cùng
        const topBarFlex = document.querySelector('.top-bar-flex');
        if (topBarFlex) {
            const statusSpan = topBarFlex.querySelector('span');
            if (statusSpan) {
                if (currentSystemMode === 'vulnerable') {
                    statusSpan.innerHTML = '⚠️ <b>VULNERABLE MODE (Port 3000)</b> - Cờ HttpOnly TẮT - Sẵn sàng demo SQLi & XSS';
                    statusSpan.style.color = '#ef4444';
                } else {
                    statusSpan.innerHTML = '🛡️ <b>SECURE MODE (Port 3000)</b> - Parameterized Query & Cờ HttpOnly BẬT';
                    statusSpan.style.color = '#22c55e';
                }
            }

            // Hiển thị thông tin người dùng nếu đã đăng nhập
            const topLinks = topBarFlex.querySelector('.top-links');
            if (topLinks && data.user) {
                topLinks.innerHTML = `
                    <span style="color:#cbd5e1;">Chào, <b>${data.user.username}</b> (${data.user.is_admin ? 'Admin' : 'Khách'})</span>
                    ${data.user.is_admin ? '<a href="/admin" style="color:#fbbf24; font-weight:bold;">👑 Quản trị</a>' : ''}
                    <a href="/profile.html">Hồ sơ</a>
                    <a href="#" id="logout-link" style="color:#f87171;">Đăng xuất</a>
                `;
                const logoutLink = document.getElementById('logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', async (e) => {
                        e.preventDefault();
                        await fetch('/api/auth/logout', { method: 'POST' });
                        window.location.reload();
                    });
                }
            }
        }
    } catch (e) {
        console.warn('Không thể kết nối API status:', e);
    }
}

// 3. Tải danh sách sản phẩm động từ CSDL MySQL của TV1 cho Trang Chủ
async function loadProductsForIndex() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/products/search?q=');
        if (!res.ok) throw new Error('Lỗi tải sản phẩm');
        const products = await res.json();

        if (Array.isArray(products) && products.length > 0) {
            grid.innerHTML = '';
            
            // Map ảnh sản phẩm phù hợp danh mục thời trang / công nghệ
            const productImages = {
                1: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', // Ao thun
                2: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', // Giay sneaker
                3: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', // Balo laptop
                4: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', // Mu luoi trai
                5: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500', // Kinh ram
                6: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', // Dong ho the thao
                7: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500', // Ao khoac gio
                8: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'  // Quan jean
            };

            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-id', p.id);

                const imgUrl = productImages[p.id] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

                card.innerHTML = `
                    <img src="${imgUrl}" alt="${p.name}">
                    <div class="card-body">
                        <span class="category">Sản phẩm TMĐT #${p.id}</span>
                        <h3 class="card-title">${p.name}</h3>
                        <p class="price">${formatVND(p.price)}</p>
                        <p class="desc">${p.description || 'Sản phẩm chính hãng trên sàn VulnShop.'}</p>
                        <div class="card-actions">
                            <a href="product_detail.html?id=${p.id}" class="btn-detail">Xem chi tiết & Đánh giá</a>
                            <button class="btn-add-cart" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price})">Thêm giỏ</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    } catch (err) {
        console.warn('Lỗi hiển thị sản phẩm:', err);
    }
}

// 4. Tải chi tiết sản phẩm và danh sách bình luận (Bề mặt Stored XSS)
async function loadProductDetail() {
    const prodNameEl = document.getElementById('prod-name');
    if (!prodNameEl) return;

    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('id') || '1';

    try {
        // Tải thông tin sản phẩm từ Backend TV1
        const res = await fetch(`/api/products/${prodId}`);
        if (res.ok) {
            const prod = await res.json();
            if (prod && prod.id) {
                prodNameEl.textContent = prod.name;
                const priceEl = document.getElementById('prod-price');
                if (priceEl) priceEl.textContent = formatVND(prod.price);
                const descEl = document.getElementById('prod-desc');
                if (descEl) descEl.textContent = prod.description || '';
                const catEl = document.getElementById('prod-cat');
                if (catEl) catEl.textContent = `Danh mục Sản Phẩm #${prod.id}`;

                // Nút thêm giỏ hàng
                const actionBtns = document.querySelector('.action-buttons');
                if (actionBtns) {
                    actionBtns.innerHTML = `
                        <button class="btn-primary" onclick="addToCart(${prod.id}, '${prod.name.replace(/'/g, "\\'")}', ${prod.price})">🛒 Thêm Vào Giỏ Hàng</button>
                        <a href="cart.html" class="btn-secondary">Xem Giỏ Hàng</a>
                    `;
                }
            }
        }
    } catch (e) {
        console.warn('Lỗi tải sản phẩm:', e);
    }

    // Tải danh sách bình luận từ MySQL (Bề mặt Stored XSS)
    await loadReviews(prodId);
}

// Tải danh sách đánh giá từ CSDL
async function loadReviews(prodId) {
    const container = document.getElementById('reviews-container');
    const countEl = document.getElementById('review-count');
    if (!container) return;

    try {
        const res = await fetch(`/api/reviews?product_id=${prodId}`);
        if (!res.ok) return;
        const reviews = await res.json();

        if (countEl) countEl.textContent = reviews.length;
        container.innerHTML = '';

        if (reviews.length === 0) {
            container.innerHTML = '<p style="color:#64748b; font-style:italic;">Chưa có nhận xét nào cho sản phẩm này.</p>';
            return;
        }

        reviews.forEach(r => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            const stars = '⭐'.repeat(r.rating || 5);
            const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Mới đây';

            if (currentSystemMode === 'vulnerable') {
                // [LỖ HỔNG STORED XSS]: Dùng innerHTML chèn trực tiếp comment từ CSDL
                reviewItem.innerHTML = `
                    <div class="review-header">
                        <span class="author-name">${r.author}</span>
                        <span class="review-stars">${stars}</span>
                        <span class="review-date">${dateStr}</span>
                    </div>
                    <div class="review-body">${r.comment}</div>
                `;
            } else {
                // [SECURE MODE]: Bảo vệ với textContent hoặc DOMPurify
                const header = document.createElement('div');
                header.className = 'review-header';

                const authorSpan = document.createElement('span');
                authorSpan.className = 'author-name';
                authorSpan.textContent = r.author;

                const starSpan = document.createElement('span');
                starSpan.className = 'review-stars';
                starSpan.textContent = stars;

                const dateSpan = document.createElement('span');
                dateSpan.className = 'review-date';
                dateSpan.textContent = dateStr;

                header.appendChild(authorSpan);
                header.appendChild(starSpan);
                header.appendChild(dateSpan);

                const body = document.createElement('div');
                body.className = 'review-body';
                
                // Nếu có thư viện DOMPurify thì sanitize, nếu không dùng textContent
                if (typeof DOMPurify !== 'undefined') {
                    body.innerHTML = DOMPurify.sanitize(r.comment);
                } else {
                    body.textContent = r.comment;
                }

                reviewItem.appendChild(header);
                reviewItem.appendChild(body);
            }

            container.appendChild(reviewItem);
        });
    } catch (e) {
        console.warn('Lỗi tải reviews:', e);
    }
}

// 5. Xử lý Gửi Bình Luận Đánh Giá (Lưu vào MySQL qua route TV1)
async function handleReviewSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('id') || '1';

    const authorInput = document.getElementById('review-author');
    const ratingInput = document.getElementById('review-rating');
    const commentInput = document.getElementById('review-comment');

    if (!authorInput || !commentInput) return;

    const author = authorInput.value.trim();
    const rating = parseInt(ratingInput.value || 5, 10);
    const comment = commentInput.value;

    if (!comment) {
        alert('Vui lòng nhập nội dung nhận xét!');
        return;
    }

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: prodId,
                author: author || 'Khách vãng lai',
                rating: rating,
                comment: comment
            })
        });

        const data = await res.json();
        if (data.success) {
            alert(data.message || 'Đã gửi đánh giá thành công!');
            commentInput.value = '';
            await loadReviews(prodId);
        } else {
            alert('Lỗi: ' + (data.error || 'Không thể lưu bình luận'));
        }
    } catch (err) {
        alert('Lỗi gửi bình luận: ' + err.message);
    }
}

// 6. Xử lý Đăng Nhập Tài Khoản (Đồng bộ với API auth.js của TV1)
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Đăng nhập thành công! Xin chào ${data.user.username}`);
                if (data.user.is_admin) {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/index.html';
                }
            } else {
                alert('Đăng nhập thất bại: ' + (data.message || 'Sai tên đăng nhập hoặc mật khẩu!'));
            }
        } catch (err) {
            alert('Lỗi kết nối máy chủ xác thực: ' + err.message);
        }
    });
}

// 7. Xử lý Tra Cứu Đơn Hàng (Đồng bộ với API orders.js của TV1)
function initOrderTrackForm() {
    const trackForm = document.getElementById('track-form');
    if (!trackForm) return;

    trackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('track-code');
        if (!codeInput) return;
        const code = codeInput.value.trim();

        const domMsgBox = document.getElementById('dom-status-msg');
        try {
            const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code)}`);
            const data = await res.json();

            if (res.ok && data.success) {
                const order = data.order;
                alert(`Tìm thấy đơn hàng #${order.id}!\nNgười đặt: ${order.username}\nTổng tiền: ${formatVND(order.total)}\nNgày tạo: ${new Date(order.created_at).toLocaleString('vi-VN')}`);
            } else {
                alert(data.error || data.message || 'Không tìm thấy đơn hàng tương ứng!');
            }
        } catch (err) {
            alert('Lỗi tra cứu: ' + err.message);
        }
    });
}

// 8. Xử lý Cập nhật Hồ Sơ Cá Nhân (Profile Update Handler)
function handleProfileUpdate(e) {
    e.preventDefault();
    const nameInput = document.getElementById('display-name-input');
    const targetDisplay = document.getElementById('current-display-name');
    const statusText = document.getElementById('update-status');

    if (!nameInput || !targetDisplay) return;

    const newName = nameInput.value;

    if (currentSystemMode === 'vulnerable') {
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

// 9. Lắng nghe sự kiện trang tải xong
document.addEventListener('DOMContentLoaded', async () => {
    updateCartUI();
    renderCartTable();
    await syncSystemStatus();

    // Khởi tạo các trang tương ứng
    loadProductsForIndex();
    loadProductDetail();
    initLoginForm();
    initOrderTrackForm();

    // Nút thanh toán giỏ hàng
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Giỏ hàng đang trống!');
                return;
            }
            const orderCode = '1';
            cart = [];
            localStorage.setItem('vulnshop_cart', JSON.stringify(cart));
            updateCartUI();
            renderCartTable();
            alert('Đơn hàng đã được ghi nhận! Mã vận đơn trong CSDL: ' + orderCode);
        });
    }

    // Xử lý Tìm kiếm (Điều hướng đến /search?q=... để minh họa Reflected XSS)
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    if (searchBtn && searchInput) {
        const triggerSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        };

        searchBtn.addEventListener('click', triggerSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
    }

    // Xử lý DOM Hash Sink (Trang order_track.html)
    const domMsgBox = document.getElementById('dom-status-msg');
    if (domMsgBox && window.location.hash) {
        const rawHash = window.location.hash.slice(1);
        let decoded = rawHash;
        try {
            decoded = decodeURIComponent(rawHash);
        } catch (e) {
            decoded = rawHash;
        }

        if (currentSystemMode === 'vulnerable') {
            // LỖ HỔNG DOM XSS: Gán trực tiếp chuỗi hash không qua lọc vào innerHTML
            domMsgBox.innerHTML = `Mã hash đơn hàng: <b>${decoded}</b>`;
        } else {
            // CƠ CHẾ AN TOÀN: Gán văn bản thô bằng textContent
            domMsgBox.textContent = `Mã hash đơn hàng: ${decoded}`;
        }
    }
});
