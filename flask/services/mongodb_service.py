import os
from datetime import datetime, timezone
from pymongo import MongoClient
from bson.objectid import ObjectId

def flatten_dict(d, parent_key="", sep="_"):
    """Recursively flattens nested dictionaries for CSV export."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

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

# Prompt Management Functions
def get_active_prompt(prompt_type):
    """Get the active prompt for a given type."""
    try:
        prompt = db["prompts"].find_one({
            "promptType": prompt_type,
            "isActive": True
        })
        return prompt
    except Exception as e:
        print(f"Error fetching active prompt for {prompt_type}:", e)
        return None

def get_active_prompt_with_version(prompt_type):
    """Get the active prompt for a given type with version info."""
    try:
        prompt = db["prompts"].find_one({
            "promptType": prompt_type,
            "isActive": True
        })
        if prompt:
            return {
                "content": prompt["content"],
                "version": prompt["version"],
                "prompt_type": prompt["promptType"]
            }
        return None
    except Exception as e:
        print(f"Error fetching active prompt for {prompt_type}:", e)
        return None

def create_prompt(prompt_type, content, modified_by="system"):
    """Create a new prompt version."""
    try:
        # Get the current highest version number
        latest = db["prompts"].find_one(
            {"promptType": prompt_type},
            sort=[("version", -1)]
        )
        next_version = (latest["version"] + 1) if latest else 1
        
        # Deactivate previous versions
        db["prompts"].update_many(
            {"promptType": prompt_type},
            {"$set": {"isActive": False}}
        )
        
        # Create new version
        prompt_doc = {
            "promptType": prompt_type,
            "content": content,
            "version": next_version,
            "createdAt": datetime.now(timezone.utc),
            "modifiedBy": modified_by,
            "isActive": True
        }
        
        result = db["prompts"].insert_one(prompt_doc)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error creating prompt for {prompt_type}:", e)
        return None

def get_all_prompts():
    """Get all active prompts."""
    try:
        prompts = list(db["prompts"].find({"isActive": True}))
        for prompt in prompts:
            prompt["_id"] = str(prompt["_id"])
            if isinstance(prompt.get("createdAt"), datetime):
                prompt["createdAt"] = prompt["createdAt"].isoformat()
        return prompts
    except Exception as e:
        print("Error fetching all prompts:", e)
        return []

def get_prompt_history(prompt_type):
    """Get version history for a specific prompt type."""
    try:
        history = list(db["prompts"].find(
            {"promptType": prompt_type}
        ).sort("version", -1))
        
        for prompt in history:
            prompt["_id"] = str(prompt["_id"])
            if isinstance(prompt.get("createdAt"), datetime):
                prompt["createdAt"] = prompt["createdAt"].isoformat()
        return history
    except Exception as e:
        print(f"Error fetching prompt history for {prompt_type}:", e)
        return []

def update_prompt(prompt_type, content, modified_by="admin"):
    """Update a prompt, creating a new version."""
    return create_prompt(prompt_type, content, modified_by)

def revert_prompt(prompt_type, target_version, modified_by="admin"):
    """Revert to a specific version by reactivating it."""
    try:
        # First, deactivate all versions of this prompt type
        db["prompts"].update_many(
            {"promptType": prompt_type},
            {"$set": {"isActive": False}}
        )
        
        # Then reactivate the target version
        result = db["prompts"].update_one(
            {"promptType": prompt_type, "version": target_version},
            {"$set": {"isActive": True}}
        )
        
        if result.modified_count > 0:
            return True
        else:
            print(f"No prompt found with type {prompt_type} and version {target_version}")
            return False
            
    except Exception as e:
        print(f"Error reverting prompt {prompt_type} to version {target_version}:", e)
        return False

def initialize_default_prompts():
    """Initialize default prompts if they don't exist."""
    default_prompts = {
        "control": """Based on the following resume and job description, generate a professional profile statement (1-2 paragraphs) that highlights relevant experience and skills. Focus on creating a compelling narrative that connects the candidate's background to the specific role requirements.

Variables available:
- {resume} - User's resume content
- {jobDescription} - Target job description

Generate a profile that sounds professional and polished, representing how an AI would typically interpret and present this candidate's qualifications.""",

        "bse_generation": """Generate 3 bullet points from this resume that demonstrate self-efficacy experiences relevant to this job. Focus on Bandura's Self-Efficacy theory components:

1. Mastery experiences (successful performance accomplishments)
2. Vicarious experiences (observing others succeed) 
3. Verbal persuasion (encouragement from others)

For each bullet:
- Extract specific achievements from the resume
- Connect to job requirements
- Include quantifiable results when possible
- Provide rationale explaining the BSE theory connection

Variables available:
- {resume} - User's resume content
- {jobDescription} - Target job description

Return your response as JSON in this exact format:

```json
{{
  "bullets": [
    {{
      "text": "Bullet point text here",
      "rationale": "Explanation of how this demonstrates self-efficacy theory"
    }},
    {{
      "text": "Second bullet point text", 
      "rationale": "Explanation for second bullet"
    }},
    {{
      "text": "Third bullet point text",
      "rationale": "Explanation for third bullet"
    }}
  ]
}}
```

Resume:
{resume}

Job Description:
{jobDescription}""",

        "regeneration": """The user rated this bullet {rating}/7 and provided this feedback: '{feedback}'. 

Revise the bullet to better represent their self-concept while maintaining BSE theory focus. Consider:
- User's specific feedback and concerns
- Previous iteration history to avoid repetition
- Maintaining connection to job requirements
- Preserving self-efficacy theory elements

Current bullet: "{bulletText}"
Current rationale: "{rationale}"

{iterationHistory}

Return your response as JSON in this exact format:

```json
{{
  "bullet": {{
    "text": "Revised bullet point text that addresses user feedback",
    "rationale": "Updated rationale explaining how this better represents the user while maintaining BSE theory focus"
  }}
}}
```

Generate an improved bullet that addresses the user's feedback while staying true to their authentic self-representation.""",

        "final_synthesis": """Create a final professional profile using the refined bullets and user feedback from the collaborative alignment process. 

Synthesize the iterative refinement into an authentic representation that:
- Incorporates insights from all bullet iterations
- Reflects user's self-concept as revealed through feedback
- Maintains professional tone while honoring user's voice
- Connects to the target job requirements
- Demonstrates the collaborative human-AI process

Variables available:
- {finalBullets} - User's refined bullet points
- {allFeedback} - Complete feedback history
- {originalProfile} - Initial control profile
- {jobDescription} - Target job description

Generate a profile that feels authentic to the user while professionally presenting their qualifications for this role."""
    }
    
    try:
        for prompt_type, content in default_prompts.items():
            existing = db["prompts"].find_one({"promptType": prompt_type})
            if not existing:
                create_prompt(prompt_type, content, "system")
                print(f"Initialized default prompt for {prompt_type}")
        return True
    except Exception as e:
        print("Error initializing default prompts:", e)
        return False