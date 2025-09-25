import os
import uuid
from flask import Flask, request, jsonify, Response
from flask import session
from chat import  load_model2, get_response2
from flask_cors import CORS
import json
from train import train_model2
from dotenv import load_dotenv
import Db_Handler 
import chatWidgetLoader
import googlemaps

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # Use secret key from environment variables
# gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))  # Initialize Google Maps client with API key

CORS(app, resources={r"/predict": {"origins": "*"}})
CORS(app, supports_credentials=True)

# Function to get business information using Google Maps API
def get_business_info(business_name):
    # Log the business name being searched
    print(f"Searching for business: {business_name}")
    
    # Search for the business
    places_result = gmaps.places(query=business_name)
    
    if places_result['status'] == 'OK' and places_result['results']:
        place_id = places_result['results'][0]['place_id']
        place_details = gmaps.place(place_id=place_id)
        
        if place_details['status'] == 'OK':
            result = place_details['result']
            opening_hours = result.get('opening_hours', {}).get('weekday_text', [])
            business_info = {
                "name": result.get('name'),
                "address": result.get('formatted_address'),
                "phone": result.get('formatted_phone_number'),
                "rating": result.get('rating'),
                "opening_hours": opening_hours,
                "website": result.get('website'),
                "maps_url": result.get('url'),
                "reviews_url": f"https://search.google.com/local/reviews?placeid={place_id}"
            }
            return business_info
    return None

# Endpoint to fetch business information
@app.post("/business-info")
def business_info():
    bot_name = request.get_json().get("bot_name")
    print(f"Received request for bot_name: {bot_name}")  # Log the bot name received
    info = get_business_info(bot_name)
    if info:
        return jsonify(info)
    else:
        print("Business not found")  # Log that the business was not found
        return jsonify({"error": "Business not found"}), 404

# Endpoint to get chatbot response
# @app.post("/predict")
# def predict():
#     bot_id = request.get_json().get("bot_id")
#     print(bot_id)
#     text = request.get_json().get("message")
#     response = get_response(text)
#     message = {"answer": response}
#     return jsonify(message)

# Endpoint to get chatbot response based on bot_id
@app.post("/predict/<bot_id>")
def predict2(bot_id: str):
    text = request.get_json().get("message")
    response = get_response2(text, bot_id)
    message = {"answer": response}
    return jsonify(message)

# Endpoint to register a new user
@app.route('/signup', methods=['POST'])
def register_user():
    username = request.json['username']
    password = request.json['password']
    return Db_Handler.signup(username, password)

# Endpoint to reset user password
@app.route('/resetPassword', methods=['POST'])
def reset_password():
    username = request.json['username']
    password = request.json['password']
    return Db_Handler.reset_password(username, password)

# Endpoint to log in a user
@app.route('/login', methods=['POST'])
def login2():
    username = request.json.get('username')
    password = request.json.get('password')
    user = Db_Handler.check_user_credentials(username, password)
   
    if user:
        session['user_id'] = str(user['_id'])  # Store user ID in the session
        print("under here")
        print(session['user_id'])
        
        id_list = Db_Handler.get_user_bots_ids(session['user_id'])
       
        for bot_id in id_list:
            load_model2(bot_id)
        
        return jsonify({"message": "Login successful"})
    else:
        return jsonify({"error": "Invalid credentials"}), 401

# Endpoint to log out a user
@app.route('/logout', methods=['POST'])
def logout():
    print("Logout endpoint hit")  # This should log whenever the endpoint is accessed
    session.pop('user_id', None)
    
    if 'user_id' not in session:
        print("user_id successfully removed from session.")
        return jsonify({"message": "Logout successful"})
    else:
        print("Failed to remove user_id from session.")
        return jsonify({"error": "Logout failed"}), 500

# Endpoint to save form data for a specific bot
@app.post("/save-form-data/<bot_id>")
def save_form_data2(bot_id: str):
    data_form = request.json
    user_name = session.get('user_id')

    if user_name is None:
        return jsonify({"error": "Unauthorized - User not logged in"}), 401

    if isinstance(data_form, list):
        # Directly update the training data for the bot
        result = Db_Handler.save_training_form_to_database(bot_id, data_form)
        user_data = Db_Handler.get_all_user_forms(bot_id)
        train_model2(user_data, bot_id)
        load_model2(bot_id)
        return jsonify({"message": "Training data updated successfully"})
    else:
        return jsonify({"error": "Invalid data format"}), 400

