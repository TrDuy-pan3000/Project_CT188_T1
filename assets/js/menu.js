const filterBtn = document.getElementById("filterBtn");
const modal = document.getElementById("filterModal");
const overlay = document.getElementById("overlay");
const applyBtn = document.getElementById("applyFilter");
const closeFilterBtn = document.getElementById("closeFilter");
const categoryButtons = document.querySelectorAll(".category-btn");
const menuCards = document.querySelectorAll(".menu-card");
const searchInput = document.getElementById("searchInput");

let selectedCategory = "";

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
        const name = boDauTiengViet(card.querySelector(".food-name")?.innerText || "");
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
            if (selectedCategory === "all" || card.dataset.category === selectedCategory) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }
        });

        modal?.classList.remove("active");
        overlay?.classList.remove("active");
    };
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        applySearchKeyword(searchInput.value);
    });

    const initialKeyword = new URLSearchParams(window.location.search).get("keyword");
    if (initialKeyword) {
        searchInput.value = initialKeyword;
        applySearchKeyword(initialKeyword);
    }
}
