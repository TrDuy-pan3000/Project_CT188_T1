const products = [
    {
        id: 1,
        name: "Bánh Tét",
        price: 45000,
        category: "banh-tet",
        image: "assets/images/product-combo-tet.jpg",
        badge: "new",
        description: "Bánh tét truyền thống Nam Bộ"
    },
    {
        id: 2,
        name: "Bia",
        price: 345000,
        category: "do-uong",
        image: "assets/images/product-bia-cao-cap.jpg",
        badge: "new",
        description: "Bia cao cấp quốc tế"
    },
    {
        id: 3,
        name: "Đồ nhậu",
        price: 45000,
        category: "tet-nham-nhi",
        image: "assets/images/product-combo-nhau.jpg",
        badge: "new",
        description: "Đồ nhậu thơm ngon"
    },
    {
        id: 4,
        name: "Bánh Tét Chuối",
        price: 150000,
        category: "banh-tet",
        image: "assets/images/product-banh-tet-chuoi-1.jpg",
        badge: "bestseller",
        description: "Bánh tét nhân chuối đặc biệt"
    },
    {
        id: 5,
        name: "Bánh Tét Đậu",
        price: 120000,
        category: "banh-tet",
        image: "assets/images/product-banh-tet-dau-1.jpg",
        badge: "new",
        description: "Bánh tét nhân đậu xanh"
    },
    {
        id: 6,
        name: "Combo Nhậu Tết",
        price: 250000,
        category: "tet-nham-nhi",
        image: "assets/images/product-combo-nhau.jpg",
        badge: "hot",
        description: "Combo nhậu ngày Tết"
    }
];
let selectedCategory = 'all';
let cartData = [...products];
function formatMoney(amount) {
            return amount.toLocaleString('vi-VN') + 'đ';
        }

        // Render giỏ hàng
        function renderCart() {
            const cartContainer = document.getElementById('cartItems');
            
            if (cartData.length === 0) {
                cartContainer.innerHTML = `
                    <div class="empty-cart">
                        <div class="empty-icon">🎊</div>
                        <div class="empty-message">Chưa có sản phẩm nào trong danh sách Tết</div>
                    </div>
                `;
                updateTotal();
                return;
            }

            cartContainer.innerHTML = cartData.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${formatMoney(item.price)}</div>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${item.id})">
                        🗑️ Xóa
                    </button>
                </div>
            `).join('');

            updateTotal();
        }

        // Xóa sản phẩm
        function removeItem(id) {
            if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
                cartData = cartData.filter(item => item.id !== id);
                renderCart();
                showNotification('Đã xóa sản phẩm!');
            }
        }

        // Cập nhật tổng tiền
        function updateTotal() {
            const total = cartData.reduce((sum, item) => sum + item.price, 0);
            document.getElementById('totalAmount').textContent = formatMoney(total);
        }

        // Thanh toán
        function checkout() {
            if (cartData.length === 0) {
                showNotification('Vui lòng chọn sản phẩm trước khi chốt đơn!');
                return;
            }

            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            const address = document.getElementById('customerAddress').value.trim();
            const note = document.getElementById('customerNote').value.trim();
            const payment = document.querySelector('input[name="payment"]:checked').value;

            if (!name || !phone || !address) {
                showNotification('Vui lòng điền đầy đủ thông tin!');
                return;
            }

            const paymentText = payment === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng';
            const total = document.getElementById('totalAmount').textContent;

            let orderDetails = `
            🎊 Chúc mừng năm mới - Vạn sự như ý! 🎊

👤 Khách hàng: ${name}
📱 Số điện thoại: ${phone}
🏠 Địa chỉ: ${address}
💳 Thanh toán: ${paymentText}

📦 DANH SÁCH SẢN PHẨM:
`;

            cartData.forEach((item, index) => {
                orderDetails += `${index + 1}. ${item.name} - ${formatMoney(item.price)}\n`;
            });

            orderDetails += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 TỔNG TIỀN: ${total}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Ghi chú: ${note || 'Không có'}

✨ Cảm ơn quý khách!
🎁 Chúc quý khách năm mới an khang thịnh vượng!
            `;

            alert(orderDetails);
            
            showNotification('🧧 Chốt đơn thành công! Chúc mừng năm mới! 🎊');
            
        }

        // Hiển thị thông báo
        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }

        renderCart();