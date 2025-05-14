import torch
import torch.nn as nn

# Define a neural network class
class NeuralNet(nn.Module):
    # Initialize the neural network
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuralNet, self).__init__()
        # Define the first fully connected layer with input size and hidden size
        self.l1 = nn.Linear(input_size, hidden_size) 
        # Define the second fully connected layer with hidden size and hidden size
        self.l2 = nn.Linear(hidden_size, hidden_size) 
        # Define the third fully connected layer with hidden size and number of classes
        self.l3 = nn.Linear(hidden_size, num_classes)
        # Define the ReLU activation function
        self.relu = nn.ReLU()
    
    # Define the forward pass
    def forward(self, x):
        # Pass the input through the first layer and apply ReLU activation
        out = self.l1(x)
        out = self.relu(out)
        # Pass the result through the second layer and apply ReLU activation
        out = self.l2(out)
        out = self.relu(out)
        # Pass the result through the third layer
        out = self.l3(out)
        # No activation function and no softmax at the end because we'll use a loss function that applies it
        return out
