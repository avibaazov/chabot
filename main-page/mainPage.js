document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageshow', (event) => {
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
    const createBotButton = document.getElementById('createBotButton');
    const loadBotButton = document.getElementById('loadBotButton');
    const logoutButton = document.querySelector('.logout-button');
    if(createBotButton) {
        createBotButton.addEventListener('click', createBot);
    }

    if(loadBotButton) {
        loadBotButton.addEventListener('click', loadBot);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            console.log("Logout clicked");
            fetch('http://127.0.0.1:5000/logout', {
                method: 'POST',
                credentials: 'include'  // Ensures cookies, which are required for sessions, are sent
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Logout failed with status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Logout:', data.message);
                window.location.href = '/login-page/login.html'; // Redirect to login page
            })
            .catch(error => console.error('Logout failed:', error));
        });
    }

    loadUserBots(); // Load bots when page is ready
});

function loadUserBots() {
    fetch('http://127.0.0.1:5000/get-user-bots', {
        credentials: 'include', // Ensure cookies are sent
        
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received data:', data); // Add this line to log the data
        if (data.error) {
            
            console.error('Error:', data.error);
        } else {
            displayBots(data);
        }
    })
    .catch(error => console.error('Error:', error));
}

function displayBots(bots) {
    const botsContainer = document.getElementById('botsContainer');
    const botsCount = document.getElementById('botsCount'); // Get the header element
   
    if (botsContainer && botsCount) {
        botsContainer.innerHTML = ''; // Clear existing content
        if (bots.length === 1) { // Check if there is exactly one bot
            botsCount.innerHTML = `You have ${bots.length} bot:`; // Update the count for one bot
        } else {
            botsCount.innerHTML = `You have ${bots.length} bots:`; // Update the count for multiple bots
        }

        bots.forEach(bot => {
            const botElement = document.createElement('div');
            botElement.className = 'bot';
            botElement.style.backgroundColor = bot.color;
            botElement.innerHTML = `
               
                <img src="https://img.icons8.com/color/48/000000/bot.png" alt="Bot Icon" class="bot-icon" style="filter: invert(100%); filter: hue-rotate(${bot.color});">

                <h3>${bot.name}</h3>
                <div class="bot-buttons">
                <button class="bot-button" onclick="loadBots('${bot._id}')"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="black" d="M128 76a52 52 0 1 0 52 52a52.06 52.06 0 0 0-52-52m0 80a28 28 0 1 1 28-28a28 28 0 0 1-28 28m92-27.21v-1.58l14-17.51a12 12 0 0 0 2.23-10.59A111.75 111.75 0 0 0 225 71.89a12 12 0 0 0-9.11-5.89l-22.28-2.5l-1.11-1.11L190 40.1a12 12 0 0 0-5.89-9.1a111.67 111.67 0 0 0-27.23-11.27A12 12 0 0 0 146.3 22l-17.51 14h-1.58L109.7 22a12 12 0 0 0-10.59-2.23a111.75 111.75 0 0 0-27.22 11.28A12 12 0 0 0 66 40.11l-2.5 22.28l-1.11 1.11L40.1 66a12 12 0 0 0-9.1 5.89a111.67 111.67 0 0 0-11.23 27.23A12 12 0 0 0 22 109.7l14 17.51v1.58L22 146.3a12 12 0 0 0-2.23 10.59a111.75 111.75 0 0 0 11.29 27.22a12 12 0 0 0 9.05 5.89l22.28 2.48l1.11 1.11L66 215.9a12 12 0 0 0 5.89 9.1a111.67 111.67 0 0 0 27.23 11.27A12 12 0 0 0 109.7 234l17.51-14h1.58l17.51 14a12 12 0 0 0 10.59 2.23A111.75 111.75 0 0 0 184.11 225a12 12 0 0 0 5.91-9.06l2.48-22.28l1.11-1.11L215.9 190a12 12 0 0 0 9.06-5.91a111.67 111.67 0 0 0 11.27-27.23A12 12 0 0 0 234 146.3Zm-24.12-4.89a70.1 70.1 0 0 1 0 8.2a12 12 0 0 0 2.61 8.22l12.84 16.05a86.47 86.47 0 0 1-4.33 10.49l-20.43 2.27a12 12 0 0 0-7.65 4a69 69 0 0 1-5.8 5.8a12 12 0 0 0-4 7.65L166.86 207a86.47 86.47 0 0 1-10.49 4.35l-16.05-12.85a12 12 0 0 0-7.5-2.62h-.72a70.1 70.1 0 0 1-8.2 0a12.06 12.06 0 0 0-8.22 2.6l-16.05 12.85A86.47 86.47 0 0 1 89.14 207l-2.27-20.43a12 12 0 0 0-4-7.65a69 69 0 0 1-5.8-5.8a12 12 0 0 0-7.65-4L49 166.86a86.47 86.47 0 0 1-4.35-10.49l12.84-16.05a12 12 0 0 0 2.61-8.22a70.1 70.1 0 0 1 0-8.2a12 12 0 0 0-2.61-8.22L44.67 99.63A86.47 86.47 0 0 1 49 89.14l20.43-2.27a12 12 0 0 0 7.65-4a69 69 0 0 1 5.8-5.8a12 12 0 0 0 4-7.65L89.14 49a86.47 86.47 0 0 1 10.49-4.35l16.05 12.85a12.06 12.06 0 0 0 8.22 2.6a70.1 70.1 0 0 1 8.2 0a12 12 0 0 0 8.22-2.6l16.05-12.85A86.47 86.47 0 0 1 166.86 49l2.27 20.43a12 12 0 0 0 4 7.65a69 69 0 0 1 5.8 5.8a12 12 0 0 0 7.65 4L207 89.14a86.47 86.47 0 0 1 4.35 10.49l-12.84 16.05a12 12 0 0 0-2.63 8.22"/></svg></button>
                <button class="bot-button" onclick="trainBot('${bot._id}')"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"/></svg></button>
                <button class="bot-button-delete" onclick="deleteBot('${bot._id}')"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/></svg></button>
                </div>
            `;
            botsContainer.appendChild(botElement);
        });
    } else {
        console.error('botsContainer or botsCount element not found');
    }
}

