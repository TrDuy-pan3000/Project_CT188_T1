
const btn = document.getElementById("filterBtn");
const modal = document.getElementById("filterModal");
const overlay = document.getElementById("overlay");
const applyBtn = document.getElementById("applyFilter");
const img = document.querySelectorAll("img");
let selectedCategory = "";

btn.onclick = () => {
    modal.classList.add("active");
    overlay.classList.add("active");
};

overlay.onclick = document.getElementById("closeFilter").onclick = () => {
    modal.classList.remove("active");
    overlay.classList.remove("active");

};

document.querySelectorAll(".category-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".category-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");
        selectedCategory = btn.dataset.value;
        applyBtn.disabled = false;
    };
});

applyBtn.onclick = () => {
    if (!selectedCategory) return;

    const cards = document.querySelectorAll(".menu-card");

    cards.forEach(card => {
        if (selectedCategory === "all" || card.dataset.category === selectedCategory) {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });

    modal.classList.remove("active");
    overlay.classList.remove("active");
};
function boDauTiengViet(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
const searchInput = document.getElementById("searchInput");
const menuCards = document.querySelectorAll(".menu-card");

searchInput.addEventListener("input", () => {
  const keyword = boDauTiengViet(searchInput.value.toLowerCase().trim());

  menuCards.forEach(card => {
    const name = boDauTiengViet(card.querySelector(".food-name").innerText.toLowerCase());

    if (name.includes(keyword)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
});
