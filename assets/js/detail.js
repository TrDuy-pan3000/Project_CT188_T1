const featuredImg = document.getElementById("main-img");
const smallImgs = document.querySelectorAll(".small-img");

smallImgs.forEach((img, index) => {
  img.addEventListener("click", () => {
    featuredImg.src = img.src;
    smallImgs.forEach(i => i.classList.remove("sm-card"));
    img.classList.add("sm-card");
  });
});
