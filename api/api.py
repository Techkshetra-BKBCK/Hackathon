# api/api.py
from fastapi import FastAPI, File, UploadFile
from pymongo import MongoClient
import base64

app = FastAPI()

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['inventory_db']
inventory_collection = db['inventory']

@app.post("/upload_image")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    image_base64 = base64.b64encode(contents).decode('utf-8')
    
    # Here you would typically call your PyTorch model
    # For now, we'll just simulate an update
    inventory_collection.update_one(
        {"item_id": 1},
        {"$inc": {"quantity": 1}},
        upsert=True
    )
    return {"filename": file.filename, "status": "processed"}

@app.get("/inventory")
async def get_inventory():
    inventory = list(inventory_collection.find({}, {"_id": 0}))
    return inventory