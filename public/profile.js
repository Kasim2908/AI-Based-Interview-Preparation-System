const profileForm = document.getElementById("profileForm");
const profileMsg = document.getElementById("profileMsg");

window.addEventListener("load", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "signup.html";
    return;
  }

  const savedProfile = localStorage.getItem("studentProfile");
  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    document.getElementById("fullName").value = profile.fullName || "";
    document.getElementById("college").value = profile.college || "";
    document.getElementById("branch").value = profile.branch || "";
    document.getElementById("year").value = profile.year || "";
    document.getElementById("role").value = profile.role || "";
    document.getElementById("interest").value = profile.interest || "";
    document.getElementById("skills").value = profile.skills || "";
    document.getElementById("github").value = profile.github || "";
    document.getElementById("linkedin").value = profile.linkedin || "";
  }
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    fullName: document.getElementById("fullName").value.trim(),
    college: document.getElementById("college").value.trim(),
    branch: document.getElementById("branch").value.trim(),
    year: document.getElementById("year").value.trim(),
    role: document.getElementById("role").value.trim(),
    interest: document.getElementById("interest").value.trim(),
    skills: document.getElementById("skills").value.trim(),
    github: document.getElementById("github").value.trim(),
    linkedin: document.getElementById("linkedin").value.trim()
  };

  localStorage.setItem("studentProfile", JSON.stringify(profile));
  profileMsg.textContent = "Profile saved successfully. Redirecting...";
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 900);
});