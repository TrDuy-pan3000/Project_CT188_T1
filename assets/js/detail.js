const singleProduct = document.querySelector(".single-product");
const moreInfo = document.querySelector(".more-info");
const productReviews = document.querySelector(".reviews");
const relatedProducts = document.querySelector(".products");

const getData = async () => {
  const path = new URLSearchParams(window.location.search);

  const productId = path.get("id");

  if (!productId) {
    // trả về trang chủ khi thêm đủ nội dung các sản phẩm
    window.location.href = "detail.html?id=1";
    return;
  }

  const respone = await fetch("./assets/js/product.json");
  const data = await respone.json();
  const findProductId = data.find(
    (item) => item.id.toString() === productId.toString(),
  );

  singleProduct.innerHTML = `
  <div class="container">
          <div class="big-img-left">
            <img
              src="${findProductId.mainImg}"
              alt="Anh-1"
              id="main-img"
            />
            <div class="gallery-container">
              <img
                src="${findProductId.subImg1}"
                alt=""
                class="small-img"
              />
              <img
                src="${findProductId.subImg2}"
                alt=""
                class="small-img"
              />
              <img
                src="${findProductId.subImg3}"
                alt=""
                class="small-img"
              />
              <img
                src="${findProductId.subImg4}"
                alt=""
                class="small-img"
              />
            </div>
          </div>
          <div class="content-right">
            <h2 class="product-name">${findProductId.name}</h2>
            <span class="product-rating">${findProductId.rating}</span>
            <p class="product-description">
              ${findProductId.description}
              <a href="./story.html">Xem thêm các câu chuyện ngày tết →</a>
            </p>
            <strong class="product-price">${findProductId.price}₫ <span> / Đòn</span></strong>
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
  const smallImgs = document.querySelectorAll(".small-img");
  smallImgs.forEach((img, index) => {
    img.addEventListener("click", () => {
      featuredImg.src = img.src;
      smallImgs.forEach((i) => i.classList.remove("sm-card"));
      img.classList.add("sm-card");
    });
  });

  moreInfo.innerHTML = `
    <div class="title">
            <h1>Chi Tiết Sản Phẩm</h1>
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
  productReviews.innerHTML = ``;
  reviewList.forEach((test) => {
    productReviews.innerHTML += `
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
  `;
  });

  const otherProducts = data.filter(
    (item) => item.id.toString() !== productId.toString(),
  );

  const shuffledProducts = otherProducts.sort(() => 0.5 - Math.random());

  const randomFourProducts = shuffledProducts.slice(0, 4);

  relatedProducts.innerHTML = ``;

  randomFourProducts.forEach((prod) => {
    relatedProducts.innerHTML += `
      <article class="related-product">
        <img src="${prod.mainImg}" alt="${prod.name}">
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
    `;
  });
};
getData();
