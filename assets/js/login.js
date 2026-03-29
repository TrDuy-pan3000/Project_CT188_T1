// ===========================
// LOGIN.JS - Xử lý đăng nhập & đăng ký
// ===========================
// File này phụ trách toàn bộ logic của trang login.html:
//   1. Chuyển đổi giữa màn hình chọn / form đăng nhập / form đăng ký
//   2. Toggle show/hide mật khẩu
//   3. Validate và xử lý đăng ký tài khoản (lưu vào localStorage)
//   4. Validate và xử lý đăng nhập (so sánh với localStorage)


// ===== LẤY CÁC ELEMENT CẦN DÙNG =====
// document.getElementById() trả về đúng 1 element theo id
// document.querySelectorAll() trả về NodeList (danh sách) tất cả element khớp selector

const choiceBox    = document.getElementById("choiceBox");     // Khung chứa 2 nút "Đăng nhập" / "Đăng ký"
const loginForm    = document.getElementById("loginForm");     // Form đăng nhập
const registerForm = document.getElementById("registerForm");  // Form đăng ký

const showLogin    = document.getElementById("showLogin");     // Nút "Đăng nhập" ở màn hình chọn
const showRegister = document.getElementById("showRegister");  // Nút "Đăng ký" ở màn hình chọn

const backBtns      = document.querySelectorAll(".backBtn");       // Tất cả nút "Quay lại" (có 2 cái: 1 ở form login, 1 ở form register)
const passwordIcons = document.querySelectorAll(".togglePassword"); // Tất cả icon mắt (có 3 cái: login + 2 ở register)


// ===== HIỂN THỊ FORM TƯƠNG ỨNG =====
// Dùng classList để thêm/bỏ class "hidden" (display: none !important trong CSS)
// Kiểm tra if(showLogin) tránh lỗi nếu element không tồn tại trên trang khác

if (showLogin) {
  showLogin.onclick = () => {
    choiceBox.classList.add("hidden");       // Ẩn màn hình chọn
    loginForm.classList.remove("hidden");    // Hiện form đăng nhập
  };
}

if (showRegister) {
  showRegister.onclick = () => {
    choiceBox.classList.add("hidden");       // Ẩn màn hình chọn
    registerForm.classList.remove("hidden"); // Hiện form đăng ký
  };
}


// ===== NÚT QUAY LẠI =====
// forEach vì backBtns là NodeList (không phải mảng thường, nhưng có .forEach())
// Bấm "Quay lại" ở form nào cũng đều ẩn cả 2 form và hiện lại màn hình chọn

backBtns.forEach((btn) => {
  btn.onclick = () => {
    loginForm.classList.add("hidden");        // Ẩn form đăng nhập
    registerForm.classList.add("hidden");     // Ẩn form đăng ký
    choiceBox.classList.remove("hidden");     // Hiện lại màn hình chọn
  };
});


// ===== TOGGLE HIỆN/ẨN MẬT KHẨU =====
// Mỗi icon mắt nằm ngay sau input password trong HTML (previousElementSibling)
// Khi click: đổi type của input giữa "password" (ẩn) và "text" (hiện)
// Đồng thời đổi icon giữa fa-eye và fa-eye-slash

passwordIcons.forEach((icon) => {
  icon.onclick = () => {
    const input = icon.previousElementSibling; // Lấy input ngay trước icon

    if (input.type === "password") {
      input.type = "text";                               // Hiện mật khẩu
      icon.classList.replace("fa-eye", "fa-eye-slash"); // Đổi icon mắt gạch
    } else {
      input.type = "password";                           // Ẩn mật khẩu lại
      icon.classList.replace("fa-eye-slash", "fa-eye"); // Đổi lại icon mắt thường
    }
  };
});


// ===== REGEX KIỂM TRA ĐỊNH DẠNG =====

// Email hợp lệ: phải có ký tự trước @, sau @ và sau dấu chấm
// Ví dụ hợp lệ: abc@gmail.com | ten@domain.vn
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Số điện thoại Việt Nam: 10 chữ số, đầu bằng 03/05/07/08/09
// Ví dụ hợp lệ: 0909123456 | 0356123456
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;


