// ===== ELEMENT =====

const choiceBox = document.getElementById("choiceBox")

const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")

const showLogin = document.getElementById("showLogin")
const showRegister = document.getElementById("showRegister")

const backBtns = document.querySelectorAll(".backBtn")

const passwordIcons = document.querySelectorAll(".togglePassword")

// ===== SHOW FORM =====

showLogin.onclick = () => {

choiceBox.classList.add("hidden")
loginForm.classList.remove("hidden")

}

showRegister.onclick = () => {

choiceBox.classList.add("hidden")
registerForm.classList.remove("hidden")

}

// ===== BACK BUTTON =====

backBtns.forEach(btn => {

btn.onclick = () => {

loginForm.classList.add("hidden")
registerForm.classList.add("hidden")
choiceBox.classList.remove("hidden")

}

})

// ===== TOGGLE PASSWORD =====

passwordIcons.forEach(icon => {

icon.onclick = () => {

const input = icon.previousElementSibling

if(input.type === "password"){

input.type = "text"
icon.classList.replace("fa-eye","fa-eye-slash")

}else{

input.type = "password"
icon.classList.replace("fa-eye-slash","fa-eye")

}

}

})

// ===== LOGIN VALIDATE =====

loginForm.addEventListener("submit",function(e){

e.preventDefault()

const email = document.getElementById("loginEmail").value.trim()
const password = document.getElementById("loginPassword").value.trim()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if(email === "" || password === ""){

alert("Vui lòng nhập đầy đủ thông tin")
return

}

if(!emailRegex.test(email)){

alert("Email không đúng định dạng")
return

}

/* ===== LOGIN GIẢ LẬP ===== */

const correctEmail = "admin@gmail.com"
const correctPassword = "123456"

if(email === correctEmail && password === correctPassword){

localStorage.setItem("user",email)

alert("Đăng nhập thành công")

window.location.href = "index.html"

}else{

alert("Sai tài khoản hoặc mật khẩu")

}

})

// ===== REGISTER VALIDATE =====

registerForm.addEventListener("submit",function(e){

e.preventDefault()

const name = document.getElementById("name").value.trim()
const email = document.getElementById("registerEmail").value.trim()
const password = document.getElementById("registerPassword").value.trim()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if(name === "" || email === "" || password === ""){

alert("Vui lòng nhập đầy đủ thông tin")
return

}

if(!emailRegex.test(email)){

alert("Email không hợp lệ")
return

}

alert("Đăng ký thành công (giả lập)")

choiceBox.classList.remove("hidden")
registerForm.classList.add("hidden")

})