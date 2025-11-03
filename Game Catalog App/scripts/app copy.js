// Grab elements
const searchInput = document.getElementById("q");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");
const statusDiv = document.getElementById("status");
const emptyDiv = document.getElementById("empty");
const API_BASE = "http://localhost:3000";

// landing page elements
let landingPage = document.getElementById("landing-page");
let landingPageLinks = document.querySelectorAll(".landing-page-link");
let currentModal = landingPage;
let helloMessages = document.querySelectorAll(".hello-message");
let profilePictures = document.querySelectorAll(".profile-picture");
let navbarTogglers = document.querySelectorAll(".navbar-toggler");

// log in page elements
let logInModal = document.getElementById("log-in-modal");
let logInModalGreeting = document.getElementById("log-in-modal-greeting");
let signUpTab = document.getElementById("sign-up-tab");
let logInTab = document.getElementById("log-in-tab");
let mode;

let signUpFields = document.querySelectorAll(".sign-up-field");
let logInButton = document.getElementById("log-in-button");
const errorMessage = document.getElementById("error-message");
const logOutLink = document.getElementById("log-out-link");


const nicknameField = document.getElementById("nick-name");
const emailField = document.getElementById("email");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");


// Profile/Dashboard elements
const dashboardModal = document.getElementById("dashboard-modal");
let dashboardMessage = document.getElementById("dashboard-message");
const profileModal = document.getElementById("profile-modal");
let profileMessage = document.getElementById("profile-message");


// buttons
let viewDashboardLinks = document.querySelectorAll(".view-dashboard-link");
let logInLinks = document.querySelectorAll(".log-in-link");
let profileLinks = document.querySelectorAll(".profile-link");


let currentIndex = 0;

function getCurrentUser() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUsername = localStorage.getItem("currentUser");
  // console.log(users.find(u => u.username === currentUsername) || null);
  return users.find(u => u.username === currentUsername) || null;
}

const currentUser = getCurrentUser();

document.getElementById("clear-users").addEventListener("click", () => {
  localStorage.clear();
  
  alert("All user data has been cleared!");
});

let userInfo = {

  name: undefined,
  username: undefined,
  password: undefined,
  profile_picture: undefined,
  saved_playlists: {},
  played_games: [],

}

// Load saved users from localStorage (array of userInfo objects)
function loadUsers() {

  console.log("loadUsers function executed!");
  return JSON.parse(localStorage.getItem("users")) || [];
}

// Save back to localStorage
function saveUsers(users) {
  console.log("saveUsers function executed!");
  localStorage.setItem("users", JSON.stringify(users));
}

function refreshUIAfterLogin() {

  console.log("refreshUIAfterLogin function executed!");
  const currentUser = getCurrentUser(); // use your existing helper
  if (!currentUser) return;

  // Update dashboard and profile headings
  dashboardMessage.innerHTML = `${currentUser.name}'s Dashboard`;
  profileMessage.innerHTML = `${currentUser.name}'s Profile`;

  // Populate hello messages
  helloMessages.forEach(message => {
    message.textContent = `Hello ${currentUser.name || currentUser.username}!`;
  });

  // Show dashboard + profile links amd log out link, hide log in links
  viewDashboardLinks.forEach(link => showElement(link));
  profileLinks.forEach(link => showElement(link));
  logInLinks.forEach(link => hideElement(link));
  showElement(logOutLink);
}

function logOutUser() {
  console.log("logOutUser function executed!");

  // Remove current user from localStorage
  localStorage.removeItem("currentUser");

  // clear sensitive info in memory
  nicknameField.value = "";
  emailField.value = "";
  usernameField.value = "";
  passwordField.value = "";


  helloMessages.forEach(message => {
    message.textContent = "Hello Gamer!";
  });

  // Hide dashboard/profile links, show login links again
  viewDashboardLinks.forEach(link => hideElement(link));
  logInLinks.forEach(link => showElement(link));

  // Hide logout link
  hideElement(logOutLink);

  // Optional: show a success message
  alert("👋 You’ve been logged out successfully!");
}

function refreshUIAfterLogout() {
  console.log("refreshUIAfterLogout function executed!");

  viewDashboardLinks.forEach(link => hideElement(link));
  profileLinks.forEach(link => hideElement(link));
  logInLinks.forEach(link => showElement(link));
  hideElement(logOutLink);

  helloMessages.forEach(message => {
    message.textContent = "Hello Gamer!";
  });

}

function showLogInModal(link) {

  console.log("showLogInModal function executed!");
  if (!link) return;

  // Ensure the link is visible
  showElement(link);

  // Prevent duplicate listeners cleanly
  link.removeEventListener('click', handleLogInClick);
  link.addEventListener('click', handleLogInClick);
}

