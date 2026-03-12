// ================= LOGIN FORM =================

const form = document.getElementById("loginForm");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const error = document.getElementById("error");

    error.textContent = "";

    // kiểm tra rỗng
    if (email === "" || password === "") {
        error.textContent = "Vui lòng nhập đầy đủ email và mật khẩu!";
        return;
    }

    // kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        error.textContent = "Email không đúng định dạng!";
        return;
    }

    // giả lập đăng nhập thành công
    localStorage.setItem("userEmail", email);

    // thông báo
    alert("Đăng nhập thành công!");

    // chuyển về trang chủ
    window.location.href = "index.html";

});