# backend/utils/database.py
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['inventory_db']
inventory_collection = db['inventory']

def get_inventory():
    return list(inventory_collection.find({}, {"_id": 0}))

def update_inventory(item_id):
    inventory_collection.update_one(
        {"item_id": item_id},
        {"$inc": {"quantity": 1}},
        upsert=True
    )