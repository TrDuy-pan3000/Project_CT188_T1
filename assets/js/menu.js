const filterBtn = document.getElementById("filterBtn");
const modal = document.getElementById("filterModal");
const overlay = document.getElementById("overlay");
const applyBtn = document.getElementById("applyFilter");
const closeFilterBtn = document.getElementById("closeFilter");
const categoryButtons = document.querySelectorAll(".category-btn");
const searchInput = document.getElementById("searchInput");
const productsMenu = document.querySelector(".menu-grid");

let selectedCategory = "all";
let menuCards;

async function loadMenu() {
  const respone = await fetch("assets/js/product.json");
  const data = await respone.json();
  const htmlString = data
    .map((prod) => {
      const tagHTML = prod.tag
        ? `<span class="card-tag ${prod.tag.cssClass}">${prod.tag.text}</span>`
        : "";
      return `
        <div class="menu-card" data-category="${prod.category}">
          <a href="detail.html?id=${prod.id}" class="image-wrapper">
            <img src="${prod.mainImg}" alt="${prod.name}" />
          </a>
          <div class="content-wrapper">
            ${tagHTML}
            <h3 class="food-name">${prod.name}</h3>
            <p class="short-description">${prod.shortDescription}</p>
            <span>${prod.rating}</span>
            <div class="card-bottom">
              <p class="price">${prod.price}₫</p>
              <button class="btn-add" onclick="addToCart({id:'${prod.id}',name:'${prod.name}',price:${Number(String(prod.price).replace(/[^\d]/g,''))},image:'${prod.mainImg}',quantity:1}); showToast('✅ Đã thêm ${prod.name} vào giỏ!')">
                <i class="fas fa-shopping-cart"></i> Thêm
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  productsMenu.innerHTML = htmlString;
  menuCards = document.querySelectorAll(".menu-card");
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
  if (!menuCards.length) {
    return;
  }

  const keyword = boDauTiengViet(rawKeyword.trim());
  menuCards.forEach((card) => {
    const name = boDauTiengViet(
      card.querySelector(".food-name")?.innerText || "",
    );
    card.style.display = !keyword || name.includes(keyword) ? "" : "none";
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
    if (!selectedCategory) {
      return;
    }
    menuCards.forEach((card) => {
      if (
        selectedCategory === "all" ||
        card.dataset.category === selectedCategory
      ) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });

    modal?.classList.remove("active");
    overlay?.classList.remove("active");
  };
}

loadMenu();

if (searchInput) {
  searchInput.addEventListener("input", () => {
    applySearchKeyword(searchInput.value);
  });

  const initialKeyword = new URLSearchParams(window.location.search).get(
    "keyword",
  );
  if (initialKeyword) {
    searchInput.value = initialKeyword;
    applySearchKeyword(initialKeyword);
  }
}
