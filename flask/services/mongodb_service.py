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

def update_session(doc_id, feedback_payload):
    try:
        update_fields = {}
        print("Walking through payload...")

        for section_key, bullets in feedback_payload.items():
            print(f"Section: {section_key}")
            for bp_key, values in bullets.items():
                print(f"  Bullet: {bp_key}, values: {values} (type: {type(values)})")

                rating = values.get("rating") if isinstance(values, dict) else None
                qualitative = values.get("qualitative") if isinstance(values, dict) else None

                if rating is not None:
                    update_fields[f"{section_key}.{bp_key}.rating"] = rating
                if qualitative is not None:
                    update_fields[f"{section_key}.{bp_key}.qualitative"] = qualitative

        if not update_fields:
            print("No valid feedback to update.")
            return None

        print(f"Final update_fields: {update_fields}")
        result = collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_fields}
        )

        print(f"Updated document {doc_id}")
        return result
    except Exception as e:
        print("Mongo update error:", e)
        return None



def get_session(session_id):
    return collection.find_one({"_id": ObjectId(session_id)})
