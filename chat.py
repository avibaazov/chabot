import Db_Handler
import random
import json
import torch
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

# Set the device to use GPU if available, otherwise fallback to CPU
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Dictionary to hold models for different bots
global_models = {}

# Bot name (can be customized)
bot_name = "Sam"

# Function to load the model and related data for a specific bot
def load_model2(bot_id):
    global global_models
    
    # Get the model data from the database for the specified bot_id
    data = Db_Handler.get_all_user_data(bot_id)
    
    if not data:
        print(f"No training data found for bot_id {bot_id}")
        return

    # Extract necessary information from the loaded data
    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    output_size = data["output_size"]
    all_words = data['all_words']
    tags = data['tags']
    model_state = data["model_state"]

    # Initialize the model and load its state
    model = NeuralNet(input_size, hidden_size, output_size).to(device)
    model.load_state_dict(model_state)
    model.eval()  # Set the model to evaluation mode
    
    # Get the intents data for the bot from the database
    user_data = Db_Handler.get_all_user_forms(bot_id)
    intents = user_data
    
    # Store the model and related data in the global dictionary
    global_models[bot_id] = {'model': model, 'all_words': all_words, 'tags': tags, 'intents': intents}
    
# Function to get a response from a specific bot model based on user input
def get_response2(msg, bot_id):
    if bot_id not in global_models:
        return "Bot model not loaded or does not exist."

    # Retrieve the model and related data for the specified bot_id
    model, all_words, tags, intents = (global_models[bot_id][key] for key in ['model', 'all_words', 'tags', 'intents'])
    
    # Tokenize the user message
    sentence = tokenize(msg)
    # Convert the tokenized sentence into a bag of words vector
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    # Get the model's output for the input message
    output = model(X)
    _, predicted = torch.max(output, dim=1)

    # Get the tag corresponding to the highest predicted score
    tag = tags[predicted.item()]
    
    # Get the softmax probabilities for the output
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    # If the model's confidence is high enough, return a random response from the matched intent
    if intents is not None:  
        if prob.item() > 0.75:
            for intent in intents:
                if tag == intent["tag"]:
                    print(intent["tag"]) 
                    return random.choice(intent['responses'])
    
    # If no intent matches or confidence is too low, return a fallback response
    return "I do not understand..."
