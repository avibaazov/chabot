document.getElementById('submit').addEventListener('click', function(e) {
    e.preventDefault();

    // Extract configuration values from the form
    const botName = document.getElementById('botName').value;
    const botGreeting = document.getElementById('botGreeting').value;
    const botColor = document.getElementById('botColor').value;
    const botTextSize = document.getElementById('botTextSize').value;
    const botAvatarURL = document.getElementById('botAvatar').value;

    // Prepare the bot configuration object
    const botConfig = {
        name: botName,
        greeting: botGreeting,
        color: botColor,
        textSize: botTextSize,
        avatarURL: botAvatarURL
    };

    // Send this configuration to the /create-bot endpoint
    fetch('http://127.0.0.1:5000/create-bot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({configuration: botConfig}),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Bot created with ID:', data.bot_id);
        
        // Store the bot ID for later use
        localStorage.setItem('createdBotId', data.bot_id);

        // Enable the "Get Script" button
        document.getElementById('getScriptButton').disabled = false;
        document.getElementById('submit').disabled = true;

        // Show SweetAlert notification
        Swal.fire({
            title: 'Success!',
            text: 'Bot created successfully with ID: ' + data.bot_id,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    })
    .catch((error) => {
        console.error('Error:', error);

        // Show SweetAlert error notification
        Swal.fire({
            title: 'Error!',
            text: 'There was an error creating the bot.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
});

// Handle the "Get Script" button click to fetch and display the script tag
document.getElementById('getScriptButton').addEventListener('click', function() {
    const botId = localStorage.getItem('createdBotId');
    if (botId) {
        fetch(`http://127.0.0.1:5000/get-bot-script-tag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({bot_id: botId}),
        })
        .then(response => response.json())
        .then(data => {
            // Display the script tag in the designated display box
            document.getElementById('scriptDisplayBox').innerText = data.script_tag;

            
        })
        .catch((error) => {
            console.error('Error fetching script tag:', error);

            // Show SweetAlert error notification
            Swal.fire({
                title: 'Error!',
                text: 'There was an error fetching the script tag.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    } else {
        console.log('No bot ID found. Please create a bot first.');

        // Show SweetAlert notification if no bot ID found
        Swal.fire({
            title: 'No Bot ID',
            text: 'Please create a bot first before fetching the script tag.',
            icon: 'warning',
            confirmButtonText: 'OK'
        });
    }
});
