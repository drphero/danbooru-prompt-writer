function initDarkMode(darkModeToggle) {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    darkModeToggle.src = "assets/sun.png";
  } else {
    document.body.classList.remove("dark");
    darkModeToggle.src = "assets/moon.png";
  }

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      darkModeToggle.src = "assets/sun.png";
      localStorage.setItem("darkMode", "true");
    } else {
      darkModeToggle.src = "assets/moon.png";
      localStorage.setItem("darkMode", "false");
    }
  });
}

module.exports = { initDarkMode };
