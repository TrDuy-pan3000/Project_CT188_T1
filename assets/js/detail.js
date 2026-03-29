// ============================================================
//  detail.js — Xử lý trang Chi Tiết Sản Phẩm (detail.html)
//
//  Luồng hoạt động:
//   1. Đọc ?id= từ URL
//   2. Fetch product.json → tìm sản phẩm có id khớp
//   3. Nếu không tìm thấy → renderNotFoundProduct()
//   4. Nếu tìm thấy → render ảnh, thông tin, chi tiết, review, sản phẩm liên quan
//   5. Gán sự kiện: click ảnh nhỏ đổi ảnh lớn, nút "BỎ VÀO MÂM" thêm giỏ hàng
// ============================================================

// --- Lấy các phần tử DOM chứa các section cần render ---
const singleProduct = document.querySelector(".single-product");  // Phần ảnh + info sản phẩm
const moreInfo = document.querySelector(".more-info");            // Phần chi tiết sản phẩm
const productReviews = document.querySelector(".reviews");        // Phần đánh giá khách hàng
const relatedProducts = document.querySelector(".products");      // Lưới sản phẩm liên quan

// ============================================================
//  Hàm renderNotFoundProduct — Hiển thị trang lỗi "Không tìm thấy sản phẩm"
//  Gọi khi: URL không có ?id=, hoặc id không khớp với bất kỳ sản phẩm nào trong JSON
// ============================================================
function renderNotFoundProduct() {
  const mainContent = document.querySelector("main");
  if (!mainContent) return; // Thoát nếu không tìm thấy <main> trong DOM

  // Thay toàn bộ nội dung <main> bằng trang thông báo lỗi thân thiện
  mainContent.innerHTML = `
      <div class="cantFindProd">
        <h1>Không Tìm Thấy Sản Phẩm</h1>
        <div class="container">
          <!-- Ảnh linh vật duyên dáng thay cho thông báo lỗi khô khan -->
          <img src="assets/images/mascots/mascot_product_error.png" />
          <p
            >Xin lỗi bạn nhé, sản phẩm bạn đang tìm tạm thời chưa ra lò kịp hoặc
            đã được khách khác 'rinh' mất rồi.<br />
            Nhưng đừng để chiếc bụng đói phải chờ lâu, bếp nhà chúng mình vẫn
            còn nguyên một thực đơn hấp dẫn với đủ loại nhân mặn, ngọt đang tỏa
            hương thơm lừng. Cùng nghía qua xem có món nào vừa ý bạn hôm nay
            không nhé</
          >
        </div>
        <!-- 2 nút điều hướng: sang trang menu hoặc về trang chủ -->
        <div class="button_wrap">
          <a href="menu.html">
            <button>Xem Các Sản Phẩm Khác</button>
          </a>
          <a href="index.html">
            <button>Trở Về Trang Chủ</button>
          </a>
        </div>
      </div>
  `;
}

// ============================================================
//  Hàm parsePrice — Chuyển chuỗi giá thành số nguyên
//  Ví dụ: "180.000" → 180000, "350,000₫" → 350000
// ============================================================
function parsePrice(rawPrice) {
  // replace loại bỏ tất cả ký tự không phải chữ số
  // Number() chuyển chuỗi số thành số thực
  // || 0 để trả về 0 nếu chuyển đổi thất bại
  return Number(String(rawPrice).replace(/[^\d]/g, "")) || 0;
}

