import csv
import io
import requests
import random
import string
from flask import make_response
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required

from models.admin_user import AdminUser

from services.mongodb_service import get_all_sessions
from services.mongodb_service import create_token
from services.mongodb_service import collection
from services.mongodb_service import get_all_progress_events
from services.mongodb_service import get_all_tokens
from services.mongodb_service import invalidate_token
from services.mongodb_service import get_all_prompts, get_prompt_history, update_prompt, create_prompt, revert_prompt

from services.openai_service import llmchat
from services.openai_service import check_openai_health

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/login", methods=["POST"])
def login():
    print("🔐 Admin login endpoint called")
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username == "admin":
        user = AdminUser("admin")
        if user.check_password(password):
            login_user(user)
            return jsonify({"status": "logged_in"}), 200

    return jsonify({"error": "Unauthorized"}), 401


@admin_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"status": "logged_out"}), 200

@admin_bp.route("/sessions/export", methods=["GET"])
@login_required
def export_sessions_csv():
    sessions = get_all_sessions()
    if not sessions:
        return jsonify({"error": "No sessions found"}), 404

    # Step 1: Build the full set of all keys used in any session
    all_keys = set()
    for s in sessions:
        all_keys.update(s.keys())
    
    # Step 2: Define column order with timestamp and document_id first
    primary_columns = ["timestamp", "document_id"]
    # Filter out primary columns from other keys and sort the rest
    other_columns = sorted([k for k in all_keys if k not in primary_columns])
    fieldnames = primary_columns + other_columns

    # Step 3: Write the CSV
    si = io.StringIO()
    writer = csv.DictWriter(si, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(sessions)

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=sessions.csv"
    output.headers["Content-Type"] = "text/csv"
    return output



@admin_bp.route("/health", methods=["GET"])
@login_required
def health_check():
    health = {
        "frontend": "ok",
        "backend": "ok",
        "database": "ok",
        "openai": "ok",
    }

    # MongoDB
    try:
        collection.estimated_document_count()
    except Exception as e:
        print("MongoDB health check failed:", e)
        health["database"] = "error"

    # Azure OpenAI
    try:
        response = llmchat.invoke("ping")
        if not response.content.strip():
            health["openai"] = "error"
    except Exception as e:
        print("Azure OpenAI health check failed:", e)
        health["openai"] = "error"

    # Frontend
    try:
        res = requests.get("https://letterlab.me", timeout=2)  # 🔁 Adjust for prod
        if res.status_code != 200 or "text/html" not in res.headers.get("Content-Type", ""):
            health["frontend"] = "error"
    except Exception as e:
        print("Frontend health check failed:", e)
        health["frontend"] = "error"

    return jsonify(health), 200

def generate_token():
    letters = ''.join(random.choices(string.ascii_lowercase, k=3))
    digits = ''.join(random.choices(string.digits, k=3))
    return letters + digits

@admin_bp.route("/tokens/create", methods=["POST"])
@login_required
def create_token_endpoint():
    token = generate_token()
    if not token:
        return jsonify({"error": "Invalid token"}), 400
    create_token(token)
    return jsonify({"status": "created", "token": token})

@admin_bp.route("/progress-log", methods=["GET"])
@login_required
def get_progress_log():
    try:
        events = get_all_progress_events()
        completed_count = collection.count_documents({"completed": True})
        return jsonify({"events": events, "completed": completed_count}), 200
    except Exception as e:
        print("Error fetching progress log:", e)
        return jsonify({"error": "Failed to fetch progress log"}), 500

@admin_bp.route("/tokens", methods=["GET"])
@login_required
def get_tokens():
    try:
        tokens = get_all_tokens()
        return jsonify({"tokens": tokens}), 200
    except Exception as e:
        print("Error fetching tokens:", e)
        return jsonify({"error": "Failed to fetch tokens"}), 500

@admin_bp.route("/tokens/invalidate", methods=["POST"])
@login_required
def invalidate_token_endpoint():
    try:
        data = request.get_json()
        token = data.get("token")
        if not token:
            return jsonify({"error": "Token required"}), 400
        
        success = invalidate_token(token)
        if success:
            return jsonify({"status": "invalidated"}), 200
        else:
            return jsonify({"error": "Failed to invalidate token"}), 500
    except Exception as e:
        print("Error invalidating token:", e)
        return jsonify({"error": "Failed to invalidate token"}), 500

# Prompt Management Endpoints

@admin_bp.route("/prompts", methods=["GET"])
@login_required
def get_prompts():
    """Get all prompts with version history."""
    try:
        prompts = get_all_prompts()
        return jsonify({"prompts": prompts}), 200
    except Exception as e:
        print("Error fetching prompts:", e)
        return jsonify({"error": "Failed to fetch prompts"}), 500

@admin_bp.route("/prompts/<prompt_type>/history", methods=["GET"])
@login_required
def get_prompt_history_endpoint(prompt_type):
    """Get version history for a specific prompt type."""
    try:
        history = get_prompt_history(prompt_type)
        return jsonify({"history": history}), 200
    except Exception as e:
        print(f"Error fetching prompt history for {prompt_type}:", e)
        return jsonify({"error": "Failed to fetch prompt history"}), 500

@admin_bp.route("/prompts/<prompt_type>", methods=["PUT"])
@login_required
def update_prompt_endpoint(prompt_type):
    """Update a prompt with new content."""
    try:
        data = request.get_json()
        content = data.get("content")
        
        if not content:
            return jsonify({"error": "Prompt content required"}), 400
        
        result = update_prompt(prompt_type, content, modified_by="admin")
        
        if result:
            return jsonify({"status": "updated", "prompt_type": prompt_type}), 200
        else:
            return jsonify({"error": "Failed to update prompt"}), 500
            
    except Exception as e:
        print(f"Error updating prompt {prompt_type}:", e)
        return jsonify({"error": "Failed to update prompt"}), 500

@admin_bp.route("/prompts", methods=["POST"])
@login_required
def create_prompt_endpoint():
    """Create a new prompt."""
    try:
        data = request.get_json()
        prompt_type = data.get("prompt_type")
        content = data.get("content")
        
        if not prompt_type or not content:
            return jsonify({"error": "prompt_type and content required"}), 400
        
        result = create_prompt(prompt_type, content, modified_by="admin")
        
        if result:
            return jsonify({"status": "created", "prompt_type": prompt_type}), 201
        else:
            return jsonify({"error": "Failed to create prompt"}), 500
            
    except Exception as e:
        print("Error creating prompt:", e)
        return jsonify({"error": "Failed to create prompt"}), 500

@admin_bp.route("/prompts/<prompt_type>/revert", methods=["POST"])
@login_required
def revert_prompt_endpoint(prompt_type):
    """Revert a prompt to a specific version."""
    try:
        data = request.get_json()
        target_version = data.get("version")
        
        if not target_version:
            return jsonify({"error": "version required"}), 400
        
        result = revert_prompt(prompt_type, target_version, modified_by="admin")
        
        if result:
            return jsonify({"status": "reverted", "prompt_type": prompt_type, "version": target_version}), 200
        else:
            return jsonify({"error": "Failed to revert prompt"}), 500
            
    except Exception as e:
        print(f"Error reverting prompt {prompt_type}:", e)
        return jsonify({"error": "Failed to revert prompt"}), 500
