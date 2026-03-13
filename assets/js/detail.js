// const featuredImg = document.getElementById("main-img");
// const smallImgs = document.querySelectorAll(".small-img");

// smallImgs.forEach((img, index) => {
//   img.addEventListener("click", () => {
//     featuredImg.src = img.src;
//     smallImgs.forEach(i => i.classList.remove("sm-card"));
//     img.classList.add("sm-card");
//   });
// });

const buttons = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    buttons.forEach((b) => b.classList.remove("active"));
    contents.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");

    document.getElementById(target).classList.add("active");
  });
});
