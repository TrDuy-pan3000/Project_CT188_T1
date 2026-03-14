const featuredImg = document.getElementById("main-img");
const smallImgs = document.querySelectorAll(".small-img");

smallImgs.forEach((img, index) => {
  img.addEventListener("click", () => {
    featuredImg.src = img.src;
    smallImgs.forEach((i) => i.classList.remove("sm-card"));
    img.classList.add("sm-card");
  });
});

// const buttons = document.querySelectorAll(".tab-btn");
// const contents = document.querySelectorAll(".tab-content");

// buttons.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     const target = btn.dataset.tab;
//     buttons.forEach((b) => b.classList.remove("active"));
//     contents.forEach((p) => p.classList.remove("active"));
//     btn.classList.add("active");

//     document.getElementById(target).classList.add("active");
//   });
// });

const singleProduct = document.querySelector(".single-product");
const moreInfo = document.querySelector(".more-info");
const getData = async () => {
  const path = new URLSearchParams(window.location.search);

  const productId = path.get("id");

  const respone = await fetch("/assets/js/product.json");

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

  moreInfo.innerHTML = `
  <div class="container" id="more-details">
          <div class="title">
            <h1>Chi Tiết Sản Phẩm</h1>
          </div>
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
};
getData();
