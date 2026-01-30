let cart = JSON.parse(localStorage.getItem('cartData')) || [];
function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}">
            <p>${item.name}</p>
            <span>${item.price}đ</span>
        </div>
    `).join('');
    
    //Tính tổng tiền
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('grand-total').innerText = total.toLocaleString() + 'đ';
}

renderCart();


document.querySelector('form').onsubmit = function(e) {
    e.preventDefault();
    const modal = document.getElementById("myModal");
    const modalContent = modal.querySelector('div');
    modalContent.innerHTML = `
        <div class="modal-icon">🎆</div>
        <h2 class="modal-title">CHỐT ĐƠN THÀNH CÔNG!</h2>
        <p class="modal-text">Lộc xuân đang trên đường đến với bạn. Cảm ơn bạn đã sắm Tết cùng chúng tôi!</p>
        <div class="button-group">
            <button onclick="location.reload()" id="btnReload">TIẾP TỤC SẮM TẾT</button>
        </div>
    `;
    
    modal.style.display = "block";
};