const filterBtn = document.getElementById("filterBtn");
const modal = document.getElementById("filterModal");
const overlay = document.getElementById("overlay");
const applyBtn = document.getElementById("applyFilter");
const closeFilterBtn = document.getElementById("closeFilter");
const categoryButtons = document.querySelectorAll(".category-btn");
const searchInput = document.getElementById("searchInput");
const productsMenu = document.querySelector(".menu-grid");

let selectedCategory = "all";
let menuCards = [];

async function loadMenu() {
  productsMenu.innerHTML = '<div class="menu-loading">Đang tải thực đơn...</div>';
  const respone = await fetch("assets/js/product.json");
  const data = await respone.json();
  const htmlString = data
    .map((prod) => {
      const tagHTML = prod.tag
        ? `<span class="card-tag ${prod.tag.cssClass}">${prod.tag.text}</span>`
        : "";
      return `
        <div class="menu-card" data-category="${prod.category}" data-product-id="${prod.id}">
          <a href="detail.html?id=${prod.id}" class="image-wrapper">
            <img src="${prod.mainImg}" alt="${prod.name}" />
            ${tagHTML}
          </a>
          <div class="content-wrapper">
            <h3 class="food-name">${prod.name}</h3>
            <p class="short-description">${prod.shortDescription}</p>
            <span class="menu-rating">${prod.rating}</span>
            <div class="card-bottom">
              <p class="price">${prod.price}₫</p>
              <button type="button" class="btn-add" data-product-id="${prod.id}" data-product-name="${prod.name}" data-product-price="${prod.price}" data-product-image="${prod.mainImg}">
                <i class="fas fa-shopping-cart"></i> Thêm
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  productsMenu.innerHTML = htmlString;
  menuCards = Array.from(document.querySelectorAll(".menu-card"));
  
  // Thêm event listener cho các nút "Thêm"
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      
      if (!window.ensureLogin || !window.ensureLogin()) return;

      const productId = btn.dataset.productId;
      const productName = btn.dataset.productName;
      const productPrice = Number(btn.dataset.productPrice.replace(/[^\d]/g, "")) || 0;
      const productImage = btn.dataset.productImage;

      if (typeof addToCart === "function") {
        addToCart({
          id: Number(productId),
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,
        });
      }

      if (typeof showToast === "function") {
        showToast(`✅ Đã thêm 1 ${productName} vào giỏ!`);
      }
    });
  });
}

function boDauTiengViet(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function applySearchKeyword(rawKeyword = "") {
  if (!menuCards || !menuCards.length) {
    return;
  }

  const keyword = boDauTiengViet(rawKeyword.trim());
  menuCards.forEach((card) => {
    const categoryMatch =
      selectedCategory === "all" || card.dataset.category === selectedCategory;
    const name = boDauTiengViet(
      card.querySelector(".food-name")?.innerText || "",
    );
    const keywordMatch = !keyword || name.includes(keyword);

    if (categoryMatch && keywordMatch) {
      card.classList.remove("hidden");
      card.style.display = "";
    } else {
      card.classList.add("hidden");
      card.style.display = "none";
    }
  });
}

if (filterBtn && modal && overlay) {
  filterBtn.onclick = () => {
    modal.classList.add("active");
    overlay.classList.add("active");
  };
}

if (overlay && modal && closeFilterBtn) {
  const closeModal = () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");
  };

  overlay.onclick = closeModal;
  closeFilterBtn.onclick = closeModal;
}

categoryButtons.forEach((button) => {
  button.onclick = () => {
    categoryButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    selectedCategory = button.dataset.value || "";
    if (applyBtn) {
      applyBtn.disabled = false;
    }
  };
});

if (applyBtn) {
  applyBtn.onclick = () => {
    if (!selectedCategory || !menuCards.length) {
      return;
    }

    applySearchKeyword(searchInput?.value || "");

    modal?.classList.remove("active");
    overlay?.classList.remove("active");
  };
}

async function initMenuPage() {
  await loadMenu();

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applySearchKeyword(searchInput.value);
    });

    const initialKeyword = new URLSearchParams(window.location.search).get(
      "keyword",
    );
    if (initialKeyword) {
      searchInput.value = initialKeyword;
    }
  }

  applySearchKeyword(searchInput?.value || "");
}

initMenuPage();
