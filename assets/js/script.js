document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([
    injectSharedSection(".header", "header.html"), 
    injectSharedSection(".footer", "footer.html")
  ]);
  if (typeof window.updateCartBadge === "function") {
    window.updateCartBadge();
  }
  markActiveNav();
  initBackToTop();
  initUserUI();
  initHamburgerMenu();
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

  // Đánh dấu active cho cả desktop nav và mobile nav
  const activeLinks = document.querySelectorAll(activeSelector);
  activeLinks.forEach(link => {
    link.classList.add("active");
  });
}

function initHamburgerMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  if (!btn || !mobileNav) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = mobileNav.classList.toggle("open");
    // Đổi icon: ☰ ↔ ✕
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = isOpen ? "fas fa-times" : "fas fa-bars";
    }
  });

  // Đóng menu khi bấm ra ngoài
  document.addEventListener("click", (e) => {
    if (!mobileNav.contains(e.target) && !btn.contains(e.target)) {
      mobileNav.classList.remove("open");
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fas fa-bars";
    }
  });

  // Đóng menu khi bấm vào link
  mobileNav.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fas fa-bars";
    });
  });
}

function getCurrentPageName() {
  const path = window.location.pathname || "";
  const page = path.split("/").pop();
  return page || "index.html";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function handleLogout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("cart");
  if (typeof window.updateCartBadge === "function") {
    window.updateCartBadge();
  }
  window.location.href = "index.html";
}

window.handleLogout = handleLogout;

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

}

function initUserUI() {
  const userData = localStorage.getItem("currentUser");
  const userBtn = document.getElementById("userBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const mobileUserBtn = document.getElementById("mobileUserBtn");

  if (userData && userBtn) {
    const user = JSON.parse(userData);
    if (user.name) {
      // Desktop: hiển thị tên kế bên icon user
      userBtn.innerHTML = `<i class="fa-regular fa-user"></i> <span class="user-name-span">${escapeHtml(user.name)}</span>`;
      userBtn.classList.add("logged-in");
      if (logoutBtn) {
        logoutBtn.style.display = "flex";
        logoutBtn.setAttribute("title", "Đăng xuất");
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          handleLogout();
        });
      }
      // Mobile: đổi text "Tài khoản" → tên user + nút đăng xuất
      if (mobileUserBtn) {
        mobileUserBtn.textContent = `👤 ${user.name}`;
        mobileUserBtn.href = "#";
        mobileUserBtn.addEventListener("click", (e) => {
          e.preventDefault();
          handleLogout();
        });
        mobileUserBtn.textContent = `🚪 Đăng xuất (${user.name})`;
      }
    }
  } else {
    // Chưa đăng nhập
    if (userBtn) {
      userBtn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      userBtn.classList.remove("logged-in");
    }
    if (logoutBtn) logoutBtn.style.display = "none";
    if (mobileUserBtn) {
      mobileUserBtn.textContent = "👤 Đăng nhập";
      mobileUserBtn.href = "login.html";
    }
  }

  // Protect cart link - kiểm tra login khi click giỏ hàng
  const cartLink = document.querySelector("a.cart");
  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      if (!userData) {
        e.preventDefault();
        localStorage.setItem("needLoginMessage", "true");
        window.location.href = "login.html";
      }
    });
  }
}
