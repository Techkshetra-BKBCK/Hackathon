from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
import torch
from torchvision import transforms
from PIL import Image
import io
import os
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app)

# MongoDB connection
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['inventory_db']
    inventory_collection = db['inventory']
except Exception as e:
    print(f"MongoDB connection error: {e}")

# Mock AI model class (replace with your actual model)
class InventoryAIModel:
    def __init__(self):
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
        ])
    
    def process_image(self, image):
        # Mock processing - replace with actual AI logic
        return {
            'detected_items': [
                {'name': 'Item 1', 'quantity': 10},
                {'name': 'Item 2', 'quantity': 15}
            ]
        }

ai_model = InventoryAIModel()

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Send initial data
    send_inventory_update()

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('request_data')
def handle_data_request():
    send_inventory_update()

@socketio.on('change_user_type')
def handle_user_change(user_type):
    print(f'User type changed to: {user_type}')
    send_inventory_update()

@app.route('/upload-inventory', methods=['POST'])
def upload_inventory():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file'}), 400

        file = request.files['image']
        image = Image.open(io.BytesIO(file.read()))
        
        # Process image with AI model
        results = ai_model.process_image(image)
        
        # Update inventory in database
        update_inventory(results['detected_items'])
        
        # Emit update to all clients
        send_inventory_update()
        
        return jsonify({'success': True, 'message': 'Inventory updated'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_inventory(items):
    """Update inventory in MongoDB"""
    for item in items:
        inventory_collection.update_one(
            {'name': item['name']},
            {
                '$set': {
                    'stock': item['quantity'],
                    'last_updated': datetime.now(),
                    'status': get_stock_status(item['quantity'])
                }
            },
            upsert=True
        )

def get_stock_status(quantity):
    """Determine stock status based on quantity"""
    if quantity < 5:
        return 'Low Stock'
    elif quantity > 20:
        return 'Overstocked'
    return 'Normal'

def send_inventory_update():
    """Send inventory update to all connected clients"""
    try:
        # Get inventory data from MongoDB
        items = list(inventory_collection.find({}, {'_id': 0}))
        
        # Calculate statistics
        total_items = len(items)
        low_stock = sum(1 for item in items if item.get('status') == 'Low Stock')
        overstock = sum(1 for item in items if item.get('status') == 'Overstocked')
        
        # Prepare chart data
        labels = [item['name'] for item in items]
        values = [item['stock'] for item in items]
        
        data = {
            'totalItems': total_items,
            'lowStockItems': low_stock,
            'overStockItems': overstock,
            'labels': labels,
            'values': values,
            'items': [{
                'name': item['name'],
                'stock': item['stock'],
                'status': item['status'],
                'lastUpdated': item['last_updated'].strftime('%Y-%m-%d %H:%M:%S')
            } for item in items]
        }
        
        socketio.emit('inventory_update', data)
        
        # Send alerts for low stock items
        for item in items:
            if item['status'] == 'Low Stock':
                socketio.emit('stock_alert', {
                    'message': f"Low stock alert: {item['name']} ({item['stock']} remaining)"
                })
    
    except Exception as e:
        print(f"Error sending inventory update: {e}")

if __name__ == '__main__':
    socketio.run(app, debug=True) 