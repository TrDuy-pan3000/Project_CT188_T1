const choiceBox = document.getElementById("choiceBox");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");

// hiển thị login

showLogin.onclick = () => {

choiceBox.classList.add("hidden");
loginForm.classList.remove("hidden");

};

// hiển thị register

showRegister.onclick = () => {

choiceBox.classList.add("hidden");
registerForm.classList.remove("hidden");

};

// quay lại

const backBtns = document.querySelectorAll(".backBtn");

backBtns.forEach(btn => {

btn.onclick = () => {

loginForm.classList.add("hidden");
registerForm.classList.add("hidden");

choiceBox.classList.remove("hidden");

};

});

// icon hiện mật khẩu

const toggles = document.querySelectorAll(".togglePassword");

toggles.forEach(icon => {

icon.onclick = () => {

const input = icon.previousElementSibling;

if(input.type === "password"){

input.type = "text";
icon.classList.replace("fa-eye","fa-eye-slash");

}else{

input.type = "password";
icon.classList.replace("fa-eye-slash","fa-eye");

}

};

});

// đăng ký

registerForm.addEventListener("submit",function(e){

e.preventDefault();

const name = document.getElementById("name").value;
const email = document.getElementById("registerEmail").value;
const password = document.getElementById("registerPassword").value;

let users = JSON.parse(localStorage.getItem("users")) || [];

const exist = users.find(u => u.email === email);

if(exist){

alert("Email đã tồn tại");
return;

}

users.push({name,email,password});

localStorage.setItem("users",JSON.stringify(users));

alert("Đăng ký thành công");

registerForm.reset();

});

// đăng nhập

loginForm.addEventListener("submit",function(e){

e.preventDefault();

const email = document.getElementById("loginEmail").value;
const password = document.getElementById("loginPassword").value;

let users = JSON.parse(localStorage.getItem("users")) || [];

const user = users.find(
u => u.email === email && u.password === password
);

if(!user){

alert("Sai email hoặc mật khẩu");
return;

}

localStorage.setItem("currentUser",JSON.stringify(user));

alert("Đăng nhập thành công");

window.location.href="index.html";

});