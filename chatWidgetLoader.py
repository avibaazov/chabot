app_css_path = 'standalone-frontend/style.css'  # Relative path
app_js_path = 'standalone-frontend/app.js'  # Relative path
def create_template(bot_id,name, greeting, color, textSize, avatarURL):
    svg_icon = f"""
    <svg width="36" height="29" viewBox="0 0 36 29" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28.2857 10.5714C28.2857 4.88616 21.9576 0.285714 14.1429 0.285714C6.32813 0.285714 0 4.88616 0 10.5714C0 13.8259 2.08929 16.7388 5.34375 18.6272C4.66071 20.2946 3.77679 21.0781 2.9933 21.9621C2.77232 22.2232 2.51116 22.4643 2.59152 22.846C2.65179 23.1875 2.93304 23.4286 3.23438 23.4286C3.25446 23.4286 3.27455 23.4286 3.29464 23.4286C3.89732 23.3482 4.47991 23.2478 5.02232 23.1071C7.05134 22.5848 8.93973 21.721 10.6071 20.5357C11.7321 20.7366 12.9174 20.8571 14.1429 20.8571C21.9576 20.8571 28.2857 16.2567 28.2857 10.5714ZM36 15.7143C36 12.3594 33.7902 9.38616 30.3951 7.51786C30.6964 8.50223 30.8571 9.52679 30.8571 10.5714C30.8571 14.1674 29.0089 17.4821 25.654 19.933C22.5402 22.183 18.4621 23.4286 14.1429 23.4286C13.5603 23.4286 12.9576 23.3884 12.375 23.3482C14.8862 24.9955 18.221 26 21.8571 26C23.0826 26 24.2679 25.8795 25.3929 25.6786C27.0603 26.8638 28.9487 27.7277 30.9777 28.25C31.5201 28.3906 32.1027 28.4911 32.7054 28.5714C33.0268 28.6116 33.3281 28.3504 33.4085 27.9888C33.4888 27.6071 33.2277 27.3661 33.0067 27.1049C32.2232 26.221 31.3393 25.4375 30.6563 23.7701C33.9107 21.8817 36 18.9888 36 15.7143Z" fill="{color}"/>
    </svg>
    """
    # Define the chatbot's HTML structure
    chatbot_html = f"""
    <div class="chatbox">
        <div class="chatbox__support">
            <div class="chatbox__header" style="background: {color};">
                <div class="chatbox__image--header">
                    <img src="{avatarURL}" alt="avatar">
                </div>
                <div class="chatbox__content--header">
                    <h4 class="chatbox__heading--header">{name}</h4>
                    <p class="chatbox__description--header">{greeting}</p>
                    <button class="business-info__button">Details</button>
                </div>
            </div>
            <div class="chatbox__messages" style="font-size: {textSize};"></div>
            <div class="chatbox__footer" style="background: {color};">
                <input type="text" placeholder="Write a message...">
                <button class="chatbox__send--footer send__button">Send</button>
            </div>
        </div>
         <div class="chatbox__button" style="color: {color};">
            <button>{svg_icon}</button>
        </div>
    </div>
    """

    # JavaScript template with dynamic bot configuration
    js_template = f"""
    // JavaScript code to initialize and configure the chatbot
    document.addEventListener('DOMContentLoaded', function() {{
        // Define the settings for the chatbot
        
        var botSettings = {{
            name: '{name}',
            greeting: '{greeting}',
            color: '{color}',
            textSize: '{textSize}',
            avatarURL: '{avatarURL}',
            botId : '{bot_id}'
        }};
        
        // Injecting the chatbot HTML
        var chatbotContainer = document.createElement('div');
        chatbotContainer.innerHTML = `{chatbot_html}`;
        document.body.appendChild(chatbotContainer);
        var script = document.createElement('script');
        script.src = '{app_js_path}';  // Path to your app.js file
         var botId = botSettings.botId;   
         var name =  botSettings.name;  
         script.onload = function() {{
            // Initialize Chatbox with bot_id when app.js is loaded
            const chatbox = new Chatbox(botId, name);
            console.log("Bot ID:", botId);
            chatbox.display();
        }};
        document.body.appendChild(script);
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '{app_css_path}';
        document.head.appendChild(link);
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .chatbox__messages .messages__item--operator {{ background-color: {color};}}
            `
        ;
        document.head.appendChild(style);
        // Function to apply settings and activate the chatbot
        function activateChatbot() {{
            // Select chatbot elements
            const chatHeader = document.querySelector('.chatbox__header');
            const footer = document.querySelector('.chatbox__footer');
            const chatAvatar = document.querySelector('.chatbox__image--header img');
            const chatHeading = document.querySelector('.chatbox__heading--header');
            const chatDescription = document.querySelector('.chatbox__description--header');
            const chatBox = document.querySelector('.chatbox__support');
            const openButton = document.querySelector('.chatbox__button');
            
            
            // Apply settings to chatbot elements
            if(chatHeader) {{
                chatHeader.style.background = botSettings.color;
                footer.style.background = botSettings.color;
            }}
            if(chatAvatar) {{
                chatAvatar.src = botSettings.avatarURL;
            }}
            if(chatHeading) {{
                chatHeading.textContent = botSettings.name;
            }}
            if(chatDescription) {{
                chatDescription.textContent = botSettings.greeting;
            }}

            if(businessInfoButton) {{
                openButton.addEventListener('click', function() {{
                    chatBox.classList.toggle('chatbox--active');
                }});
            }}
            
            // Example chatbox toggle and send functionality
            if(openButton && chatBox) {{
                openButton.addEventListener('click', function() {{
                    chatBox.classList.toggle('chatbox--active');
                }});
            }}
            
            if (businessInfoButton) {{
            businessInfoButton.addEventListener('click', function() {{
                getBusinessInfo();
            }});
            }}

            // Handle sending of messages (modify as needed)
            // Add your message sending logic here

            // Other configurations and event listeners as needed...
        }}
        
        // Activate the chatbot
        activateChatbot();

    }});
    """
    return js_template
