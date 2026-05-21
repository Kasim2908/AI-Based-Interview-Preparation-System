const authForm = document.getElementById("authForm");
const errorText = document.getElementById("errorText");
const toggleForm = document.getElementById("toggleForm");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");
const nameField = document.getElementById("nameField");
const submitBtn = document.getElementById("submitBtn");
const toggleText = document.getElementById("toggleText");

let isLogin = true;

const DEMO_EMAIL = "student@gmail.com";
const DEMO_PASSWORD = "student@123";

function toggleFormMode() {
  isLogin = !isLogin;
  errorText.textContent = "";
  authForm.reset();

  if (isLogin) {
    formTitle.textContent = "Login to Your Account";
    formSubtitle.textContent = "Welcome back! Please enter your details.";
    nameField.classList.add("hidden");
    submitBtn.textContent = "Login";
    toggleText.textContent = "Don't have an account?";
    toggleForm.textContent = "Signup";
  } else {
    formTitle.textContent = "Create Account";
    formSubtitle.textContent = "Join to start your interview preparation journey.";
    nameField.classList.remove("hidden");
    submitBtn.textContent = "Create Account";
    toggleText.textContent = "Already have an account?";
    toggleForm.textContent = "Login";
  }
}

toggleForm.addEventListener("click", toggleFormMode);

window.addEventListener("load", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn === "true") {
    const hasProfile = localStorage.getItem("studentProfile");
    window.location.href = hasProfile ? "dashboard.html" : "profile.html";
  }
  // Set initial form to login
  toggleFormMode(); // Toggles to signup
  toggleFormMode(); // Toggles back to login
});

authForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (isLogin) {
    // Login logic
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.email === email && u.password === password);

    if (user || (email === DEMO_EMAIL && password === DEMO_PASSWORD)) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("studentEmail", email);
      errorText.textContent = "";
      window.location.href = "profile.html";
    } else {
      errorText.textContent = "Invalid email or password.";
    }
  } else {
    // Signup logic
    const name = document.getElementById("name").value.trim();
    if (!name) {
      errorText.textContent = "Please enter your full name.";
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some(u => u.email === email)) {
      errorText.textContent = "An account with this email already exists.";
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("studentEmail", email);
    
    const profile = { fullName: name };
    localStorage.setItem("studentProfile", JSON.stringify(profile));

    errorText.textContent = "";
    window.location.href = "profile.html";
  }
});