// ===== ELEMENT =====

const choiceBox = document.getElementById("choiceBox");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");

const backBtns = document.querySelectorAll(".backBtn");
const passwordIcons = document.querySelectorAll(".togglePassword");

// ===== SHOW FORM =====

if (showLogin) {
  showLogin.onclick = () => {
    choiceBox.classList.add("hidden");
    loginForm.classList.remove("hidden");
  };
}

if (showRegister) {
  showRegister.onclick = () => {
    choiceBox.classList.add("hidden");
    registerForm.classList.remove("hidden");
  };
}

// ===== BACK BUTTON =====

backBtns.forEach((btn) => {
  btn.onclick = () => {
    loginForm.classList.add("hidden");
    registerForm.classList.add("hidden");
    choiceBox.classList.remove("hidden");
  };
});

// ===== TOGGLE PASSWORD =====

passwordIcons.forEach((icon) => {
  icon.onclick = () => {
    const input = icon.previousElementSibling;

    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  };
});

// ===== EMAIL REGEX =====

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== REGISTER =====

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (name === "" || email === "" || password === "") {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ");
      return;
    }

    // ===== LƯU USER =====
    const user = {
      name: name,
      email: email,
      password: password,
    };

    localStorage.setItem("user", JSON.stringify(user));

    alert("Đăng ký thành công");

    // quay lại màn chọn
    registerForm.classList.add("hidden");
    choiceBox.classList.remove("hidden");
  });
}

// ===== LOGIN =====

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email === "" || password === "") {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Email không đúng định dạng");
      return;
    }

    // ===== LẤY USER ĐÃ LƯU =====
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      alert("Chưa có tài khoản, hãy đăng ký");
      return;
    }

    if (
      email === savedUser.email &&
      password === savedUser.password
    ) {
      alert("Đăng nhập thành công");

      // lưu user đang đăng nhập
      localStorage.setItem("currentUser", savedUser.email);

      window.location.href = "index.html";
    } else {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  });
}

// ===== HIỂN THỊ USER TRÊN HEADER =====

const currentUser = localStorage.getItem("currentUser");

if (currentUser) {
  const userBtn = document.querySelector(
    ".icon-btn[aria-label='Tài khoản']"
  );

  if (userBtn) {
    userBtn.innerHTML = currentUser;
  }
}