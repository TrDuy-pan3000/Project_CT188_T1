const SEARCH_HISTORY_KEY = "bepnhaNgo_recent_searches";
const SEARCH_MENU_CACHE_KEY = "bepnhaNgo_menu_cache";
const SEARCH_HISTORY_LIMIT = 8;
const SEARCH_SUGGESTION_LIMIT = 6;

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([injectSharedSection(".header", "header.html"), injectSharedSection(".footer", "footer.html")]);
  markActiveNav();
  refreshMenuCacheFromDom();
  initHeaderSearch();
  initBackToTop();
  document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    injectSharedSection(".header", "header.html"),
    injectSharedSection(".footer", "footer.html")
  ]);

  markActiveNav();
  refreshMenuCacheFromDom();
  initHeaderSearch();
  initBackToTop();
  initUserUI();
});
});

async function injectSharedSection(selector, filePath) {
  const target = document.querySelector(selector);
  if (!target || target.innerHTML.trim() !== "") {
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      return;
    }
    target.innerHTML = await response.text();
  } catch (error) {
    console.warn(`Không tải được ${filePath}:`, error);
  }
}

function markActiveNav() {
  const page = getCurrentPageName();
  const map = {
    "index.html": ".header__main",
    "menu.html": ".header__menu",
    "story.html": ".header__story"
  };

  const activeSelector = map[page];
  if (!activeSelector) {
    return;
  }

  const activeLink = document.querySelector(activeSelector);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

function getCurrentPageName() {
  const path = window.location.pathname || "";
  const page = path.split("/").pop();
  return page || "index.html";
}

function normalizeVietnamese(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

function dedupeEntries(entries) {
  const map = new Map();
  entries.forEach((item) => {
    const key = normalizeVietnamese(item.name);
    if (!key || map.has(key)) {
      return;
    }
    map.set(key, item);
  });
  return Array.from(map.values());
}

function refreshMenuCacheFromDom() {
  const cards = document.querySelectorAll(".menu-card");
  const entries = [];

  cards.forEach((card) => {
    const name = card.querySelector(".food-name")?.textContent?.trim();
    if (!name) {
      return;
    }

    let href = "menu.html";
    const detailLink = card.querySelector("a[href]");
    const button = card.querySelector("button[onclick]");

    if (detailLink) {
      href = detailLink.getAttribute("href") || href;
    } else if (button) {
      const onclickValue = button.getAttribute("onclick") || "";
      const match = onclickValue.match(/['\"]([^'\"]+\.html[^'\"]*)['\"]/);
      if (match?.[1]) {
        href = match[1];
      }
    }

    entries.push({ name, href });
  });

  if (!entries.length) {
    document.querySelectorAll(".product-card h3, .product-name").forEach((node) => {
      const name = node.textContent?.trim();
      if (name) {
        entries.push({ name, href: "menu.html" });
      }
    });
  }

  const normalizedEntries = dedupeEntries(entries);

  if (!normalizedEntries.length) {
    return;
  }

  try {
    localStorage.setItem(SEARCH_MENU_CACHE_KEY, JSON.stringify(normalizedEntries));
  } catch (error) {
    console.warn("Không thể lưu cache menu:", error);
  }
}

function getMenuDataSource() {
  const cards = document.querySelectorAll(".menu-card");
  if (cards.length) {
    const entries = [];
    cards.forEach((card) => {
      const name = card.querySelector(".food-name")?.textContent?.trim();
      if (name) {
        entries.push({ name, href: "menu.html" });
      }
    });
    if (entries.length) {
      return dedupeEntries(entries);
    }
  }

  const fallbackEntries = [];
  document.querySelectorAll(".product-card h3, .product-name").forEach((node) => {
    const name = node.textContent?.trim();
    if (name) {
      fallbackEntries.push({ name, href: "menu.html" });
    }
  });
  if (fallbackEntries.length) {
    return dedupeEntries(fallbackEntries);
  }

  try {
    const cached = JSON.parse(localStorage.getItem(SEARCH_MENU_CACHE_KEY) || "[]");
    return Array.isArray(cached) ? dedupeEntries(cached) : [];
  } catch (error) {
    return [];
  }
}

function loadRecentSearches() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveRecentSearches(list) {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn("Không thể lưu lịch sử tìm kiếm:", error);
  }
}

function pushRecentSearch(keyword) {
  const cleanKeyword = String(keyword).trim();
  if (!cleanKeyword) {
    return;
  }

  const current = loadRecentSearches().filter((item) => normalizeVietnamese(item) !== normalizeVietnamese(cleanKeyword));
  current.unshift(cleanKeyword);
  saveRecentSearches(current.slice(0, SEARCH_HISTORY_LIMIT));
}

function initHeaderSearch() {
  const searchInput = document.getElementById("headerSearchInput");
  const dropdown = document.getElementById("headerSearchDropdown");
  const searchContainer = document.getElementById("headerSearch");
  const searchToggle = document.getElementById("headerSearchToggle");
  const searchPanel = document.getElementById("headerSearchPanel");

  if (!searchInput || !dropdown || !searchContainer || !searchToggle || !searchPanel) {
    return;
  }

  const renderHistory = () => {
    const history = loadRecentSearches();
    if (!history.length) {
      dropdown.innerHTML = '<div class="search-empty">Chưa có lịch sử tìm kiếm gần đây.</div>';
      dropdown.classList.add("show");
      return;
    }

    dropdown.innerHTML = `
      <div class="search-dropdown-section-title">
        <span>Tìm kiếm gần đây</span>
        <button class="search-clear-history" data-action="clear-history" type="button">Xóa tất cả</button>
      </div>
      ${history
        .map(
          (item) => `
            <div class="search-dropdown-item" data-action="history" data-keyword="${escapeHtml(item)}">
              <span>${escapeHtml(item)}</span>
              <button class="search-item-remove" data-action="remove-history" data-keyword="${escapeHtml(item)}" type="button" aria-label="Xóa lịch sử">×</button>
            </div>
          `
        )
        .join("")}
    `;
    dropdown.classList.add("show");
  };

  const renderSuggestions = (keyword) => {
    const source = getMenuDataSource();
    const normalizedKeyword = normalizeVietnamese(keyword);
    const suggestions = source
      .filter((item) => normalizeVietnamese(item.name).includes(normalizedKeyword))
      .slice(0, SEARCH_SUGGESTION_LIMIT);

    if (!suggestions.length) {
      dropdown.innerHTML = '<div class="search-empty">Không tìm thấy món phù hợp.</div>';
      dropdown.classList.add("show");
      return;
    }

    dropdown.innerHTML = suggestions
      .map(
        (item) => `
          <button class="search-dropdown-item" data-action="suggestion" data-keyword="${escapeHtml(item.name)}" type="button">
            <span>${escapeHtml(item.name)}</span>
            <span class="search-dropdown-meta">Gợi ý món</span>
          </button>
        `
      )
      .join("");
    dropdown.classList.add("show");
  };

  const submitKeyword = (keyword) => {
    const cleanKeyword = String(keyword).trim();
    if (!cleanKeyword) {
      return;
    }

    pushRecentSearch(cleanKeyword);
    searchContainer.classList.remove("open");
    window.location.href = `menu.html?keyword=${encodeURIComponent(cleanKeyword)}`;
  };

  searchToggle.addEventListener("click", () => {
    searchContainer.classList.toggle("open");
    if (searchContainer.classList.contains("open")) {
      searchInput.focus();
      if (!searchInput.value.trim()) {
        renderHistory();
      }
    } else {
      dropdown.classList.remove("show");
    }
  });

  searchInput.addEventListener("focus", () => {
    if (!searchInput.value.trim()) {
      renderHistory();
    }
  });

  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      renderHistory();
      return;
    }

    renderSuggestions(keyword);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const firstItem = dropdown.querySelector(".search-dropdown-item[data-keyword]");
    const keyword = searchInput.value.trim() || firstItem?.dataset.keyword || "";
    submitKeyword(keyword);
  });

  dropdown.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    const keyword = actionElement.dataset.keyword || "";

    if (action === "suggestion" || action === "history") {
      submitKeyword(keyword);
      return;
    }

    if (action === "remove-history") {
      event.stopPropagation();
      const nextHistory = loadRecentSearches().filter((item) => normalizeVietnamese(item) !== normalizeVietnamese(keyword));
      saveRecentSearches(nextHistory);
      renderHistory();
      return;
    }

    if (action === "clear-history") {
      saveRecentSearches([]);
      renderHistory();
    }
  });

  document.addEventListener("click", (event) => {
    if (!searchContainer.contains(event.target)) {
      searchContainer.classList.remove("open");
      dropdown.classList.remove("show");
    }
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function initBackToTop() {
  let button = document.getElementById("backToTop");
  if (!button) {
    button = document.createElement("button");
    button.id = "backToTop";
    button.className = "back-to-top";
    button.type = "button";
    button.ariaLabel = "Lên đầu trang";
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(button);
  }

  const toggleButton = () => {
    if (window.scrollY > 320) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  };

  toggleButton();
  window.addEventListener("scroll", toggleButton);
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function initUserUI() {
  const currentUser = localStorage.getItem("currentUser");
  const userBtn = document.querySelector(".icon-btn[aria-label='Tài khoản']");

  if (currentUser && userBtn) {
    userBtn.innerHTML = `<i class="fa-regular fa-user"></i> ${currentUser}`;
  }
}
}

