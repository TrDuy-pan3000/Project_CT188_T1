// ============================================================
//  menu.js — Xử lý trang Thực Đơn (menu.html)
//
//  Các chức năng chính:
//   1. loadMenu()         — Tải danh sách sản phẩm từ product.json và render ra lưới
//   2. boDauTiengViet()   — Chuẩn hóa chuỗi tiếng Việt để tìm kiếm không dấu
//   3. applySearchKeyword() — Lọc card sản phẩm theo từ khóa tìm kiếm + danh mục
//   4. initMenuPage()     — Khởi tạo trang: tải sản phẩm, gán sự kiện tìm kiếm
//   5. Các sự kiện modal bộ lọc (mở/đóng, chọn danh mục, áp dụng)
// ============================================================

// --- Lấy các phần tử DOM cần dùng ---
const filterBtn = document.getElementById("filterBtn");       // Nút "Bộ lọc"
const modal = document.getElementById("filterModal");         // Modal panel chọn danh mục
const overlay = document.getElementById("overlay");           // Lớp tối phủ sau modal
const applyBtn = document.getElementById("applyFilter");      // Nút "Áp dụng" trong modal
const closeFilterBtn = document.getElementById("closeFilter"); // Nút "Hủy" trong modal
const categoryButtons = document.querySelectorAll(".category-btn"); // Tất cả nút danh mục
const searchInput = document.getElementById("searchInput");   // Ô tìm kiếm
const productsMenu = document.querySelector(".menu-grid");    // Lưới chứa các card sản phẩm

// --- Biến trạng thái ---
// selectedCategory lưu danh mục đang được chọn, mặc định là "all" (tất cả)
let selectedCategory = "all";
// menuCards lưu mảng các phần tử DOM .menu-card sau khi đã render xong
let menuCards = [];

