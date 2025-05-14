import os
import pickle
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables from a .env file if it exists
load_dotenv()

# Get the MongoDB connection string from the environment variable
connection_string = os.getenv("MONGO_CONNECTION_STRING")
if not connection_string:
    raise ValueError("No MONGO_CONNECTION_STRING set for the application. Please set it in your environment variables.")

client = MongoClient(connection_string)
db = client.test

collections = db.list_collection_names()
#print(collections)

# Inserts a document (form data) into a user's collection
def insert_form_doc(user_name, form_data):
    user_collection = db[user_name]
    result = user_collection.insert_one(form_data)
    return result

# Registers a new user with a username and password
def signup(username, password):
    if db.users.find_one({'username': username}):
        return {"error": "Username already exists"}, 409

    hashed_password = generate_password_hash(password)
    db.users.insert_one({'username': username, 'password': hashed_password})
    return {"message": "User registered successfully"}, 201

# Resets a user's password
def reset_password(username, new_password):
    user = db.users.find_one({'username': username})
    if not user:
        return {"error": "Username does not exist"}, 404

    hashed_password = generate_password_hash(new_password)
    db.users.update_one({'username': username}, {'$set': {'password': hashed_password}})
    return {"message": "Password reset successfully"}, 200

# Checks if user credentials are valid
def check_user_credentials(username, password):
    user = db.users.find_one({"username": username})
    if user and check_password_hash(user['password'], password):
        return user
    else:
        return None

# Saves a bot's configuration to the database
def save_bot_to_database(bot_id, bot_config):
    bots_collection = db.bots
    bot_config['_id'] = bot_id
    result = bots_collection.insert_one(bot_config)
    return result

# Retrieves a bot's configuration from the database
def get_bot_configuration(bot_id):
    bots_collection = db.bots
    fields_to_include = {"name": 1, "greeting": 1, "color": 1, "textSize": 1, "avatarURL": 1, "_id": 1}
    bot_config = bots_collection.find_one({'_id': bot_id}, fields_to_include)
    return bot_config

# Saves training form data for a bot
def save_training_form_to_database(bot_id, training_data):
    bots_collection = db.bots
    result = bots_collection.update_one(
        {'_id': bot_id}, 
        {'$set': {'training_forms': training_data}}
    )
    return result

# Saves training data for a bot
def save_training_data_to_database(bot_id, training_data):
    bots_collection = db.bots
    result = bots_collection.update_one(
        {'_id': bot_id}, 
        {'$set': {'training_data': training_data}}
    )
    return result

# Retrieves all training forms for a bot
def get_all_user_forms(bot_id):
    bots_collection = db.bots
    bot_data = bots_collection.find_one({'_id': bot_id}, {'training_forms': 1})
    if bot_data and 'training_forms' in bot_data:
        return bot_data['training_forms']
    else:
        return None

# Retrieves all training data for a bot
def get_all_user_data(bot_id):
    bots_collection = db.bots
    bot_data = bots_collection.find_one({'_id': bot_id})
    if bot_data is None:
        return None

    training_data = bot_data.get('training_data', {})
    if 'model_state' in training_data and training_data['model_state'] is None:
        return
    
    if 'model_state' in training_data and training_data['model_state']:
        try:
            bytes_data = training_data['model_state']
            model_state = pickle.loads(bytes_data)
            training_data['model_state'] = model_state
        except Exception as e:
            print(f"Error deserializing model_state: {e}")

    return training_data

# Retrieves all bot IDs associated with a user session
def get_user_bots_ids(session_id):
    bots_collection = db[str(session_id)]
    all_docs = bots_collection.find({})
    list_of_bot_ids = [doc['bot_reference'] for doc in all_docs if 'bot_reference' in doc]
    return list_of_bot_ids

# Saves a bot ID to a user's collection
def save_bot_id_to_user(session_id, bot_id):
    bots_collection = db[str(session_id)]
    result = bots_collection.insert_one({'bot_reference': bot_id})
    return result

# Updates a bot's configuration in the database
def update_bot_configuration(bot_id, new_config):
    bots_collection = db.bots
    result = bots_collection.update_one(
        {"_id": bot_id},
        {"$set": new_config}
    )
    return result

# Deletes a bot from the database
def delete_bot_from_database(bot_id, session_id):
    try:
        bots_collection = db.bots
        bot_config_result = bots_collection.delete_one({"_id": bot_id})

        bots_collection_per_account = db[str(session_id)]
        bot_ref_result = bots_collection_per_account.delete_one({"bot_reference": bot_id})

        if bot_config_result.deleted_count > 0 and bot_ref_result.deleted_count > 0:
            print(f"Bot config and reference for bot ID {bot_id} deleted successfully.")
            return True
        else:
            if bot_config_result.deleted_count == 0:
                print(f"No bot config found for bot ID {bot_id}.")
            if bot_ref_result.deleted_count == 0:
                print(f"No bot reference found for bot ID {bot_id} in user collection {session_id}.")
            return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
