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

let cartData = loadCartFromStorage();

// Format tiền
function formatMoney(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

// Render giỏ hàng 
function renderCart() {
    cartData = loadCartFromStorage();
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
// Simple HTML escape helper
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
    cartContainer.innerHTML = cartData.map(item => `
        <div class="cart-item">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="item-image"
                 onerror="this.src='assets/images/logo.png'">
            <div class="item-info">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-price">${formatMoney(item.price)}</div>
                <div class="item-qty">
                    <button class="qty-btn" onclick="changeQuantity('${escapeHtml(String(item.id))}', -1)">−</button>
                    <span class="qty-value">${item.quantity || 1}</span>
                    <button class="qty-btn" onclick="changeQuantity('${escapeHtml(String(item.id))}', 1)">+</button>
                </div>
            </div>
            <div class="item-right">
                <div class="item-subtotal">${formatMoney(item.price * (item.quantity || 1))}</div>
                <button class="remove-btn" onclick="confirmRemove('${escapeHtml(String(item.id))}')">🗑️ Xóa</button>
            </div>
        </div>
    `).join('');

    updateTotal();
}

// Thay đổi số lượng
function changeQuantity(id, delta) {
    const item = cartData.find(i => String(i.id) === String(id));
    if (!item) return;
    item.quantity = (item.quantity || 1) + delta;
    if (item.quantity <= 0) {
        cartData = cartData.filter(i => String(i.id) !== String(id));
    }
    saveCartToStorage(cartData);
    renderCart();
}

// Xóa sản phẩm (modal xác nhận) 
function confirmRemove(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        cartData = cartData.filter(i => String(i.id) !== String(id));
        saveCartToStorage(cartData);
        renderCart();
        showNotification('Đã xóa sản phẩm! 🗑️');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

});

// Tổng tiền 
function updateTotal() {
    const total = cartData.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const el = document.getElementById('totalAmount');
    if (el) el.textContent = formatMoney(total);
}

// Thanh toán 
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
    const total = document.getElementById('totalAmount')?.textContent;

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
    orderDetails += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💰 TỔNG TIỀN: ${total}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    orderDetails += `\n\n📝 Ghi chú: ${note || 'Không có'}\n\n✨ Cảm ơn quý khách!\n🎁 Chúc năm mới an khang thịnh vượng!`;

    alert(orderDetails);
    cartData = [];
    saveCartToStorage(cartData);
    renderCart();
    showNotification('🧧 Chốt đơn thành công! Chúc mừng năm mới! 🎊');
}

// Notification 
function showNotification(message) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
    clearTimeout(showNotification._t);
    showNotification._t = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// Sync khi detail page thêm hàng ở tab khác 
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        cartData = loadCartFromStorage();
        renderCart();
    }
});