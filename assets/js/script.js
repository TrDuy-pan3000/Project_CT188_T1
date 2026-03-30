// ===========================
// SCRIPT.JS - Hàm dùng chung cho toàn bộ trang
// ===========================
// File này được nhúng vào TẤT CẢ các trang HTML của dự án.
// Phụ trách các tính năng dùng chung:
//   1. Inject header/footer từ file HTML riêng (tái sử dụng, tránh lặp code)
//   2. Đánh dấu link active trên thanh điều hướng theo trang hiện tại
//   3. Điều khiển menu hamburger trên mobile
//   4. Nút cuộn lên đầu trang (Back to Top)
//   5. Hiển thị tên user / nút đăng xuất sau khi đăng nhập
//   6. Bảo vệ link giỏ hàng: chuyển về login nếu chưa đăng nhập


// ===== KHỞI ĐỘNG KHI TRANG TẢI XONG =====
// DOMContentLoaded đảm bảo tất cả HTML đã sẵn sàng trước khi chạy JS
// Dùng async để có thể await inject header/footer trước; các hàm khác chạy sau
document.addEventListener("DOMContentLoaded", async () => {
  // Inject header và footer song song (Promise.all) để tối ưu tốc độ tải
  await Promise.all([
    injectSharedSection(".header", "header.html"),
    injectSharedSection(".footer", "footer.html")
  ]);
  // Sau khi header đã được inject, cập nhật badge giỏ hàng (số lượng sản phẩm)
  if (typeof window.updateCartBadge === "function") {
    window.updateCartBadge();
  }
  markActiveNav();       // Đánh dấu link active trên nav
  initBackToTop();       // Khởi tạo nút cuộn lên đầu trang
  initUserUI();          // Cập nhật giao diện theo trạng thái đăng nhập
  initHamburgerMenu();   // Khởi tạo menu hamburger cho mobile
});

// ===== INJECT HEADER / FOOTER TỪ FILE HTML RIÊNG =====
// Mục đích: viết header/footer 1 lần, dùng cho nhiều trang → dễ bảo trì
// selector: CSS selector của phần tử chứa (vd: ".header")
// filePath: đường dẫn file HTML cần nhúng vào (vd: "header.html")
async function injectSharedSection(selector, filePath) {
  const target = document.querySelector(selector);
  // Bỏ qua nếu phần tử không tồn tại, hoặc đã có nội dung (tránh inject 2 lần)
  if (!target || target.innerHTML.trim() !== "") {
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      return; // Bỏ qua lặng lẽ nếu file không tải được (tránh crash trang)
    }
    target.innerHTML = await response.text(); // Đổ HTML vào phần tử
  } catch (error) {
    // Dùng console.warn thay vì console.error vì lỗi này không ảnh hưởng chức năng chính
    console.warn(`Không tải được ${filePath}:`, error);
  }
}

// ===== ĐÁNH DẤU LINK ACTIVE TRÊN THANH ĐIỀU HƯỚNG =====
// Đọc tên file hiện tại (index.html, menu.html…), tra trong bảng map
// rồi thêm class "active" vào link tương ứng trên cả desktop nav và mobile nav
function markActiveNav() {
  const page = getCurrentPageName();
  // Bảng ánh xạ: tên file → CSS selector của link nav tương ứng
  const map = {
    "index.html": ".header__main",
    "menu.html": ".header__menu",
    "story.html": ".header__story"
  };

  const activeSelector = map[page];
  if (!activeSelector) {
    return; // Trang không có trong map (vd: detail.html, cart.html) → không cần đánh dấu
  }

  // querySelectorAll để lấy cả link desktop lẫn mobile (cùng class, có 2 phần tử)
  const activeLinks = document.querySelectorAll(activeSelector);
  activeLinks.forEach(link => {
    link.classList.add("active");
  });
}

