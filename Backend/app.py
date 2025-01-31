# C:\Users\VIRAJ\Desktop\Hackathon\Backend\app.py

from flask import Flask, render_template
from flask_socketio import SocketIO
from models.inventory_model import InventoryModel, model
from utils.database import get_inventory, update_inventory

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('image')
def handle_image(image_data):
    # Process the image using your PyTorch model
    try:
        result = model.predict(image_data)
    except Exception as e:
        print(f"Error predicting image: {e}")
        result = 1  # Default to item_id 1 if prediction fails
    
    # Update inventory in the database
    update_inventory(result)
    
    # Emit the result back to the client
    socketio.emit('inventory_update', {'result': result})

@socketio.on('get_inventory')
def handle_get_inventory():
    inventory = get_inventory()
    socketio.emit('inventory_data', inventory)

if __name__ == '__main__':
    socketio.run(app, debug=True)