// ============================================================
//  Hàm loadMenu — Tải sản phẩm từ JSON và render ra lưới HTML
// ============================================================
async function loadMenu() {
  // Hiện thông báo "Đang tải..." trong khi chờ fetch
  productsMenu.innerHTML = '<div class="menu-loading">Đang tải thực đơn...</div>';

  // fetch() gọi file JSON chứa dữ liệu sản phẩm
  const respone = await fetch("assets/js/product.json");
  const data = await respone.json();

  // Duyệt qua từng sản phẩm trong mảng và tạo chuỗi HTML cho card
  const htmlString = data
    .map((prod) => {
      // Nếu sản phẩm có tag (ví dụ: "Mới", "Hot"...) thì tạo thẻ <span> badge
      // prod.tag.cssClass là class CSS xác định màu sắc tag
      // prod.tag.text là tên hiển thị (VD: "Truyền thống", "Mới")
      const tagHTML = prod.tag
        ? `<span class="card-tag ${prod.tag.cssClass}">${prod.tag.text}</span>`
        : "";  // Nếu không có tag thì để trống

      // Template HTML cho mỗi card sản phẩm:
      // - data-category dùng để lọc theo danh mục (applySearchKeyword)
      // - data-product-id dùng để liên kết sang detail.html và thêm vào giỏ hàng
      return `
        <div class="menu-card" data-category="${prod.category}" data-product-id="${prod.id}">
          <!-- Ảnh sản phẩm bọc trong thẻ <a> để click vào ảnh cũng chuyển trang -->
          <a href="detail.html?id=${prod.id}" class="image-wrapper">
            <img src="${prod.mainImg}" alt="${prod.name}" />
            ${tagHTML}
          </a>
          <!-- Phần chữ bên dưới ảnh -->
          <div class="content-wrapper">
            <h3 class="food-name">${prod.name}</h3>
            <p class="short-description">${prod.shortDescription}</p>
            <span class="menu-rating">${prod.rating}</span>
            <!-- Hàng cuối card: giá + nút thêm giỏ hàng
                 Các data-* attribute được JS dùng để thêm vào giỏ mà không cần fetch lại -->
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
    .join("");  // Nối tất cả các chuỗi HTML lại thành một chuỗi duy nhất

  // Ghi toàn bộ HTML sản phẩm vào lưới, thay thế "Đang tải..."
  productsMenu.innerHTML = htmlString;

  // Cập nhật lại mảng menuCards sau khi đã render xong
  menuCards = Array.from(document.querySelectorAll(".menu-card"));

  // Gán sự kiện click cho từng nút "Thêm" vào giỏ hàng
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Ngăn hành vi mặc định (không navigate nếu nút nằm trong thẻ <a>)
      e.preventDefault();

      // Kiểm tra đăng nhập: window.ensureLogin() được định nghĩa ở script.js
      // Nếu chưa đăng nhập sẽ hiện modal login và trả về false → dừng hàm
      if (!window.ensureLogin || !window.ensureLogin()) return;

      // Lấy thông tin sản phẩm từ data-* attribute của nút
      const productId = btn.dataset.productId;
      const productName = btn.dataset.productName;
      // Loại bỏ mọi ký tự không phải số (ví dụ dấu chấm, dấu phẩy...) rồi chuyển thành số
      const productPrice = Number(btn.dataset.productPrice.replace(/[^\d]/g, "")) || 0;
      const productImage = btn.dataset.productImage;

      // Gọi hàm addToCart() được định nghĩa ở script.js để thêm vào giỏ hàng localStorage
      if (typeof addToCart === "function") {
        addToCart({
          id: Number(productId),
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1,  // Từ trang menu luôn thêm 1 cái
        });
      }

      // Hiện toast thông báo xác nhận đã thêm vào giỏ
      if (typeof showToast === "function") {
        showToast(`✅ Đã thêm 1 ${productName} vào giỏ!`);
      }
    });
  });
}

// ============================================================
//  Hàm boDauTiengViet — Chuẩn hóa chuỗi tiếng Việt
//  Mục đích: cho phép tìm kiếm không cần gõ dấu
//  Ví dụ: "bánh tét" → "banh tet"
// ============================================================
function boDauTiengViet(str) {
  return str
    .normalize("NFD")          // Tách ký tự gốc và dấu (ví dụ: "á" → "a" + combining accent)
    .replace(/[\u0300-\u036f]/g, "")  // Xóa các dấu kết hợp (̀, ́, ̃, ̉, ̣...)
    .replace(/đ/g, "d")        // Riêng chữ đ/Đ không bị xử lý bởi normalize nên thay thủ công
    .replace(/Đ/g, "D")
    .toLowerCase();             // Chuyển thành chữ thường để so sánh không phân biệt hoa/thường
}

// ============================================================
//  Hàm applySearchKeyword — Lọc card theo từ khóa và danh mục
//  Gọi khi: người dùng gõ tìm kiếm HOẶC bấm "Áp dụng" bộ lọc
// ============================================================
function applySearchKeyword(rawKeyword = "") {
  // Nếu chưa có card nào (menu chưa tải xong) thì bỏ qua
  if (!menuCards || !menuCards.length) {
    return;
  }

  // Chuẩn hóa từ khóa: bỏ dấu, cắt khoảng trắng đầu/cuối
  const keyword = boDauTiengViet(rawKeyword.trim());

  menuCards.forEach((card) => {
    // Kiểm tra card có thuộc danh mục đang chọn không
    // "all" nghĩa là không lọc danh mục, hiện tất cả
    const categoryMatch =
      selectedCategory === "all" || card.dataset.category === selectedCategory;

    // Lấy tên món từ phần tử h3.food-name bên trong card rồi bỏ dấu
    const name = boDauTiengViet(
      card.querySelector(".food-name")?.innerText || "",
    );
    // Nếu không có từ khóa thì mọi card đều khớp (keywordMatch = true)
    const keywordMatch = !keyword || name.includes(keyword);

    if (categoryMatch && keywordMatch) {
      // Card thỏa cả 2 điều kiện → hiện ra
      card.classList.remove("hidden");
      card.style.display = "";
    } else {
      // Card không thỏa → ẩn đi
      card.classList.add("hidden");
      card.style.display = "none";
    }
  });
}

// ============================================================
//  Sự kiện modal bộ lọc
// ============================================================

// Mở modal khi click nút "Bộ lọc"
if (filterBtn && modal && overlay) {
  filterBtn.onclick = () => {
    modal.classList.add("active");   // Hiện panel modal (trượt lên từ dưới)
    overlay.classList.add("active"); // Hiện lớp tối phủ sau modal
  };
}

// Đóng modal khi click overlay hoặc nút "Hủy"
if (overlay && modal && closeFilterBtn) {
  const closeModal = () => {
    modal.classList.remove("active");   // Ẩn panel modal
    overlay.classList.remove("active"); // Ẩn overlay
  };

  overlay.onclick = closeModal;
  closeFilterBtn.onclick = closeModal;
}

// Xử lý click vào các nút danh mục bên trong modal
categoryButtons.forEach((button) => {
  button.onclick = () => {
    // Xóa class "active" khỏi tất cả nút (bỏ highlight nút cũ)
    categoryButtons.forEach((item) => item.classList.remove("active"));
    // Thêm class "active" vào nút vừa click (highlight nút mới)
    button.classList.add("active");
    // Cập nhật danh mục đang chọn (sẽ dùng khi bấm "Áp dụng")
    selectedCategory = button.dataset.value || "";
    // Kích hoạt nút "Áp dụng" (vì người dùng đã chọn danh mục)
    if (applyBtn) {
      applyBtn.disabled = false;
    }
  };
});

// Xử lý click nút "Áp dụng" trong modal
if (applyBtn) {
  applyBtn.onclick = () => {
    // Bảo vệ: nếu chưa chọn danh mục hoặc chưa có card thì bỏ qua
    if (!selectedCategory || !menuCards.length) {
      return;
    }

    // Áp dụng lọc với từ khóa hiện tại trong ô tìm kiếm
    applySearchKeyword(searchInput?.value || "");

    // Đóng modal sau khi áp dụng
    modal?.classList.remove("active");
    overlay?.classList.remove("active");
  };
}

// ============================================================
//  Hàm initMenuPage — Khởi tạo trang khi DOM đã sẵn sàng
//  Thứ tự: 1) Tải sản phẩm → 2) Gán sự kiện tìm kiếm → 3) Áp dụng lọc ban đầu
// ============================================================
async function initMenuPage() {
  // 1. Tải và render sản phẩm ra lưới (phải await vì là bất đồng bộ)
  await loadMenu();

  if (searchInput) {
    // 2a. Lắng nghe sự kiện "input": lọc realtime khi người dùng gõ
    searchInput.addEventListener("input", () => {
      applySearchKeyword(searchInput.value);
    });

    // 2b. Nếu URL có tham số ?keyword=... (ví dụ được dẫn sang từ thanh tìm kiếm trang chủ)
    //     thì tự điền từ khóa đó vào ô tìm kiếm
    const initialKeyword = new URLSearchParams(window.location.search).get(
      "keyword",
    );
    if (initialKeyword) {
      searchInput.value = initialKeyword;
    }
  }

  // 3. Áp dụng lọc ban đầu (có thể có keyword từ URL hoặc trống)
  applySearchKeyword(searchInput?.value || "");
}

// Gọi hàm khởi tạo khi file JS được tải xong
initMenuPage();
