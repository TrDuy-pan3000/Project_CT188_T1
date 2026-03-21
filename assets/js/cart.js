// Check login trước khi vào trang cart
function protectCartPage() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

// Load / Save localStorage 
function loadCartFromStorage() {
    try {
        const parsed = JSON.parse(localStorage.getItem('cart') ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
       } catch {
        return [];
       }
}

function saveCartToStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartBadge === 'function') updateCartBadge();
}

// Hàm escape HTML để tránh XSS
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

// Trạng thái giỏ hàng 
let cartData = loadCartFromStorage();

// Format tiền
function formatMoney(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

// Render giỏ hàng 
function renderCart() {
    cartData = loadCartFromStorage();

    // dùng đúng selector .cart-badge như main.js
    // Header được inject async nên dùng MutationObserver để retry nếu badge chưa có
    function applyBadge() {
        const totalQty = cartData.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badges = document.querySelectorAll('.cart-badge');
        if (badges.length > 0) {
            badges.forEach(b => { b.textContent = totalQty; });
            return true;
        }
        return false;
    }
    if (!applyBadge()) {
        const observer = new MutationObserver(() => {
            if (applyBadge()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) return;

    if (cartData.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🎊</div>
                <div class="empty-message">Chưa có sản phẩm nào trong danh sách Tết</div>
            </div>`;
        updateTotal();
        return;
    }

    cartContainer.innerHTML = cartData.map(item => {
        const qty = item.quantity || 1;
        const safeId = escapeHtml(String(item.id));
        return `
        <div class="cart-item">
            <img
                src="${escapeHtml(item.image)}"
                alt="${escapeHtml(item.name)}"
                class="item-image"
                onerror="this.src='assets/images/logo.png'"
            >
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-price">${formatMoney(item.price)}</div>
            </div>
            <div class="item-qty">
                <button class="qty-btn" onclick="changeQuantity('${safeId}', -1)">−</button>
                <span class="qty-value">${qty}</span>
                <button class="qty-btn" onclick="changeQuantity('${safeId}', 1)">+</button>
            </div>
            <div class="item-subtotal">${formatMoney(item.price * qty)}</div>
            <button class="remove-btn" onclick="confirmRemove('${safeId}')" title="Xóa sản phẩm">🗑️</button>
        </div>`;
    }).join('');

    updateTotal();
}

// Thay đổi số lượng
function changeQuantity(id, delta) {
    const item = cartData.find(i => String(i.id) === String(id));
    if (!item) return;
    item.quantity = (item.quantity || 1) + delta;
    if (item.quantity <= 0) {
        cartData = cartData.filter(i => String(i.id) !== String(id));
        showNotification('Đã xóa sản phẩm khỏi giỏ hàng');
    }
    saveCartToStorage(cartData);
    renderCart();
}

// Xóa sản phẩm 
function confirmRemove(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        cartData = cartData.filter(i => String(i.id) !== String(id));
        saveCartToStorage(cartData);
        renderCart();
        showNotification('Đã xóa sản phẩm! 🗑️');
    }
}
// Cập nhật tổng tiền
function updateTotal() {
    const total = cartData.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const el = document.getElementById('totalAmount');
    if (el) el.textContent = formatMoney(total);
}

// Xử lý chốt đơn
function checkout() {
    if (cartData.length === 0) {
        showNotification('Vui lòng chọn sản phẩm trước khi chốt đơn!');
        return;
    }
    const name    = document.getElementById('customerName')?.value.trim();
    const address = document.getElementById('customerAddress')?.value.trim();
    const phone   = document.getElementById('customerPhone')?.value.trim();
    const note    = document.getElementById('customerNote')?.value.trim();
    const payment = document.querySelector('input[name="payment"]:checked')?.value;

    if (!name || !address || !phone) {
        showNotification('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const paymentText = payment === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng';
    const total = cartData.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

    let orderDetails = `🎊 Chúc mừng năm mới - Vạn sự như ý! 🎊\n\n`;
    orderDetails += `👤 Khách hàng: ${name}\n`;
    orderDetails += `🏠 Địa chỉ: ${address}\n`;
    orderDetails += `📞 Điện thoại: ${phone}\n`;
    orderDetails += `💳 Thanh toán: ${paymentText}\n\n`;
    orderDetails += `📦 DANH SÁCH SẢN PHẨM:\n`;

    cartData.forEach((item, i) => {
        const qty = item.quantity || 1;
        orderDetails += `${i + 1}. ${item.name} x${qty} - ${formatMoney(item.price * qty)}\n`;
    });

    // Build danh sách sản phẩm cho modal
    const itemsHtml = cartData.map((item, i) => {
        const qty = item.quantity || 1;
        return `<div class="order-modal-item">
            <span>${i + 1}. ${escapeHtml(item.name)} x${qty}</span>
            <span>${formatMoney(item.price * qty)}</span>
        </div>`;
    }).join('');
     // Hiển thị modal
    showOrderModal({
        name, address, phone,
        paymentText, note,
        itemsHtml,
        total: total
    });
}
// Hiển thị modal chốt đơn thành công
function showOrderModal({ name, address, phone, paymentText, note, itemsHtml, total }) {
    // Xóa modal cũ nếu có
    document.getElementById('orderSuccessModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'orderSuccessModal';
    modal.innerHTML = `
        <div class="order-modal-overlay" id="orderModalOverlay">
            <div class="order-modal-box">
                <div class="order-modal-header">
                    <div class="order-modal-icon">🧧</div>
                    <h2>Đặt hàng thành công!</h2>
                    <p>Chúc mừng năm mới - Vạn sự như ý! 🎊</p>
                </div>
                <div class="order-modal-body">
                    <div class="order-modal-section">
                        <div class="order-modal-row"><span>👤 Khách hàng</span><span>${escapeHtml(name)}</span></div>
                        <div class="order-modal-row"><span>🏠 Địa chỉ</span><span>${escapeHtml(address)}</span></div>
                        <div class="order-modal-row"><span>📞 Điện thoại</span><span>${escapeHtml(phone)}</span></div>
                        <div class="order-modal-row"><span>💳 Thanh toán</span><span>${escapeHtml(paymentText)}</span></div>
                    </div>
                    <div class="order-modal-section">
                        <div class="order-modal-section-title">📦 Danh sách sản phẩm</div>
                        ${itemsHtml}
                    </div>
                    <div class="order-modal-total">
                        <span>💰 Tổng tiền</span>
                        <span class="order-modal-total-amount">${formatMoney(total)}</span>
                    </div>
                    ${note ? `<div class="order-modal-note">📝 Ghi chú: ${escapeHtml(note)}</div>` : ''}
                </div>
                <div class="order-modal-footer">
                    <p>✨ Cảm ơn quý khách! 🎁 Chúc năm mới an khang thịnh vượng!</p>
                    <button class="order-modal-close-btn" id="closeOrderModal">Xác nhận</button>
                </div>
            </div>
        </div>`;

    // Inject style nếu chưa có
    if (!document.getElementById('orderModalStyle')) {
        const style = document.createElement('style');
        style.id = 'orderModalStyle';
        style.textContent = `
            .order-modal-overlay {
                position: fixed; inset: 0; z-index: 9999;
                background: rgba(0,0,0,0.55);
                display: flex; align-items: center; justify-content: center;
                padding: 16px; animation: omFadeIn .2s ease;
            }
            @keyframes omFadeIn { from { opacity: 0 } to { opacity: 1 } }
            .order-modal-box {
                background: #fff; border-radius: 20px; max-width: 480px; width: 100%;
                max-height: 85vh; overflow-y: auto;
                box-shadow: 0 24px 64px rgba(0,0,0,0.18);
                animation: omSlideUp .25s ease;
            }
            @keyframes omSlideUp { from { transform: translateY(24px); opacity:0 } to { transform: translateY(0); opacity:1 } }
            .order-modal-header {
                background: linear-gradient(135deg, #8B0000, #CC2727);
                color: #fff; padding: 24px 24px 20px; text-align: center; border-radius: 20px 20px 0 0;
            }
            .order-modal-icon { font-size: 2.5rem; margin-bottom: 8px; }
            .order-modal-header h2 { font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0 0 4px; }
            .order-modal-header p  { font-size: 0.9rem; opacity: .9; margin: 0; }
            .order-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
            .order-modal-section { background: #fdf6f0; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
            .order-modal-section-title { font-size: 0.82rem; font-weight: 700; color: #8B0000; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
            .order-modal-row { display: flex; justify-content: space-between; gap: 12px; font-size: 0.9rem; color: #3d2b1f; }
            .order-modal-row span:first-child { color: #7a6055; flex-shrink: 0; }
            .order-modal-row span:last-child { text-align: right; font-weight: 500; }
            .order-modal-item { display: flex; justify-content: space-between; gap: 12px; font-size: 0.88rem; color: #3d2b1f; padding: 4px 0; border-bottom: 1px dashed rgba(0,0,0,0.07); }
            .order-modal-item:last-child { border-bottom: none; }
            .order-modal-total { display: flex; justify-content: space-between; align-items: center; background: #8B0000; color: #fff; border-radius: 12px; padding: 14px 16px; }
            .order-modal-total span:first-child { font-size: 0.95rem; font-weight: 600; }
            .order-modal-total-amount { font-size: 1.3rem; font-weight: 700; color: #FFD700; }
            .order-modal-note { font-size: 0.85rem; color: #7a6055; background: #fdf6f0; border-radius: 10px; padding: 10px 14px; }
            .order-modal-footer { padding: 16px 24px 24px; text-align: center; }
            .order-modal-footer p { font-size: 0.85rem; color: #7a6055; margin-bottom: 14px; }
            .order-modal-close-btn {
                background: linear-gradient(135deg, #FFD700, #ffe486);
                color: #8B0000; border: none; border-radius: 12px;
                padding: 12px 40px; font-size: 1rem; font-weight: 700;
                cursor: pointer; transition: transform .15s, box-shadow .15s;
                font-family: 'Be Vietnam Pro', sans-serif;
            }
            .order-modal-close-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,215,0,.4); }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(modal);
// Xử lý đóng modal
    const closeModal = () => {
        modal.remove();
    };

    document.getElementById('closeOrderModal').addEventListener('click', closeModal);
    document.getElementById('orderModalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

// Hiển thị modal chốt đơn thành công
function showOrderModal({ name, address, phone, note, paymentText, total, orderDetails }) {
    document.getElementById('orderSuccessModal')?.remove();

    const itemsHtml = cartData.map((item, i) => {
        const qty = item.quantity || 1;
        return `<div class="order-modal-item">
            <span class="omi-num">${i + 1}</span>
            <span class="omi-name">${escapeHtml(item.name)}</span>
            <span class="omi-qty">x${qty}</span>
            <span class="omi-price">${formatMoney(item.price * qty)}</span>
        </div>`;
    }).join('');

    const modal = document.createElement('div');
    modal.id = 'orderSuccessModal';
    modal.innerHTML = `
        <div class="osm-overlay" id="osmOverlay"></div>
        <div class="osm-card">
            <div class="osm-header">
                <div class="osm-icon">🎊</div>
                <h2 class="osm-title">Đặt hàng thành công!</h2>
                <p class="osm-subtitle">Chúc mừng năm mới – Vạn sự như ý!</p>
            </div>
            <div class="osm-body">
                <div class="osm-info-grid">
                    <div class="osm-info-row"><span class="osm-label">👤 Khách hàng</span><span>${escapeHtml(name)}</span></div>
                    <div class="osm-info-row"><span class="osm-label">📞 Điện thoại</span><span>${escapeHtml(phone)}</span></div>
                    <div class="osm-info-row"><span class="osm-label">🏠 Địa chỉ</span><span>${escapeHtml(address)}</span></div>
                    <div class="osm-info-row"><span class="osm-label">💳 Thanh toán</span><span>${escapeHtml(paymentText)}</span></div>
                    ${note ? `<div class="osm-info-row"><span class="osm-label">📝 Ghi chú</span><span>${escapeHtml(note)}</span></div>` : ''}
                </div>
                <div class="osm-divider"></div>
                <div class="osm-items">${itemsHtml}</div>
                <div class="osm-total-row">
                    <span>💰 Tổng tiền</span>
                    <span class="osm-total-amount">${formatMoney(total)}</span>
                </div>
            </div>
            <div class="osm-footer">
                <button class="osm-close-btn" id="osmCloseBtn">
                    🎁 Xác nhận đơn hàng
                </button>
            </div>
        </div>`;

    if (!document.getElementById('osmStyle')) {
        const style = document.createElement('style');
        style.id = 'osmStyle';
        style.textContent = `
            #orderSuccessModal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px; }
            .osm-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); }
            .osm-card { position: relative; background: #fff; border-radius: 20px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.18); animation: osmIn .25s ease; }
            @keyframes osmIn { from { opacity:0; transform: translateY(20px) scale(.97); } to { opacity:1; transform: none; } }
            .osm-header { background: linear-gradient(135deg, #cc2729, #e8472a); padding: 28px 24px 20px; text-align: center; border-radius: 20px 20px 0 0; }
            .osm-icon { font-size: 2.5rem; margin-bottom: 8px; }
            .osm-title { color: #fff; font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; }
            .osm-subtitle { color: rgba(255,255,255,0.85); font-size: 0.9rem; margin: 0; }
            .osm-body { padding: 20px 24px; }
            .osm-info-grid { display: flex; flex-direction: column; gap: 8px; }
            .osm-info-row { display: flex; gap: 10px; font-size: 0.9rem; }
            .osm-label { color: #888; min-width: 110px; flex-shrink: 0; }
            .osm-divider { height: 1px; background: #f0e8e8; margin: 16px 0; }
            .osm-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
            .order-modal-item { display: grid; grid-template-columns: 20px 1fr auto auto; gap: 8px; align-items: center; font-size: 0.875rem; padding: 8px 10px; background: #fdf8f8; border-radius: 8px; }
            .omi-num { color: #cc2729; font-weight: 700; }
            .omi-name { color: #333; }
            .omi-qty { color: #888; }
            .omi-price { color: #cc2729; font-weight: 600; white-space: nowrap; }
            .osm-total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 10px; background: #fff3cd; border-radius: 10px; font-weight: 600; font-size: 1rem; }
            .osm-total-amount { color: #cc2729; font-size: 1.2rem; font-weight: 700; }
            .osm-footer { padding: 0 24px 24px; }
            .osm-close-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #f7f700, #ffe486); color: #cc2729; font-weight: 700; font-size: 1rem; border: none; border-radius: 12px; cursor: pointer; font-family: 'Be Vietnam Pro', sans-serif; transition: transform .15s; }
            .osm-close-btn:hover { transform: translateY(-2px); }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(modal);
    const closeModal = () => {
        modal.remove();
        cartData = [];
        saveCartToStorage(cartData);
        renderCart();
        showNotification('🧧 Chốt đơn thành công! Chúc mừng năm mới! 🎊');
    };

    document.getElementById('osmCloseBtn').addEventListener('click', closeModal);
    document.getElementById('osmOverlay').addEventListener('click', closeModal);
}
// Hiển thị thông báo
function showNotification(message) {
    if (typeof showToast === 'function') {
        showToast(message);
        return;
    }

    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
    clearTimeout(showNotification._t);
    showNotification._t = setTimeout(() => { el.style.display = 'none'; }, 3000);
}
// Khởi tạo khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    if (!protectCartPage()) return;
    renderCart();
});

// Sync khi detail page thêm hàng ở tab khác 
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        cartData = loadCartFromStorage();
        renderCart();
    }
});