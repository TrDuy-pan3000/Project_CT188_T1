// const filterBtn = document.getElementById("filterBtn");
// const modal = document.getElementById("filterModal");
// const overlay = document.getElementById("overlay");
// const applyBtn = document.getElementById("applyFilter");
// const closeFilterBtn = document.getElementById("closeFilter");
// const categoryButtons = document.querySelectorAll(".category-btn");
// const menuCards = document.querySelectorAll(".menu-card");
// const searchInput = document.getElementById("searchInput");

// let selectedCategory = "";

// function boDauTiengViet(str) {
//   return str
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/đ/g, "d")
//     .replace(/Đ/g, "D")
//     .toLowerCase();
// }

// function applySearchKeyword(rawKeyword = "") {
//   if (!menuCards.length) {
//     return;
//   }

//   const keyword = boDauTiengViet(rawKeyword.trim());
//   menuCards.forEach((card) => {
//     const name = boDauTiengViet(
//       card.querySelector(".food-name")?.innerText || "",
//     );
//     card.style.display = !keyword || name.includes(keyword) ? "" : "none";
//   });
// }

// if (filterBtn && modal && overlay) {
//   filterBtn.onclick = () => {
//     modal.classList.add("active");
//     overlay.classList.add("active");
//   };
// }

// if (overlay && modal && closeFilterBtn) {
//   const closeModal = () => {
//     modal.classList.remove("active");
//     overlay.classList.remove("active");
//   };

//   overlay.onclick = closeModal;
//   closeFilterBtn.onclick = closeModal;
// }

// categoryButtons.forEach((button) => {
//   button.onclick = () => {
//     categoryButtons.forEach((item) => item.classList.remove("active"));
//     button.classList.add("active");
//     selectedCategory = button.dataset.value || "";
//     if (applyBtn) {
//       applyBtn.disabled = false;
//     }
//   };
// });

// if (applyBtn) {
//   applyBtn.onclick = () => {
//     if (!selectedCategory) {
//       return;
//     }

//     menuCards.forEach((card) => {
//       if (
//         selectedCategory === "all" ||
//         card.dataset.category === selectedCategory
//       ) {
//         card.classList.remove("hidden");
//       } else {
//         card.classList.add("hidden");
//       }
//     });

//     modal?.classList.remove("active");
//     overlay?.classList.remove("active");
//   };
// }

// if (searchInput) {
//   searchInput.addEventListener("input", () => {
//     applySearchKeyword(searchInput.value);
//   });

//   const initialKeyword = new URLSearchParams(window.location.search).get(
//     "keyword",
//   );
//   if (initialKeyword) {
//     searchInput.value = initialKeyword;
//     applySearchKeyword(initialKeyword);
//   }
// }
async function loadMenu() {
  const productsMenu = document.querySelector(".menu-grid");
  const respone = await fetch("assets/js/product.json");
  const data = await respone.json();
  productsMenu.innerHTML = ``;
  data.forEach((prod) => {
    const tagHTML = prod.tag
      ? `<span class="card-tag ${prod.tag.cssClass}">${prod.tag.text}</span>`
      : "";
    productsMenu.innerHTML += `
    <div class="menu-card" data-category="banh-tet">
          <a href="detail.html?id=${prod.id}" class="image-wrapper">
            <img src="${prod.mainImg}" alt="${prod.name}" />
          </a>
          <div class="content-wrapper">
          ${tagHTML}
            <h3 class="food-name">${prod.name}</h3>
            <p class="short-description">
              ${prod.shortDescription}
            </p>
            <span>${prod.rating}</span>
            <div class="card-bottom">
              <p class="price">${prod.price}₫</p>
              <a href="detail.html?id=${prod.id}" class="btn-add"
                ><i class="fas fa-shopping-cart"></i> Thêm</a
              >
            </div>
          </div>
    </div>
    `;
  });
}
loadMenu();

