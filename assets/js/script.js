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

  if (userData && userBtn) {
    const user = JSON.parse(userData);
    if (user.name) {
      // Đã đăng nhập - hiển thị tên kế bên icon user
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
    }
  } else {
    // Chưa đăng nhập
    if (userBtn) {
      userBtn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      userBtn.classList.remove("logged-in");
    }
    if (logoutBtn) logoutBtn.style.display = "none";
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
