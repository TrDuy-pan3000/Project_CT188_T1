fetch("header.html")
  .then((res) => res.text())
  .then((data) => {
    document.querySelector(".header").innerHTML = data;
    const pathName = window.location.pathname;
    const index = document.querySelector(".header__main");
    const menu = document.querySelector(".header__menu");
    const story = document.querySelector(".header__story");

    switch (pathName) {
      case "/index.html":
        index.classList.add("active");
        break;
      case "/menu.html":
        menu.classList.add("active");
        break;
      case "/story.html":
        story.classList.add("active");
        break;
    }
  });
fetch("footer.html")
  .then((res) => res.text())
  .then((data) => {
    document.querySelector(".footer").innerHTML = data;
  });
