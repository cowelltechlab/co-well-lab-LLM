from pymongo import MongoClient
from bson.objectid import ObjectId
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/")  # assuming docker-compose service is 'mongo'
client = MongoClient(MONGO_URI)
db = client["cover_letter_app"]
collection = db["sessions"]

def create_session(data):
    result = collection.insert_one(data)
    print(f"Started session: {result.inserted_id}")
    return str(result.inserted_id)

def update_session(doc_id, update_data):
    try:
        result = collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_data}
        )
        print(f"Updated session: {doc_id}")
        return result
    except Exception as e:
        print("Mongo update error:", e)
        return None

def get_session(session_id):
    return collection.find_one({"_id": ObjectId(session_id)})
