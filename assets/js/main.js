document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
});

let toastTimer;

function showToast(message) {
    let toastEl = document.getElementById('appToast');
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.id = 'appToast';
        toastEl.className = 'app-toast';
        document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2200);
}

window.showToast = showToast;

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
    });
}

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += product.quantity || 1;
    } else {
        cart.push({
            ...product,
            quantity: product.quantity || 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}
