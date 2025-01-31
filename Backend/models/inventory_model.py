# C:\Users\VIRAJ\Desktop\Hackathon\Backend\models\inventory_model.py

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import io
import base64

class InventoryModel(nn.Module):
    def __init__(self):
        super(InventoryModel, self).__init__()
        # Define your model architecture here
        self.conv1 = nn.Conv2d(3, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)  # Assuming 10 classes of items

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = self.pool(torch.relu(self.conv2(x)))
        x = x.view(-1, 16 * 5 * 5)
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        x = self.fc3(x)
        return x

    def predict(self, image_data):
        # Decode base64 image
        image_data = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_data))
        
        # Preprocess the image
        transform = transforms.Compose([
            transforms.Resize((32, 32)),
            transforms.ToTensor(),
            transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
        ])
        image = transform(image).unsqueeze(0)
        
        # Make prediction
        with torch.no_grad():
            output = self(image)
            _, predicted = torch.max(output, 1)
        
        # Return the predicted class
        return predicted.item()

# Initialize the model
model = InventoryModel()


model.load_state_dict(torch.load('C:/Users/VIRAJ/Desktop/Hackathon/Backend/models/inventory_model.pth'))
model.eval()