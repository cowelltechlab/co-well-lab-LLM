from functools import wraps
from flask import jsonify, session
from services.mongodb_service import db

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "token" not in session:
            return jsonify({"error": "Access denied. Token required."}), 401
        
        # Check if token is still valid (not invalidated)
        token = session["token"]
        token_doc = db["tokens"].find_one({"token": token})
        
        if not token_doc or token_doc.get("invalidated", False):
            session.pop("token", None)  # Clear the invalid token from session
            return jsonify({"error": "Token has been invalidated."}), 401
            
        return f(*args, **kwargs)
    return decorated_function
