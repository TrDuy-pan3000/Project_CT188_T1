document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    initFeaturedProductsOnHome();
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
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
    });
}

window.updateCartBadge = updateCartBadge;

function isLoggedIn() {
    const currentUser = localStorage.getItem("currentUser");
    return !!currentUser;
}

function ensureLogin() {
    if (!isLoggedIn()) {
        localStorage.setItem("needLoginMessage", "true");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

window.isLoggedIn = isLoggedIn;
window.ensureLogin = ensureLogin;

function addToCart(product) {
    if (!ensureLogin()) return;

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

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

async function initFeaturedProductsOnHome() {
    const cards = document.querySelectorAll('.featured-products .product-card');
    if (!cards.length) return;

    try {
        const response = await fetch('assets/js/product.json');
        if (!response.ok) return;

        const products = await response.json();
        const productByName = new Map(
            products.map((product) => [normalizeText(product.name), product])
        );

        cards.forEach((card) => {
            const titleEl = card.querySelector('h3');
            if (!titleEl) return;

            const product = productByName.get(normalizeText(titleEl.textContent));
            if (!product) return;

            const detailUrl = `detail.html?id=${product.id}`;
            const imgEl = card.querySelector('.card-img img');
            const priceEl = card.querySelector('.price');
            const addBtn = card.querySelector('.btn-add');

            card.style.cursor = 'pointer';

            if (imgEl) {
                imgEl.src = product.mainImg;
                imgEl.alt = product.name;
            }

            if (priceEl) {
                priceEl.textContent = `${product.price}₫`;
            }

            card.addEventListener('click', () => {
                window.location.href = detailUrl;
            });

            if (addBtn) {
                addBtn.setAttribute('href', detailUrl);
                addBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    addToCart({
                        id: product.id,
                        name: product.name,
                        price: Number(String(product.price).replace(/[^\d]/g, '')) || 0,
                        image: product.mainImg,
                        quantity: 1,
                    });

                    if (typeof showToast === 'function') {
                        showToast(`✅ Đã thêm 1 ${product.name} vào giỏ!`);
                    }
                });
            }
        });
    } catch (error) {
        console.warn('Không thể khởi tạo sản phẩm nổi bật ở trang chủ:', error);
    }
}