function handleLogInClick(e) {

  console.log("handleLogInClick function executed!");

  e.preventDefault();
  e.stopPropagation(); // Prevent nav collapse

  const modal = bootstrap.Modal.getOrCreateInstance(logInModal);
  modal.show();

  currentModal = logInModal;
  mode = "login";
}

viewDashboardLinks.forEach(link => {

  link.addEventListener("click", () => {

    showElement(dashboardModal);

  });

})

function checkLoginStatus() {
  console.log("checkLoginStatus function executed!");

  currentUser = getCurrentUser();

  if (currentUser) {
    console.log(`✅ Logged in as ${currentUser.username}`);
    refreshUIAfterLogin(); // Rebuild your UI to match the logged-in state
  } else {
    console.log("🚫 No user logged in");
    console.log("🚫 No valid user session found — logging out.");
    localStorage.removeItem("currentUser");
    refreshUIAfterLogout(); // optional: a function that handles the reset
  }
}

/// DOM Ready ///
document.addEventListener("DOMContentLoaded", () => {

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const user = getCurrentUser();

  // --- Landing Page Links ---
  landingPageLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (currentModal) hideElement(currentModal);
      showElement(landingPage);
      currentModal = landingPage;
    });
  });

  // --- User Logged In ---
  if (currentUser && user) {

    dashboardMessage.innerHTML = `${user.name}'s Dashboard`;
    profileMessage.innerHTML = `${user.name}'s Profile`;

    helloMessages.forEach(message => {
      message.textContent = `Hello ${user.name || user.username}!`;
    });

    // Profile links → open profile modal
    profileLinks.forEach(link => {
      
      link.removeEventListener("click", handleLogInClick);
      link.removeAttribute("data-bs-toggle");
      link.removeAttribute("data-bs-target");
      showElement(profileModal);

      showElement(link);
    });

    // Dashboard links → open dashboard modal
    viewDashboardLinks.forEach(link => {

      console.log("viewDashboardLinks function executed!");
      showElement(link);

      link.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        if (currentModal) hideElement(currentModal);
        showElement(dashboardModal);
        currentModal = dashboardModal;
      });
    });

    // Hide "Log In" links since they're already logged in
    logInLinks.forEach(hideElement);

    // show log out link
    showElement(logOutLink);
  }

  // --- User Logged Out ---
  if (!currentUser) {
    // Clicking on profile pictures should open the log in modal
    // and disable BootStrap's default nav collapse behavior
     profileLinks.forEach(link => {
      link.removeAttribute("data-bs-toggle");
      link.removeAttribute("data-bs-target");
      showLogInModal(link);
    });

    // Hide dashboard links
    viewDashboardLinks.forEach(hideElement);

    // Set up login links to open the modal
    logInLinks.forEach(showLogInModal);

    // hide the log out link
    hideElement(logOutLink);
  }

  // --- Tabs inside modal ---
  signUpTab.addEventListener("click", () => {
    logInModalGreeting.textContent = "Welcome!";
    logInButton.textContent = "Create Account";
    mode = "signup";
    console.log("mode = " + mode);

    errorMessage.textContent = "";
    signUpFields.forEach(showElement);
  });

  logInTab.addEventListener("click", () => {
    logInModalGreeting.textContent = "Welcome back!";
    logInButton.textContent = "Log In";
    mode = "login";
     console.log("mode = " + mode);

    errorMessage.textContent = "";
    signUpFields.forEach(hideElement);
  });

  checkLoginStatus();

});

// resets log in message and input fields when logInModal is closed
logInModal.addEventListener("hidden.bs.modal", () => {

  // Reset modal contents
  logInModalGreeting.textContent = "Log in / Sign up";
  logInButton.textContent = "Log In";
  errorMessage.textContent = "";

  // Reset tab state (show Log In tabs and panes)
  document.getElementById("log-in-tab").classList.add("active");
  document.getElementById("sign-up-tab").classList.remove("active");

  document.getElementById("log-in-tab-pane").classList.add("show", "active");
  document.getElementById("sign-up-tab-pane").classList.remove("show", "active");

  // Clear all input fields (optional, but helps UX)
  document.querySelectorAll("#log-in-modal input").forEach(input => {
    input.value = "";
  });
})

