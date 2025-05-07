from functools import wraps
from flask import request, jsonify, session

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "token" not in session:
            return jsonify({"error": "Access denied. Token required."}), 401
        return f(*args, **kwargs)
    return decorated_function
