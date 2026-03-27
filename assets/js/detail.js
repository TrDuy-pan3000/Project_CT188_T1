const singleProduct = document.querySelector(".single-product");
const moreInfo = document.querySelector(".more-info");
const productReviews = document.querySelector(".reviews");
const relatedProducts = document.querySelector(".products");

// hàm render trang khi không tìm thấy thông tin id sản phẩm hoặc id không hợp lệ
function renderNotFoundProduct() {
  const mainContent = document.querySelector("main");
  if (!mainContent) return;

  mainContent.innerHTML = `
      <div class="cantFindProd">
        <h1>Không Tìm Thấy Sản Phẩm</h1>
        <div class="container">
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

function parsePrice(rawPrice) {
  return Number(String(rawPrice).replace(/[^\d]/g, "")) || 0;
}
// hàm lấy thông tin từ file product.json và render nội dung trang
const getData = async () => {
  const path = new URLSearchParams(window.location.search);
  const productId = path.get("id");
  if (!productId) {
    renderNotFoundProduct();
    return;
  }

  const response = await fetch("assets/js/product.json");
  const data = await response.json();
  const findProductId = data.find(
    (item) => item.id.toString() === productId.toString(),
  );

  if (!findProductId) {
    renderNotFoundProduct();
    return;
  }

  const productImages = [
    findProductId.mainImg,
    findProductId.subImg1,
    findProductId.subImg2,
    findProductId.subImg3,
    findProductId.subImg4,
  ].filter(Boolean);

  const uniqueImages = [...new Set(productImages)];
  const mainImage = uniqueImages[0] || "assets/images/ui/logo.png";
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

  singleProduct.innerHTML = `
  <div class="container">
          <div class="big-img-left">
            <img
              src="${mainImage}"
              alt=""
              id="main-img"
            />
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
            <strong class="product-price">${findProductId.price}₫ <span> / ${findProductId.unit}</span></strong>
            <div class="buying-wrap">
              <input id="quantity" type="number" value="1" min="1" />
              <button class="add-to-cart-button" id="add-cart">
                BỎ VÀO MÂM
              </button>
            </div>
          </div>
        </div>
  `;

  const featuredImg = document.getElementById("main-img");
  const galleryContainer = document.querySelector(".gallery-container");
  const smallImgs = document.querySelectorAll(".small-img");

  if (galleryContainer) {
    const colCount = Math.max(1, Math.min(smallImgs.length, 4));
    galleryContainer.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
  }
  // thay đổi ảnh chính khi click
  smallImgs.forEach((img) => {
    img.addEventListener("click", () => {
      featuredImg.src = img.src;
      smallImgs.forEach((i) => i.classList.remove("sm-card"));
      img.classList.add("sm-card");
    });
  });

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

  const reviewList = findProductId.reviews || [];
  productReviews.innerHTML = reviewList
    .map(
      (test) => `
  <div class="review-card">
            <div class="test-author">
              <span class="test-avatar">${test.avatar}</span>
              <div class="test-info">
                <h4>${test.name}</h4>
                <p>${test.address}</p>

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

  const otherProducts = data.filter(
    (item) => item.id.toString() !== productId.toString(),
  );
  // hiển thị ngẫu nhiên 4 sản phẩm bằng cách trộn và slice otherProducts
  const randomFourProducts = otherProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

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
            
            <a href="detail.html?id=${prod.id}" class="btn-add">
              <i class="fas fa-shopping-cart"></i> Thêm
            </a>
          </div>
        </div>
      </article>
    `,
    )
    .join("");

  const addCartBtn = document.getElementById("add-cart");
  
  if (addCartBtn) {
    addCartBtn.addEventListener("click", () => {
      if (!window.ensureLogin || !window.ensureLogin()) return;

      const name = findProductId.name || "Món ăn";
      const quantityInput = document.getElementById("quantity");
      const quantity = Math.max(1, Number(quantityInput?.value) || 1);
      const price = parsePrice(findProductId.price);
      const image =
        featuredImg?.getAttribute("src") || "assets/images/ui/logo.png";

      if (typeof addToCart === "function") {
        addToCart({
          id: findProductId.id,
          name,
          price,
          image,
          quantity,
        });
      }

      if (typeof showToast === "function") {
        showToast(`✅ Đã thêm ${quantity} ${name} vào giỏ!`);
      }
    });
  }
};

getData();