// ============================================================
//  Hàm getData — Hàm chính: tải và render toàn bộ nội dung trang
// ============================================================
const getData = async () => {
  // Bước 1: Đọc tham số ?id= từ URL (ví dụ: detail.html?id=3 → productId = "3")
  const path = new URLSearchParams(window.location.search);
  const productId = path.get("id");

  // Nếu không có id trong URL → hiển thị trang lỗi và thoát
  if (!productId) {
    renderNotFoundProduct();
    return;
  }

  // Bước 2: Tải toàn bộ danh sách sản phẩm từ file JSON
  const response = await fetch("assets/js/product.json");
  const data = await response.json();

  // Bước 3: Tìm sản phẩm có id khớp với ?id= trong URL
  // Dùng toString() để so sánh an toàn (tránh lỗi kiểu số vs chuỗi)
  const findProductId = data.find(
    (item) => item.id.toString() === productId.toString(),
  );

  // Nếu không tìm thấy sản phẩm → hiển thị trang lỗi và thoát
  if (!findProductId) {
    renderNotFoundProduct();
    return;
  }

  // ─── Bước 4: Chuẩn bị danh sách ảnh gallery ───────────────
  // Gom tất cả ảnh của sản phẩm (1 ảnh chính + tối đa 4 ảnh phụ) vào một mảng
  const productImages = [
    findProductId.mainImg,
    findProductId.subImg1,
    findProductId.subImg2,
    findProductId.subImg3,
    findProductId.subImg4,
  ].filter(Boolean); // Loại bỏ các phần tử undefined/null (sản phẩm có ít hơn 4 ảnh phụ)

  // Loại bỏ ảnh trùng lặp (nếu ảnh chính trùng với ảnh phụ)
  const uniqueImages = [...new Set(productImages)];

  // Ảnh đầu tiên trong danh sách là ảnh chính hiển thị lớn
  const mainImage = uniqueImages[0] || "assets/images/ui/logo.png"; // fallback: logo nếu không có ảnh

  // Tạo HTML cho các ảnh nhỏ trong gallery
  // index === 0 thêm class "sm-card" để bordered highlight ảnh đang được chọn
  const galleryHtml = uniqueImages
    .map(
      (image, index) => `
              <img
                src="${image}"
                alt="${findProductId.name} ${index + 1}"
                class="small-img ${index === 0 ? "sm-card" : ""}"
              />`,
    )
    .join("");

  // ─── Bước 5: Render section ảnh + thông tin sản phẩm ──────
  // Ghi đè toàn bộ nội dung của .single-product bằng dữ liệu thực
  singleProduct.innerHTML = `
  <div class="container">
          <div class="big-img-left">
            <!-- Ảnh lớn chính, src sẽ thay đổi khi click ảnh nhỏ bên dưới -->
            <img
              src="${mainImage}"
              alt=""
              id="main-img"
            />
            <!-- Lưới ảnh nhỏ gallery -->
            <div class="gallery-container">
              ${galleryHtml}
            </div>
          </div>
          <div class="content-right">
            <h2 class="product-name">${findProductId.name}</h2>
            <span class="product-rating">${findProductId.rating}</span>
            <p class="product-description">
              ${findProductId.description}
              <a href="./story.html">Xem thêm các câu chuyện ngày tết →</a>
            </p>
            <!-- Giá và đơn vị tính (VD: "180.000₫ / Đòn") -->
            <strong class="product-price">${findProductId.price}₫ <span> / ${findProductId.unit}</span></strong>
            <div class="buying-wrap">
              <input id="quantity" type="number" value="1" min="1" />
              <!-- Nút thêm vào giỏ, JS sẽ gán event listener sau khi render xong -->
              <button class="add-to-cart-button" id="add-cart">
                BỎ VÀO MÂM
              </button>
            </div>
          </div>
        </div>
  `;

  // ─── Bước 6: Gán sự kiện click ảnh nhỏ ───────────────────
  const featuredImg = document.getElementById("main-img");  // Ảnh lớn đang hiển thị
  const galleryContainer = document.querySelector(".gallery-container");
  const smallImgs = document.querySelectorAll(".small-img"); // Tất cả ảnh nhỏ trong gallery

  if (galleryContainer) {
    // Tự động chia lưới gallery theo số lượng ảnh (tối đa 4 cột)
    const colCount = Math.max(1, Math.min(smallImgs.length, 4));
    galleryContainer.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
  }

  // Khi click ảnh nhỏ: cập nhật ảnh lớn và highlight ảnh đang chọn
  smallImgs.forEach((img) => {
    img.addEventListener("click", () => {
      featuredImg.src = img.src; // Thay src ảnh lớn thành src ảnh nhỏ được click
      // Xóa highlight khỏi tất cả ảnh nhỏ rồi thêm lại cho cái đang click
      smallImgs.forEach((i) => i.classList.remove("sm-card"));
      img.classList.add("sm-card"); // "sm-card" là class CSS tạo viền highlight
    });
  });

  // ─── Bước 7: Render section Chi Tiết Sản Phẩm ────────────
  // Điền các trường từ JSON vào form chi tiết (trọng lượng, thành phần...)
  moreInfo.innerHTML = `
    <div class="title">
            <h1>Chi Tiết Sản Phẩm</h1>
            <img
            src="assets/images/mascots/top-bar-mascot-detail.png"
            class="top-mascot"
          />
    </div>
    <div class="container" id="more-details">
         
          <h4 id="weight">Trọng lượng:</h4>
          <p>${findProductId.weight}</p>
          <h4 id="ingredient-list">Thành phần chính:</h4>
          <p>
            ${findProductId.ingredientList}
          </p>
          <h4 id="Packing">Quy cách đóng gói:</h4>
          <p>
            ${findProductId.packing}
          </p>
          <h4 id="exp">Hạn sử dụng:</h4>
          <p>
            ${findProductId.exp}
          </p>
          <h4 id="uses">Cách dùng:</h4>
          <p>
            ${findProductId.uses}
          </p>
          <h4 id="Preserve">Bảo quản:</h4>
          <p>
            ${findProductId.preserve}
          </p>
    </div>
        `;

  // ─── Bước 8: Render section Đánh giá khách hàng ──────────
  // findProductId.reviews là mảng các object { avatar, name, address, stars, text }
  // --- Render danh sách đánh giá ---
  // || [] phòng trường hợp sản phẩm chưa có review (tránh lỗi .map() trên undefined)
  const reviewList = findProductId.reviews || []; // Mặc định là mảng rỗng nếu không có review
  productReviews.innerHTML = reviewList
    .map(
      (test) => `
  <div class="review-card">
            <div class="test-author">
              <!-- Avatar emoji của người review -->
              <span class="test-avatar">${test.avatar}</span>
              <div class="test-info">
                <h4>${test.name}</h4>
                <p>${test.address}</p>
                <!-- Số sao đánh giá hiển thị bằng emoji ⭐ -->
                <div class="test-stars">${test.stars}</div>
              </div>
            </div>
            <p class="test-text">
              ${test.text}
            </p>
          </div>
  `,
    )
    .join("");

  // ─── Bước 9: Render section Sản phẩm liên quan ───────────
  // Lọc ra tất cả sản phẩm KHÁC với sản phẩm đang xem
  const otherProducts = data.filter(
    (item) => item.id.toString() !== productId.toString(),
  );

  // Trộn ngẫu nhiên (Math.random() - 0.5 tạo giá trị âm/dương ngẫu nhiên để sort hoạt động như shuffle)
  // rồi lấy 4 sản phẩm đầu tiên để hiển thị
  const randomFourProducts = otherProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  // Tạo HTML cho từng card sản phẩm liên quan
  // description.substring(0, 60) lấy 60 ký tự đầu + "..." để mô tả không quá dài
  relatedProducts.innerHTML = randomFourProducts
    .map(
      (prod) => `
      <article class="related-product">
        <a href="detail.html?id=${prod.id}"><img src="${prod.mainImg}" alt="${prod.name}"></a>
        <div class="content-wrap">
          <h3>${prod.name}</h3>
          
          <p>${prod.description.substring(0, 60)}...</p>
          
          <div class="card-bottom">
            <p class="price">${prod.price}₫</p>
            
            <!-- Nút "Thêm" dẫn sang detail.html thay vì thêm thẳng vào giỏ
                 (để người dùng chọn số lượng trước) -->
            <a href="detail.html?id=${prod.id}" class="btn-add">
              <i class="fas fa-shopping-cart"></i> Thêm
            </a>
          </div>
        </div>
      </article>
    `,
    )
    .join("");

  // ─── Bước 10: Gán sự kiện nút "BỎ VÀO MÂM" ────────────────
  // Phải gán sau khi render vì lúc này nút #add-cart mới có trong DOM
  const addCartBtn = document.getElementById("add-cart");

  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
      // Kiểm tra đăng nhập: trả về false nếu chưa đăng nhập → hiện modal login
      if (!window.ensureLogin || !window.ensureLogin()) return;

      const name = findProductId.name || "Món ăn";

      // Lấy số lượng từ ô input #quantity, đảm bảo tối thiểu là 1
      const quantityInput = document.getElementById("quantity");
      const quantity = Math.max(1, Number(quantityInput?.value) || 1);

      // Chuyển giá thành số (loại bỏ định dạng tiền tệ)
      const price = parsePrice(findProductId.price);

      // Lấy src của ảnh hiện đang hiển thị trong ô ảnh lớn (người dùng có thể đã đổi ảnh)
      const image =
        featuredImg?.getAttribute("src") || "assets/images/ui/logo.png";

      // Gọi hàm addToCart() từ script.js để thêm vào giỏ hàng trong localStorage
      if (typeof addToCart === "function") {
        addToCart({
          id: findProductId.id,
          name,
          price,
          image,
          quantity, // Số lượng người dùng đã chọn
        });
      }

      // Hiện toast thông báo xác nhận (ví dụ: "✅ Đã thêm 2 Bánh Tét vào giỏ!")
      if (typeof showToast === "function") {
        showToast(`✅ Đã thêm ${quantity} ${name} vào giỏ!`);
      }
    });
  }
};

// Gọi hàm getData() ngay khi file JS được tải xong
getData();
