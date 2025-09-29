
    var color ;
    document.addEventListener('DOMContentLoaded', function() {
        const botId = getBotIdFromURL(); // Implement this function to get bot ID from URL
        const nameInput = document.querySelector('#botName');
        const colorInput = document.querySelector('#botColor');
        const greetingInput = document.querySelector('#botGreeting');
        const textSizeSelect = document.querySelector('#botTextSize');
        const avatarInput = document.querySelector('#botAvatar');
        //log the bot id
        console.log(botId);
        // fetchBotConfiguration(botId).then(config => {
        //     updateChatbotInterface(config);
        //     // Initialize and display the chatbox with the fetched bot ID
        //     const chatbox = new Chatbox(botId);
        //     chatbox.display();
        // });
        fetchBotConfiguration(botId).then(config => {
            //console.log(config);
            color = config.color;
            updateChatbotInterface(config);
            document.querySelector('#botName').value = config.name || '';
            document.querySelector('#botGreeting').value = config.greeting || '';
            document.querySelector('#botColor').value = config.color || '#000000'; // Default color if none is set
            document.querySelector('#botTextSize').value = config.textSize || 'medium';
            document.querySelector('#botAvatar').value = config.avatarURL || '';
            // Any other logic that needs to use `config`
        });

        // Event listener for name change
        nameInput.addEventListener('input', function() {
            const newName = nameInput.value;
            updateChatbotName(newName);
        });
        // Event listener for color change
        colorInput.addEventListener('input', function() {
            const newColor = colorInput.value;
            updateChatbotColor(newColor);
        });
        greetingInput.addEventListener('input', function() {
            const newGreeting = greetingInput.value;
            updateChatbotGreeting(newGreeting);
        });

        // Event listener for text size change
        textSizeSelect.addEventListener('change', function() {
            const newTextSize = textSizeSelect.value;
            updateChatbotTextSize(newTextSize);
        });

        // Event listener for avatar URL change
        avatarInput.addEventListener('input', function() {
            const newAvatarURL = avatarInput.value;
            updateChatbotAvatar(newAvatarURL);
        });
        document.getElementById('saveCustomizationButton').addEventListener('click', function() {
            const botId = getBotIdFromURL(); // Or however you're currently retrieving the bot's ID
            const updatedConfig = getUpdatedConfig(); // Get the current values from the form
            saveBotConfiguration(botId, updatedConfig); // Save the updated configuration
        });
        document.getElementById('getScriptButtonEdit').addEventListener('click', function() {
            const botId = getBotIdFromURL(); // Retrieve the botId from URL
            const scriptTag = `<script src="/generate-bot-script/${botId}"></script>`;
            
            // Display the script tag in the scriptDisplayBox
            document.getElementById('scriptDisplayBox').textContent = scriptTag;
        });
        
        function getUpdatedConfig() {
            // Gather data from the page's input fields and return it as an object
            return {
                name: document.querySelector('#botName').value,
                greeting: document.querySelector('#botGreeting').value,
                color: document.querySelector('#botColor').value,
                textSize: document.querySelector('#botTextSize').value,
                avatarURL: document.querySelector('#botAvatar').value,
            };
        }
    });
        
    //make global color
    function updateChatbotGreeting(newGreeting) {
        const chatDescription = document.querySelector('.chatbox__description--header');
        chatDescription.textContent = newGreeting;
    }

    function updateChatbotTextSize(newTextSize) {
        const chatMessages = document.querySelectorAll('.chatbox__messages .messages__item');
        chatMessages.forEach(function(message) {
            switch (newTextSize) {
                case 'small':
                    message.style.fontSize = '0.8rem'; // Adjust sizes as needed
                    break;
                case 'medium':
                    message.style.fontSize = '1rem'; // Default size
                    break;
                case 'large':
                    message.style.fontSize = '1.2rem'; // Adjust sizes as needed
                    break;
            }
        });
    }

    function updateChatbotAvatar(newAvatarURL) {
        const chatAvatar = document.querySelector('.chatbox__image--header img');
        chatAvatar.src = newAvatarURL;
    }
    function updateChatbotName(newName) {
        const chatHeading = document.querySelector('.chatbox__heading--header');
        chatHeading.textContent = newName;
    }

    function updateChatbotColor(newColor) {
        const chatHeader = document.querySelector('.chatbox__header');
        const chatFooter = document.querySelector('.chatbox__footer');
        const operatorMessages = document.querySelectorAll('.messages__item--operator');

        // Update the header and footer background color
        chatHeader.style.background = newColor;
        chatFooter.style.background = newColor;
        //here
        // Update the operator messages background color
        operatorMessages.forEach(function(msg) {
            msg.style.backgroundColor = newColor;
        });

        // Update the global color variable
        color = newColor;
        const chatIconPath = document.getElementById('chatIconPath');
        chatIconPath.setAttribute('fill', color);
        //here for logo
    }

    function fetchBotConfiguration(botId) {
        return fetch(`/get-bot-configuration/${botId}`, {
            mode: 'cors',
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => data) // This will return the data to the calling function
        .catch(error => console.error('Error:', error));
    }

    function updateChatbotInterface(config) {
        
        const footer = document.querySelector('.chatbox__footer');
        const chatHeader = document.querySelector('.chatbox__header');
        
        const chatAvatar = document.querySelector('.chatbox__image--header img');
        const chatHeading = document.querySelector('.chatbox__heading--header');
        const chatDescription = document.querySelector('.chatbox__description--header');
        const chatBox = document.querySelector('.chatbox__support');
        const openButton = document.querySelector('.chatbox__button');
        const textInput = document.querySelector('.chatbox__messages .messages__item--operator');

        const chatIconPath = document.getElementById('chatIconPath'); // Access the SVG path
        if (textInput) {
            textInput.style.backgroundColor = config.color;
        }
        // Apply settings to chatbot elements
        if(chatHeader) {{
            chatHeader.style.background = config.color;
            footer.style.background = config.color;
        }}
        if(chatAvatar) {{
            chatAvatar.src = config.avatarURL;
        }}
        if(chatHeading) {{
            chatHeading.textContent = config.name;
        }}
        if(chatDescription) {{
            chatDescription.textContent = config.greeting;
        }}
        if(chatIconPath){{
            chatIconPath.setAttribute('fill', config.color);
        }}
       
    
        
        // Update other elements as needed
    }

    function getUpdatedConfig() {
        // Gather data from the page's input fields and return it as an object
        return {
            name: document.querySelector('#nameInput').value,
            greeting: document.querySelector('#greetingInput').value,
            avatarURL: document.querySelector('#avatarInput').value,
            // Include other properties as needed
        };
    }

    function saveBotConfiguration(botId, config) {
        fetch(`/update-bot-config/${botId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors', // Include CORS mode
            body: JSON.stringify(config)
        }).then(response => {
            if (response.ok) {
                Swal.fire({
                    title: 'Success',
                    text: 'Configuration saved successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to save configuration, make sure you made any changes.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    }
    

    function getBotIdFromURL() {
        // Implement logic to extract bot ID from URL
        // Example: if the URL is http://example.com/page?botId=123
        // You can use URLSearchParams to extract 'botId'
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('botId');
    }
        class Chatbox {
            constructor(bot_id) {
                this.bot_id = bot_id;
                this.args = {
                    openButton: document.querySelector('.chatbox__button'),
                    chatBox: document.querySelector('.chatbox__support'),
                    sendButton: document.querySelector('.send__button')
                }
                
                this.state = false;
                this.messages = [];
            }
        
            display() {
                const {openButton, chatBox, sendButton} = this.args;

                openButton.addEventListener('click', () => this.toggleState(chatBox))

                sendButton.addEventListener('click', () => this.onSendButton(chatBox))

                const node = chatBox.querySelector('input');
                node.addEventListener("keyup", ({key}) => {
                    if (key === "Enter") {
                        this.onSendButton(chatBox)
                    }
                })
            }

            toggleState(chatbox) {
                this.state = !this.state;

                // show or hides the box
                if(this.state) {
                    chatbox.classList.add('chatbox--active')
                } else {
                    chatbox.classList.remove('chatbox--active')
                }
            }

            onSendButton(chatbox) {
                var textField = chatbox.querySelector('input');
                let text1 = textField.value;
                if (text1 === "") {
                    return;
                }
        
                // Add user's message to the chat
                let msg1 = { name: "User", message: text1 };
                this.messages.push(msg1);
        
                // Add a dummy response instead of fetching from server
                let msg2 = { name: "Sam", message: "This is a dummy response." };
                this.messages.push(msg2);
        
                // Update chat text and clear input field
                this.updateChatText(chatbox);
                textField.value = '';
            }

            updateChatText(chatbox) {
                var html = '';
                this.messages.slice().reverse().forEach(function(item, index) {
                    if (item.name === "Sam")
                    {
                        html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
                    }
                    else
                    {
                        html += `<div class="messages__item messages__item--operator" style="background-color: ${color};">${item.message}</div>`;           
                    }
                });

                const chatmessage = chatbox.querySelector('.chatbox__messages');
                chatmessage.innerHTML = html;
            }
        }


        const chatbox = new Chatbox();
        chatbox.display();