// ===== XỬ LÝ ĐĂNG KÝ =====
// Lắng nghe sự kiện submit của form đăng ký
// e.preventDefault() để ngăn trình duyệt reload trang khi submit (hành vi mặc định)

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Ngăn reload trang

    // Lấy giá trị các ô input, .trim() để bỏ khoảng trắng đầu/cuối
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("registerEmail").value.trim();
    const phone    = document.getElementById("registerPhone").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirm  = document.getElementById("confirmPassword").value.trim();

    // --- Kiểm tra các trường có bị để trống không ---
    if (!name || !email || !phone || !password || !confirm) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return; // Dùng return để dừng hàm ngay, không chạy tiếp
    }

    // --- Kiểm tra định dạng email ---
    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ");
      return;
    }

    // --- Kiểm tra định dạng số điện thoại Việt Nam ---
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ (vd: 0909 123 456)");
      return;
    }

    // --- Kiểm tra độ dài mật khẩu tối thiểu 6 ký tự ---
    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // --- Kiểm tra 2 ô mật khẩu có khớp nhau không ---
    if (password !== confirm) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    // --- Lấy danh sách user đã đăng ký từ localStorage ---
    // JSON.parse để chuyển chuỗi JSON thành mảng object
    // || [] để tránh lỗi khi chưa có user nào (localStorage trả về null)
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // --- Kiểm tra email đã tồn tại chưa ---
    // .some() trả về true nếu có ít nhất 1 phần tử thỏa điều kiện
    const isExist = users.some((u) => u.email === email);
    if (isExist) {
      alert("Email này đã được đăng ký");
      return;
    }

    // --- Tạo object user mới và lưu vào localStorage ---
    // QUAN TRỌNG: Đây là dự án học, thực tế không nên lưu mật khẩu thô như này!
    const user = { name, email, phone, password };

    users.push(user); // Thêm user mới vào cuối mảng
    localStorage.setItem("users", JSON.stringify(users)); // Lưu lại (phải JSON.stringify mới lưu được)

    alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");

    // --- Quay về màn hình chọn sau khi đăng ký xong ---
    registerForm.classList.add("hidden");
    choiceBox.classList.remove("hidden");

    // Reset toàn bộ các ô input trong form về rỗng
    registerForm.reset();
  });
}


// ===== XỬ LÝ ĐĂNG NHẬP =====
// Tương tự đăng ký: ngăn reload, lấy giá trị, validate, rồi tìm user

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Ngăn reload trang

    // Lấy email và mật khẩu từ form
    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // --- Kiểm tra không để trống ---
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    // --- Kiểm tra định dạng email ---
    if (!emailRegex.test(email)) {
      alert("Email không đúng định dạng");
      return;
    }

    // --- Kiểm tra mật khẩu tối thiểu 6 ký tự (để tránh tấn công bằng chuỗi rỗng) ---
    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // --- Tìm user trong localStorage theo cả email VÀ password ---
    // .find() trả về phần tử đầu tiên thỏa điều kiện, hoặc undefined nếu không tìm thấy
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    // Nếu không tìm thấy user → sai tài khoản hoặc mật khẩu
    if (!user) {
      alert("Sai tài khoản hoặc mật khẩu");
      return;
    }

    alert("Đăng nhập thành công");

    // --- Lưu thông tin user đang đăng nhập vào localStorage ---
    // Các trang khác (index, cart...) sẽ đọc "currentUser" để biết ai đang dùng
    localStorage.setItem("currentUser", JSON.stringify(user));

    // --- Chuyển hướng về trang chủ sau khi đăng nhập ---
    window.location.href = "index.html";
  });
}


// ===== HIỂN THỊ THÔNG BÁO NẾU BỊ CHUYỂN TỚI DO CẦN ĐĂNG NHẬP =====
// Khi người dùng vào giỏ hàng mà chưa đăng nhập, cart.js set "needLoginMessage" trong localStorage
// Trang login đọc flag đó và hiển thị toast thông báo cho người dùng biết lý do bị chuyển trang

document.addEventListener("DOMContentLoaded", () => {
  const needLoginMessage = localStorage.getItem("needLoginMessage");
  if (needLoginMessage) {
    // showToast là hàm global từ main.js (tải trước login.js)
    if (typeof showToast === "function") {
      showToast("🔒 Bạn cần đăng nhập để tiếp tục mua sắm!");
    }
    // Xóa flag trong localStorage để không hiện lại lần sau
    localStorage.removeItem("needLoginMessage");
  }
});
