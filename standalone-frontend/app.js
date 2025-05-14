class Chatbox {
    constructor(bot_id, bot_name) {
        this.bot_id = bot_id;
        this.bot_name = bot_name;
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            businessInfoButton: document.querySelector('.business-info__button'),
            fullscreenButton: document.querySelector('.chatbox__fullscreen--header')
        };
        
        this.state = false;
        this.messages = [];
    }

    display() {
        const {openButton, chatBox, sendButton, businessInfoButton, fullscreenButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox));
        sendButton.addEventListener('click', () => this.onSendButton(chatBox));
        businessInfoButton.addEventListener('click', () => this.getBusinessInfo(chatBox));
        fullscreenButton.addEventListener('click', () => this.toggleFullScreen(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        if(this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    toggleFullScreen(chatbox) {
        chatbox.classList.toggle('chatbox--fullscreen');
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value;
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 };
        this.messages.push(msg1);

        fetch(`http://127.0.0.1:5000/predict/${this.bot_id}`, {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "Sam", message: r.answer };
            this.messages.push(msg2);
            this.updateChatText(chatbox);
            textField.value = '';
        })
        .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            textField.value = '';
        });
    }

    getBusinessInfo(chatbox) {
        fetch('http://127.0.0.1:5000/business-info', {
            method: 'POST',
            body: JSON.stringify({ bot_name: this.bot_name }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(r => r.json())
        .then(r => {
            if (r.error) {
                alert("Business not found");
            } else {
                let msg = {
                    name: "Business Info",
                    message: `
                        Name: ${r.name}<br>
                        Address: ${r.address}<br>
                        Phone: ${r.phone}<br>
                        Rating: ${r.rating}<br>
                        Opening Hours: ${r.opening_hours ? r.opening_hours.join("<br>") : "No opening hours available"}<br>
                        Website: <a href="${r.website}" target="_blank">${r.website}</a><br>
                        <a href="${r.maps_url}" target="_blank">View on Google Maps</a><br>
                        <a href="${r.reviews_url}" target="_blank">View Google Reviews</a>   `
                };
                this.messages.push(msg);
                this.updateChatText(chatbox);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("An error occurred while fetching business info");
        });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else if (item.name === "Business Info") {
                html += '<div class="messages__item messages__item--business-info">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}
