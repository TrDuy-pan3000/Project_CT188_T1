// const featuredImg = document.getElementById("main-img");
// const smallImgs = document.querySelectorAll(".small-img");

// smallImgs.forEach((img, index) => {
//   img.addEventListener("click", () => {
//     featuredImg.src = img.src;
//     smallImgs.forEach(i => i.classList.remove("sm-card"));
//     img.classList.add("sm-card");
//   });
// });

const buttons = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    buttons.forEach((b) => b.classList.remove("active"));
    contents.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");

    document.getElementById(target).classList.add("active");
  });
});

const addCartBtn = document.getElementById("add-cart");

function parsePrice(rawPrice) {
  return Number(String(rawPrice).replace(/[^\d]/g, "")) || 0;
}

function makeProductId(name) {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "san-pham";
}

if (addCartBtn) {
  addCartBtn.addEventListener("click", () => {
    const name = document.querySelector(".product-name")?.textContent?.trim() || "Món ăn";
    const quantityInput = document.getElementById("quantity");
    const quantity = Math.max(1, Number(quantityInput?.value) || 1);
    const priceText = document.querySelector(".product-price")?.textContent || "0";
    const price = parsePrice(priceText);
    const image = document.querySelector(".main-img")?.getAttribute("src") || "assets/images/logo.png";

    if (typeof addToCart === "function") {
      addToCart({
        id: makeProductId(name),
        name,
        price,
        image,
        quantity
      });
    }

    if (typeof showToast === "function") {
      showToast(`✅ Đã thêm ${quantity} ${name} vào giỏ!`);
    }
  });
}
