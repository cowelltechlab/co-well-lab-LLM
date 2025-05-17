import os
from datetime import datetime, timezone
from pymongo import MongoClient
from bson.objectid import ObjectId
from utils.flatten import flatten_dict

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
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

        for section_key, bullets in feedback_payload.items():
            for bp_key, values in bullets.items():

                rating = values.get("rating") if isinstance(values, dict) else None
                qualitative = values.get("qualitative") if isinstance(values, dict) else None

                if rating is not None:
                    update_fields[f"{section_key}.{bp_key}.rating"] = rating
                if qualitative is not None:
                    update_fields[f"{section_key}.{bp_key}.qualitative"] = qualitative

        if not update_fields:
            return None

        result = collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": update_fields}
        )

        return result
    except Exception as e:
        print("Mongo update error:", e)
        return None

def get_session(session_id):
    return collection.find_one({"_id": ObjectId(session_id)})

def set_fields(doc_id, fields: dict):
    try:
        result = collection.update_one(
            {"_id": ObjectId(doc_id)},
            {"$set": fields}
        )
        return result
    except Exception as e:
        print("Mongo update error:", e)
        return None

def get_all_sessions():
    try:
        sessions = list(collection.find())
        flattened_sessions = []

        for s in sessions:
            # Extract timestamp from ObjectId in ISO 8601 format
            creation_timestamp = s["_id"].generation_time
            s["timestamp"] = creation_timestamp.isoformat()
            
            s["document_id"] = str(s["_id"])
            del s["_id"]
            flat = flatten_dict(s)
            flattened_sessions.append(flat)

        return flattened_sessions
    except Exception as e:
        print("Mongo fetch error:", e)
        return []

def create_token(token_str):
    return db["tokens"].insert_one({
        "token": token_str,
        "used": False,
        "created_at": datetime.now(timezone.utc),
        "session_id": None
    })

def validate_token(token_str):
    return db["tokens"].find_one({"token": token_str, "used": False})

def mark_token_used(token):
    db["tokens"].update_one(
        {"token": token},
        {"$set": {
            "used": True,
            "used_at": datetime.now(timezone.utc)
        }}
    )

def is_valid_token(token: str) -> bool:
    entry = db["tokens"].find_one({"token": token, "used": False})
    return entry is not None

def get_all_progress_events():
    try:
        events = list(db["progress_log"].find().sort("timestamp", -1))
        for event in events:
            event["_id"] = str(event["_id"])  # optional
            if isinstance(event["timestamp"], datetime):
                event["timestamp"] = event["timestamp"].isoformat()
        return events
    except Exception as e:
        print("Mongo fetch error:", e)
        return []

def log_progress_event(event_name, session_id=None):
    log_entry = {
        "event_name": event_name,
        "timestamp": datetime.now(timezone.utc),
    }
    if session_id:
        log_entry["session_id"] = session_id

    return db["progress_log"].insert_one(log_entry)