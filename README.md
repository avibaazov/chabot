# 🤖 Chabot – Custom AI Chatbot Platform
<a href="https://chabot-2-c7jd.onrender.com/login" target="_blank">
  <img width="1676" height="517" alt="image" src="https://github.com/user-attachments/assets/ddeba649-36b2-46dd-8f50-53e7be6e272a" />
  </a>
  
**Chabot** is a full-stack platform that empowers website owners to create and embed AI-driven chatbots directly into their websites without writing code. Built with Flask (Python), MongoDB, and vanilla JavaScript, this system offers real-time messaging, NLP capabilities, and full customization through an intuitive UI.

---

## 🌟 Features

### 🎨 1. Customizable Chatbot UI
- Set bot name, greeting message, avatar image, text size, and theme color
- Simple and responsive form interface for non-technical users
- Instant real-time preview for chatbot appearance before deployment

### ⚙️ 2. Intelligent NLP Chatbot Training
- Create training sets using tag, patterns, and responses
- Uses NLTK for text preprocessing and PyTorch-based neural network for classification
- Models are trained per user, supporting multiple bots and unique behaviors

### 📦 3. One-Click Embed Anywhere
- Automatically generate a custom <script> tag for each bot
- Embed chatbot into any external website by copying and pasting one line of code
- The script loads and injects the entire chat interface based on bot configuration

### 🔐 4. Authentication & Bot Management
- Register/login/logout functionality with client-side validation
- Manage multiple bots per user: Create, Edit, Delete, Export
- Bots are stored and linked to each user's account in the database

### 📡 5. Modular Flask Backend
- REST API (app.py) handles: /predict, /train, /generate-bot-script
- Backend modules: chat.py, train.py, model.py, Db_Handler.py, chatWidgetLoader.py
- Scalable design ready for feature extension and deployment

---

## 🧱 Tech Stack

| Layer       | Technologies                            |
|-------------|-----------------------------------------|
| Frontend    | HTML, CSS, JavaScript                   |
| Backend     | Python, Flask                           |
| NLP         | NLTK, PyTorch                           |
| Database    | MongoDB                                 |
| Deployment  | Flask + Embedded Widget Loader          |

---

## 🧪 Example Use Flow

1. User signs up to the platform  
2. Creates a bot with a custom appearance and behavior  
3. Trains bot using intent–pattern–response form  
4. Saves the bot, which is linked to their account  
5. Copies the generated <script>, adds it to their site — and the bot goes live

---

## 📁 Project Structure

```text
chabot/
├── bot-creation-page/         # UI for customizing bots
├── standalone-frontend/       # Embeddable bot loader JS
├── chat.py                    # Handles message prediction
├── train.py                   # Trains NLP model
├── model.py                   # Neural network setup
├── Db_Handler.py              # MongoDB operations
├── chatWidgetLoader.py        # Generates JS embed script
├── app.py                     # Flask server
├── templates/                 # HTML templates
├── static/                    # CSS, JS, and media files
└── README.md
```
---

## 🚀 Getting Started

### 1. Clone the repository

git clone https://github.com/avibaazov/chabot.git
cd chabot

### 2. Install dependencies

pip install -r requirements.txt


### 4. Start the Flask server

python app.py

---

## 🌐 Embedding Your Chatbot

Once your bot is saved, you'll receive a script tag like:

<script src="https://yourdomain.com/generate-bot-script/BOT_ID"></script>

Paste this into your site’s HTML and the bot will appear instantly.

---

