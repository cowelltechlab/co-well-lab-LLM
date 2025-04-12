from pymongo import MongoClient
from bson.objectid import ObjectId
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/")  # assuming docker-compose service is 'mongo'
client = MongoClient(MONGO_URI)
db = client["cover_letter_app"]
collection = db["sessions"]

def create_session(data):
    result = collection.insert_one(data)
    return str(result.inserted_id)

def update_session(session_id, update_fields):
    collection.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": update_fields}
    )

def get_session(session_id):
    return collection.find_one({"_id": ObjectId(session_id)})
