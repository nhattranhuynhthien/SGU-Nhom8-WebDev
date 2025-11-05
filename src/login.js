
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  message.textContent = "";
  message.style.color = "red";


  const users = JSON.parse(localStorage.getItem("users")) || [];
  const foundUser = users.find(u => u.username === username && u.password === password && u.active);

  if (foundUser) {
    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";

    // Lưu thông tin người dùng đang đăng nhập
    localStorage.setItem("currentUser", JSON.stringify(foundUser));

    // ⏳ Chuyển hướng sang trang chủ sau 1.5 giây
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  } else {
    message.textContent = "Invalid username or password.";
  }
});
