document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("pageshow", (event) => {
    // This event will be triggered when coming back to the page.
    // It's a good idea to check if the page is retrieved from cache.
    if (event.persisted) {
      // If the page is loaded from cache (like using the back button),
      // you might want to reload the data.
      loadUserBots();
    } else {
      // If the page is not loaded from cache, you can optionally
      // call loadUserBots() here if you want to refresh data on each page visit.
      loadUserBots();
    }
  });
  const createBotButton = document.getElementById("createBotButton");
  const loadBotButton = document.getElementById("loadBotButton");
  const logoutButton = document.querySelector(".logout-button");
  if (createBotButton) {
    createBotButton.addEventListener("click", createBot);
  }

  if (loadBotButton) {
    loadBotButton.addEventListener("click", loadBot);
  }
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      console.log("Logout clicked");
      fetch("/logout", {
        method: "POST",
        credentials: "include", // Ensures cookies, which are required for sessions, are sent
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Logout failed with status: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Logout:", data.message);
          window.location.href = "/login-page/login.html"; // Redirect to login page
        })
        .catch((error) => console.error("Logout failed:", error));
    });
  }

  loadUserBots(); // Load bots when page is ready
});

function loadUserBots() {
  fetch("/get-user-bots", {
    credentials: "include", // Ensure cookies are sent
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Received data:", data); // Add this line to log the data
      if (data.error) {
        console.error("Error:", data.error);
      } else {
        displayBots(data);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function displayBots(bots) {
  const botsContainer = document.getElementById("botsContainer");
  const botsCount = document.getElementById("botsCount");

  if (botsContainer && botsCount) {
    botsContainer.innerHTML = "";
    if (bots.length === 0) {
      botsCount.innerHTML = "No Active Bots";
      botsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🤖</div>
          <h3>No bots yet</h3>
          <p>Create your first chatbot to get started</p>
        </div>
      `;
      return;
    }
    
    if (bots.length === 1) {
      botsCount.innerHTML = `${bots.length} Active Bot`;
    } else {
      botsCount.innerHTML = `${bots.length} Active Bots`;
    }

    bots.forEach((bot) => {
      const botElement = document.createElement("div");
      botElement.className = "bot";
      // Removed strong background colors for better readability
      botElement.innerHTML = `
        <div class="bot-info">
          <div class="bot-icon">🤖</div>
          <h3>${bot.name}</h3>
        </div>
        <div class="bot-buttons">
          <button class="bot-button" onclick="loadBots('${bot._id}')" title="Configure Bot">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
            </svg>
          </button>
          <button class="bot-button" onclick="trainBot('${bot._id}')" title="Train Bot">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"/>
            </svg>
          </button>
          <button class="bot-button-delete" onclick="deleteBot('${bot._id}')" title="Delete Bot">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/>
            </svg>
          </button>
        </div>
      `;
      botsContainer.appendChild(botElement);
    });
  } else {
    console.error("botsContainer or botsCount element not found");
  }
}

function adjustColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const B = (num >> 8 & 0x00FF) + amt;
  const G = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
}

function deleteBot(botId) {
  if (confirm("Are you sure you want to delete this bot? This action cannot be undone.")) {
    const botElement = event.target.closest('.bot');
    if (botElement) {
      botElement.style.opacity = '0.5';
      botElement.style.pointerEvents = 'none';
    }
    
    fetch(`/delete-bot/${botId}`, {
      mode: "cors",
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Bot deleted:", data);
        loadUserBots();
      })
      .catch((error) => {
        console.error("Error:", error);
        if (botElement) {
          botElement.style.opacity = '1';
          botElement.style.pointerEvents = 'auto';
        }
      });
  } else {
    console.log("Bot deletion cancelled.");
  }
}
function loadBots(botId) {
  // Redirect to the bot loading page or implement logic to load the specific bot
  console.log("Loading bot with ID:", botId);
  // Example: window.location.href = `/path-to-load-bot/${botId}`;
  window.location.href = `/bot-load-display/bot_edit.html?botId=${botId}`;
}
function createBot() {
  // Implement the logic or redirect to the page for creating a bot
  //alert('Create Bot Clicked');
  window.location.href = "/bot-creation-page/create.html";
}

function loadBot() {
  // Implement the logic or redirect to the page for loading an existing bot
  alert("Load Bot Clicked");
}
function trainBot(botId) {
  // Redirect to the training page with the botId as a query parameter
  window.location.href = `/website-frontend/train_forms.html?botId=${botId}`;
}