// Manual validation when clicking button
logInButton.addEventListener("click", function() {
  errorMessage.textContent = ""; // reset
  let valid = true;

  document.querySelectorAll(".modal-body input").forEach(field => {
    // only check visible fields
    if (field.offsetParent !== null && !field.value.trim()) {
      valid = false;
      field.classList.add("is-invalid"); // bootstrap red border
    } else {
      field.classList.remove("is-invalid");
    }
  });

  if (!valid) {
    errorMessage.textContent = "⚠️ Please fill in all required fields.";
    return;
  } 

  let users = loadUsers();

  if (mode === "signup") {
    // Build new user object
    let newUser = {
      name: nicknameField.value.trim(),
      username: usernameField.value.trim(),
      password: passwordField.value.trim(),
      email: emailField.value.trim(),
      profile_picture: undefined,
      saved_playlists: {},
      played_games: []
    };

    // Check for duplicate username
    let existing = users.find(u => u.username === newUser.username);

    if (existing) {
      errorMessage.textContent = "⚠️ Username already exists. Please log in instead.";
      return;
    }

    // Save new user
    users.push(newUser);
    saveUsers(users);
    // alert("✅ Account created!");

    // ✅ Automatically log them in
    localStorage.setItem("currentUser", newUser.username);
    alert(`✅ Welcome, ${newUser.name || newUser.username}! Your account has been created and you're now logged in.`);

    // Immediately update the interface using your existing structure
    refreshUIAfterLogin();

    // Close the modal (Bootstrap way)
    const modal = bootstrap.Modal.getInstance(logInModal);
    if (modal) modal.hide();

  } else if (mode === "login") {
    let enteredUsername = usernameField.value.trim();
    let enteredPassword = passwordField.value.trim();

    let existing = users.find(u => u.username === enteredUsername);

    if (!existing) {
      errorMessage.textContent = "⚠️ No account found with that username.";
      return;
    }

    if (existing.password !== enteredPassword) {
      errorMessage.textContent = "⚠️ Incorrect password.";
      return;
    }

    // 🎉 Successful login!
    alert(`✅ Welcome back, ${existing.name || existing.username}!`);

    // Auto-fill form with stored info
    nicknameField.value = existing.name || "";
    emailField.value = existing.email || "";
    usernameField.value = existing.username || "";
    passwordField.value = existing.password || "";

    localStorage.setItem("currentUser", existing.username);

    refreshUIAfterLogin();

    const modal = bootstrap.Modal.getInstance(logInModal);
    if (modal) modal.hide();
  }

});

if (logOutLink) {
  logOutLink.addEventListener("click", e => {
    e.preventDefault();
    logOutUser();
  });
}

function truncateText(text, maxLength) {
  if (!text) return "No summary available.";
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

// Add click event
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a game name first.");
    return;
  }

  statusDiv.textContent = `Searching for "${query}"…`;
  resultsDiv.innerHTML = "";
  emptyDiv.style.display = "none";

  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    if (!data.length) {
      emptyDiv.style.display = "block";
      statusDiv.textContent = "No results found.";
      return;
    }

    // Render results
    data.forEach((game, index) => {
      const tpl = document.getElementById("game-card-template");
      const card = tpl.content.cloneNode(true);

      // --- unique IDs ---
      const accordionId = `accordion-${index}`;
      const collapseId = `collapse-${index}`;
      const collapseEl = card.querySelector(".accordion-collapse");
      const buttonEl = card.querySelector(".accordion-button");

      // update IDs inside card
      card.querySelector(".accordion").id = accordionId;
      collapseEl.id = collapseId;
      collapseEl.setAttribute("data-bs-parent", `#${accordionId}`);
      buttonEl.setAttribute("data-bs-target", `#${collapseId}`);
      buttonEl.setAttribute("aria-controls", collapseId);

      if (game.cover && game.cover.url) {
        const coverUrl = "https:" + game.cover.url.replace("t_thumb", "t_cover_big");
        card.querySelector(".cover-art").style.backgroundImage = `url("${coverUrl}")`;
      } else {
        card.querySelector(".cover-art").style.backgroundImage = `url("./assets/fallback-image.png")`; 
      }

      // Title
      card.querySelector(".title").textContent = game.name || "Untitled";

      // Release date
      if (game.first_release_date) {
        const year = new Date(game.first_release_date * 1000).getFullYear();
        card.querySelector(".year").appendChild(makeBadge(year));
      }

      // Platforms
      if (game.platforms) {

        game.platforms.forEach(platform => {
          card.querySelector(".platform").appendChild(makeBadge(platform.name));
        }) 
      }

      // Genres

      if (game.genres) {

        game.genres.forEach(genre => {
          card.querySelector(".genre").appendChild(makeBadge(genre.name));
        }) 
      } 
      
      card.querySelector(".desc").textContent = game.summary || "No summary available.";

      resultsDiv.appendChild(card);
    });

    statusDiv.textContent = `Found ${data.length} result(s) for "${query}".`;
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "Error fetching results.";
    resultsDiv.textContent = err.message;
  }
});

// Optional: also trigger search on Enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Helper to build badge spans
function makeBadge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
}

function showElement(el) {
  if (!el) return;
  el.classList.remove("d-none");
}

function hideElement(el) {
  if (!el) return;
  el.classList.add("d-none");
}