// ===== MENU HAMBURGER CHO MOBILE =====
// Khi màn hình nhỏ, nav ẩn đi và hiển thị icon ☰.
// Hàm này xử lý: mở/đóng menu khi click icon, đóng khi click ra ngoài, đóng khi chọn link
function initHamburgerMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const mobileNav = document.getElementById("mobileNav");
  if (!btn || !mobileNav) return; // Thoát sớm nếu header chưa inject xong

  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Ngăn click lan ra document (sẽ kích hoạt listener đóng menu bên dưới)
    const isOpen = mobileNav.classList.toggle("open"); // toggle trả về true nếu vừa thêm class
    // Đổi icon: ☰ (bars) khi đóng → ✕ (times) khi mở
    const icon = btn.querySelector("i");
    if (icon) {
      icon.className = isOpen ? "fas fa-times" : "fas fa-bars";
    }
  });

  // Đóng menu khi bấm bất kỳ nơi nào NGOÀI menu và nút hamburger
  document.addEventListener("click", (e) => {
    if (!mobileNav.contains(e.target) && !btn.contains(e.target)) {
      mobileNav.classList.remove("open");
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fas fa-bars"; // Reset icon về ☰
    }
  });

  // Đóng menu ngay khi người dùng chọn một link (để nav không che trang mới)
  mobileNav.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      const icon = btn.querySelector("i");
      if (icon) icon.className = "fas fa-bars";
    });
  });
}

// ===== LẤY TÊN FILE TRANG HIỆN TẠI =====
// window.location.pathname trả về "/Project-T1/menu.html"
// .split("/").pop() lấy phần tử cuối → "menu.html"
// Nếu rỗng (truy cập thư mục gốc "/") thì trả về "index.html" làm mặc định
function getCurrentPageName() {
  const path = window.location.pathname || "";
  const page = path.split("/").pop();
  return page || "index.html";
}

// ===== HÀM ESCAPE HTML (CHỐNG XSS) =====
// Khi hiển thị dữ liệu từ người dùng (vd: tên user) vào innerHTML,
// cần escape để ký tự đặc biệt (<, >, &, ") không bị trình duyệt hiểu nhầm thành HTML
// Kỹ thuật: gán vào textContent (an toàn) rồi đọc lại qua innerHTML (đã escape)
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value); // Tự động escape ký tự đặc biệt
  return div.innerHTML;            // Trả về chuỗi đã được escape an toàn
}

// ===== HÀM ĐĂNG XUẤT =====
// Xoá thông tin user và giỏ hàng khỏi localStorage, cập nhật badge giỏ hàng về 0,
// rồi chuyển hướng về trang chủ
// Được export ra window để có thể gọi từ onclick trong HTML (vd: header.html)
function handleLogout() {
  localStorage.removeItem("currentUser"); // Xoá session người dùng
  localStorage.removeItem("cart");        // Xoá giỏ hàng (tránh để lộ khi đăng xuất)
  if (typeof window.updateCartBadge === "function") {
    window.updateCartBadge(); // Cập nhật badge về 0 ngay lập tức
  }
  window.location.href = "index.html"; // Chuyển về trang chủ
}

// Gán vào window để các file HTML có thể gọi: onclick="handleLogout()"
window.handleLogout = handleLogout;

// ===== NÚT CUỘN LÊN ĐẦU TRANG (BACK TO TOP) =====
// Nếu trang HTML chưa có nút (id="backToTop"), hàm tự tạo và gắn vào body.
// Nút chỉ hiện (class "show") khi người dùng cuộn xuống hơn 320px.
function initBackToTop() {
  let button = document.getElementById("backToTop");
  // Tự động tạo nút nếu HTML không khai báo sẵn → không cần copy-paste thủ công vào mỗi trang
  if (!button) {
    button = document.createElement("button");
    button.id = "backToTop";
    button.className = "back-to-top";
    button.type = "button";
    button.ariaLabel = "Lên đầu trang"; // Hỗ trợ screen reader (accessibility)
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(button);
  }

  // Hàm kiểm tra vị trí cuộn → thêm/bỏ class "show" để CSS hide/show nút
  const toggleButton = () => {
    if (window.scrollY > 320) {
      button.classList.add("show");    // Hiện nút khi cuộn xuống đủ xa
    } else {
      button.classList.remove("show"); // Ẩn nút khi ở gần đầu trang
    }
  };

  toggleButton(); // Kiểm tra ngay khi trang load (người dùng có thể F5 ở giữa trang)
  window.addEventListener("scroll", toggleButton);
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn mượt lên đầu trang
  });
}

