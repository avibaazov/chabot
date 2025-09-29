# Db_Handler.py  (replace entire file)

import os
import pickle
import certifi
from pymongo import MongoClient, errors
from pymongo.server_api import ServerApi
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

# Prefer SRV URI from Atlas, e.g. mongodb+srv://USER:PASS@cluster.mongodb.net/?retryWrites=true&w=majority&appName=MyApp
_MONGO_URI = os.getenv("MONGO_CONNECTION_STRING") or os.getenv("MONGODB_URI")
if not _MONGO_URI:
    raise RuntimeError("Set MONGO_CONNECTION_STRING (or MONGODB_URI) in your environment.")

_DB_NAME = os.getenv("MONGODB_DB", "test")

_client = None
_db = None

def get_db():
    """Create the client on first use and return the DB handle."""
    global _client, _db
    if _db is not None:
        return _db

    _client = MongoClient(
        _MONGO_URI,
        server_api=ServerApi("1"),
        tls=True,                     # safe even if SRV already implies TLS
        tlsCAFile=certifi.where(),    # fixes CA bundle issues on some hosts
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=20000,
        socketTimeoutMS=20000,
        retryWrites=True,
    )
    _db = _client[_DB_NAME]
    return _db

def ping():
    try:
        get_db().command("ping")
        return True
    except errors.PyMongoError as e:
        print(f"DB ping failed: {e}")
        return False

# ---------------- your helpers (now all call get_db() inside) ----------------

def insert_form_doc(user_name, form_data):
    return get_db()[user_name].insert_one(form_data)

def signup(username, password):
    db = get_db()
    if db.users.find_one({'username': username}):
        return {"error": "Username already exists"}, 409
    hashed_password = generate_password_hash(password)
    db.users.insert_one({'username': username, 'password': hashed_password})
    return {"message": "User registered successfully"}, 201

def reset_password(username, new_password):
    db = get_db()
    user = db.users.find_one({'username': username})
    if not user:
        return {"error": "Username does not exist"}, 404
    hashed_password = generate_password_hash(new_password)
    db.users.update_one({'username': username}, {'$set': {'password': hashed_password}})
    return {"message": "Password reset successfully"}, 200

def check_user_credentials(username, password):
    user = get_db().users.find_one({"username": username})
    if user and check_password_hash(user['password'], password):
        return user
    return None

def save_bot_to_database(bot_id, bot_config):
    bots = get_db().bots
    bot_config['_id'] = bot_id
    return bots.insert_one(bot_config)

def get_bot_configuration(bot_id):
    bots = get_db().bots
    fields = {"name": 1, "greeting": 1, "color": 1, "textSize": 1, "avatarURL": 1, "_id": 1}
    return bots.find_one({'_id': bot_id}, fields)

def save_training_form_to_database(bot_id, training_data):
    return get_db().bots.update_one({'_id': bot_id}, {'$set': {'training_forms': training_data}})

def save_training_data_to_database(bot_id, training_data):
    return get_db().bots.update_one({'_id': bot_id}, {'$set': {'training_data': training_data}})

def get_all_user_forms(bot_id):
    bot = get_db().bots.find_one({'_id': bot_id}, {'training_forms': 1})
    return bot.get('training_forms') if bot and 'training_forms' in bot else None

def get_all_user_data(bot_id):
    bot = get_db().bots.find_one({'_id': bot_id})
    if bot is None:
        return None
    training_data = bot.get('training_data', {})
    if 'model_state' in training_data and training_data['model_state'] is None:
        return None
    if training_data.get('model_state'):
        try:
            training_data['model_state'] = pickle.loads(training_data['model_state'])
        except Exception as e:
            print(f"Error deserializing model_state: {e}")
    return training_data

def get_user_bots_ids(session_id):
    coll = get_db()[str(session_id)]
    return [doc.get('bot_reference') for doc in coll.find({}) if 'bot_reference' in doc]

def save_bot_id_to_user(session_id, bot_id):
    return get_db()[str(session_id)].insert_one({'bot_reference': bot_id})

def update_bot_configuration(bot_id, new_config):
    return get_db().bots.update_one({"_id": bot_id}, {"$set": new_config})

def delete_bot_from_database(bot_id, session_id):
    db = get_db()
    try:
        cfg_res = db.bots.delete_one({"_id": bot_id})
        ref_res = db[str(session_id)].delete_one({"bot_reference": bot_id})
        return cfg_res.deleted_count > 0 and ref_res.deleted_count > 0
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