function deleteBot(botId){
     // Ask the user for confirmation before deleting
     const userInput = prompt("Are you sure you want to delete this bot? Write 'YES' to confirm.");
     // Check if the user confirmed the action
     if (userInput && userInput.trim().toLowerCase() === 'yes') {
         // User confirmed, perform the delete operation
         fetch(`http://127.0.0.1:5000/delete-bot/${botId}`, {
            mode:'cors', 
            method: 'DELETE',
            credentials: 'include',
              // Include cookies if needed
         })
         .then(response => {
             if (!response.ok) {
                 throw new Error('Network response was not ok.');
             }
             return response.json(); // Or simply return response to handle it depending on your API design
         })
         .then(data => {
             console.log('Bot deleted:', data);
             // Optionally, remove the bot from the display or refresh the bot list
             loadUserBots();
         })
         .catch(error => {
             console.error('Error:', error);
         });
     } else {
         // User did not confirm, do nothing
         console.log('Bot deletion cancelled.');
     }
}
function loadBots(botId) {
    // Redirect to the bot loading page or implement logic to load the specific bot
    console.log('Loading bot with ID:', botId);
    // Example: window.location.href = `/path-to-load-bot/${botId}`;
    window.location.href = `http://127.0.0.1:5500/bot-load-display/bot_edit.html?botId=${botId}`;
}
function createBot() {
    // Implement the logic or redirect to the page for creating a bot
   //alert('Create Bot Clicked');
    window.location.href = 'http://127.0.0.1:5500/bot-creation-page/create.html';
}

function loadBot() {
    // Implement the logic or redirect to the page for loading an existing bot
    alert('Load Bot Clicked');
}
function trainBot(botId) {
    // Redirect to the training page with the botId as a query parameter
    window.location.href = `http://127.0.0.1:5500/website-frontend/train_forms.html?botId=${botId}`;
}