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

def mark_token_used(token, session_id=None):
    update_fields = {
        "used": True,
        "used_at": datetime.now(timezone.utc)
    }
    if session_id:
        update_fields["session_id"] = session_id
    
    db["tokens"].update_one(
        {"token": token},
        {"$set": update_fields}
    )

def is_valid_token(token: str) -> bool:
    entry = db["tokens"].find_one({
        "token": token, 
        "used": False,
        "$or": [
            {"invalidated": {"$exists": False}},
            {"invalidated": False}
        ]
    })
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

def get_all_tokens():
    try:
        # Only get tokens that haven't been invalidated
        tokens = list(db["tokens"].find({"invalidated": {"$ne": True}}).sort("created_at", -1))
        for token in tokens:
            token["_id"] = str(token["_id"])
            if isinstance(token.get("created_at"), datetime):
                token["created_at"] = token["created_at"].isoformat()
            if isinstance(token.get("used_at"), datetime):
                token["used_at"] = token["used_at"].isoformat()
        return tokens
    except Exception as e:
        print("Mongo fetch error:", e)
        return []

def invalidate_token(token_str):
    try:
        result = db["tokens"].update_one(
            {"token": token_str},
            {"$set": {
                "invalidated": True,
                "invalidated_at": datetime.now(timezone.utc)
            }}
        )
        return result.modified_count > 0
    except Exception as e:
        print("Mongo update error:", e)
        return False