// ===== CẬP NHẬT GIAO DIỆN THEO TRẠNG THÁI ĐĂNG NHẬP =====
// Đọc "currentUser" từ localStorage để kiểm tra ai đang đăng nhập.
// Nếu đã đăng nhập: hiện tên trên nút user (desktop) và thay link "Tài khoản" (mobile).
// Nếu chưa đăng nhập: hiện icon user trống và link về login.html.
// Ngoài ra bảo vệ link giỏ hàng: chưa đăng nhập thì chuyển sang trang đăng nhập.
function initUserUI() {
  const userData = localStorage.getItem("currentUser"); // null nếu chưa đăng nhập
  const userBtn       = document.getElementById("userBtn");       // Nút user trên header desktop
  const logoutBtn     = document.getElementById("logoutBtn");     // Nút đăng xuất desktop
  const mobileUserBtn = document.getElementById("mobileUserBtn"); // Link user trong mobile nav

  if (userData && userBtn) {
    // Đã đăng nhập: parse JSON để lấy object user
    const user = JSON.parse(userData);
    if (user.name) {
      // Desktop: thêm tên user bên cạnh icon, thêm class để CSS style khác đi
      userBtn.innerHTML = `<i class="fa-regular fa-user"></i> <span class="user-name-span">${escapeHtml(user.name)}</span>`;
      userBtn.classList.add("logged-in");
      userBtn.removeAttribute("href"); // Ngăn click vào tên bị chuyển về trang login
      userBtn.style.cursor = "default"; // Đổi con trỏ chuột
      if (logoutBtn) {
        logoutBtn.style.display = "flex";              // Hiển thị nút đăng xuất
        logoutBtn.setAttribute("title", "Đăng xuất"); // Tooltip khi hover
        logoutBtn.addEventListener("click", (e) => {
          e.preventDefault();
          handleLogout(); // Gọi hàm đăng xuất ở trên
        });
      }
      // Mobile: thay text link thành thông tin đăng xuất, click sẽ gọi handleLogout
      if (mobileUserBtn) {
        mobileUserBtn.textContent = `👤 ${user.name}`;
        mobileUserBtn.href = "#";
        mobileUserBtn.addEventListener("click", (e) => {
          e.preventDefault();
          handleLogout();
        });
        // Ghi đè text lần nữa để hiển thị icon cửa + tên user (gợi ý đăng xuất)
        mobileUserBtn.textContent = `🚪 Đăng xuất (${user.name})`;
      }
    }
  } else {
    // Chưa đăng nhập: reset giao diện về trạng thái mặc định
    if (userBtn) {
      userBtn.innerHTML = `<i class="fa-regular fa-user"></i>`; // Chỉ icon, không có tên
      userBtn.classList.remove("logged-in");
    }
    if (logoutBtn) logoutBtn.style.display = "none"; // Ẩn nút đăng xuất
    if (mobileUserBtn) {
      mobileUserBtn.textContent = "👤 Đăng nhập";
      mobileUserBtn.href = "login.html"; // Trỏ về trang đăng nhập
    }
  }

  // Bảo vệ link giỏ hàng: nếu chưa đăng nhập thì chặn và chuyển sang login
  // "needLoginMessage" flag để login.js biết cần hiển thị toast thông báo lý do
  const cartLink = document.querySelector("a.cart");
  if (cartLink) {
    cartLink.addEventListener("click", (e) => {
      if (!userData) {
        e.preventDefault(); // Ngăn điều hướng bình thường
        localStorage.setItem("needLoginMessage", "true"); // Đặt flag cho login.js
        window.location.href = "login.html";
      }
    });
  }
}
