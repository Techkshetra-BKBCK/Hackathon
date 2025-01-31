from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['inventory_db']
inventory_collection = db['inventory']

# Initial sample data
initial_items = [
    {
        'name': 'Product A',
        'stock': 15,
        'status': 'Normal',
        'last_updated': datetime.now()
    },
    {
        'name': 'Product B',
        'stock': 3,
        'status': 'Low Stock',
        'last_updated': datetime.now()
    },
    {
        'name': 'Product C',
        'stock': 25,
        'status': 'Overstocked',
        'last_updated': datetime.now()
    }
]

# Insert initial data
inventory_collection.delete_many({})  # Clear existing data
inventory_collection.insert_many(initial_items)

print("Database initialized with sample data!") 