# Endpoint to generate bot script
@app.route('/generate-bot-script/<bot_id>')
def generate_bot_script(bot_id):
    bot_config = Db_Handler.get_bot_configuration(bot_id)
    js_code = generate_bot_js(bot_config)
    return Response(js_code, mimetype='application/javascript')

# Function to generate JavaScript for the bot
def generate_bot_js(bot_config):
    bot_id = bot_config.get("_id")
    print(bot_id)
    name = bot_config.get('name')
    greeting = bot_config.get('greeting')
    color = bot_config.get('color')
    textSize = bot_config.get('textSize')
    avatarURL = bot_config.get('avatarURL')
    js_template = chatWidgetLoader.create_template(bot_id, name, greeting, color, textSize, avatarURL)
    return js_template

# Endpoint to get bot script tag
@app.route('/get-bot-script-tag', methods=['POST'])
def get_bot_script_tag():
    bot_id = request.json.get('bot_id')
    base_url = os.getenv('BASE_URL', 'http://127.0.0.1:5000')
    script_tag = f'<script src="{base_url}/generate-bot-script/{bot_id}"></script>'
    return jsonify({'script_tag': script_tag})

# Endpoint to create a new bot
@app.route('/create-bot', methods=['POST'])
def create_bot():
    bot_config = request.json.get('configuration')
    bot_id = str(uuid.uuid4())
    res = Db_Handler.save_bot_to_database(bot_id, bot_config)
    print(res)
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({"error": "User not logged in"}), 401
    print(session['user_id'])
    Db_Handler.save_bot_id_to_user(session['user_id'], bot_id)
    return jsonify({"bot_id": bot_id})

# Endpoint to delete a bot
@app.route('/delete-bot/<bot_id>', methods=['DELETE'])
def delete_bot(bot_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized access"}), 401

    result = Db_Handler.delete_bot_from_database(bot_id, session['user_id'])
    if result:
        return jsonify({"message": "Bot deleted successfully"}), 200
    else:
        return jsonify({"error": "Bot could not be deleted"}), 400

# Endpoint to get all bots associated with a user
@app.route('/get-user-bots', methods=['GET'])
def get_user_bots():
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({"error": "User not logged in"}), 401
    bot_ids = Db_Handler.get_user_bots_ids(user_id)
    info = [Db_Handler.get_bot_configuration(bot_id) for bot_id in bot_ids]
    return jsonify(info)

# Endpoint to get the configuration of a specific bot
@app.route('/get-bot-configuration/<bot_id>', methods=['GET'])
def get_bot_configuration(bot_id):
    bot_config = Db_Handler.get_bot_configuration(bot_id)
    return jsonify(bot_config)

# Endpoint to update the configuration of a specific bot
@app.route('/update-bot-config/<bot_id>', methods=['PUT'])
def update_bot_config(bot_id):
    new_config = request.json
    if not new_config:
        return jsonify({"error": "No configuration data provided"}), 400

    try:
        update_result = Db_Handler.update_bot_configuration(bot_id, new_config)
        if update_result.modified_count > 0:
            return jsonify({"message": "Bot configuration updated successfully"}), 200
        else:
            return jsonify({"error": "No updates made to the bot configuration"}), 404

    except Exception as e:
        # If something went wrong, log it and return an error message
        app.logger.error(f"Error updating bot configuration: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/get-existing-training-data/<bot_id>', methods=['GET'])
def get_existing_training_data(bot_id):
    try:
        # Assuming our bots are stored in a collection named 'bots'
        # and each bot has a 'training_data' field
        user_data=Db_Handler.get_all_user_forms(bot_id)
        if user_data:
            # If training data exists, return it
            return jsonify({'trainingData': user_data}), 200
        else:
            # If no training data is found for the bot
            return jsonify({'trainingData':[]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000))) 
