
// signup.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("SignupForm");
  const username = document.getElementById("username");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const message = document.getElementById("signupMessage");
  const active=true;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    message.textContent = "";
    message.style.color = "red";

    if (!username.value || !email.value || !password.value || !confirmPassword.value) {
      message.textContent = "Please fill in all fields.";
      return;
    }
    if(username.value==="admin"){
      message.textContent="Username already taken!";
      return;
    }
    if (password.value !== confirmPassword.value) {
      message.textContent = "Passwords do not match!";
      return;
    }

    if (password.value.length < 6) {
      message.textContent = "Password must be at least 6 characters.";
      return;
    }

    // ✅ Lưu user theo username
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existingUser = users.find(u => u.username === username.value);

    if (existingUser) {
      message.textContent = "Username already taken!";
      return;
    }

    users.push({
      username: username.value,
      email: email.value,
      password: password.value,
      active: true
    });

    localStorage.setItem("users", JSON.stringify(users));
    
    message.style.color = "green";
    message.textContent = "Sign up successful! Redirecting to login page...";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  });
});
