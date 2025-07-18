import csv
import io
import zipfile
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
    # Get raw sessions directly from MongoDB (not flattened)
    from services.mongodb_service import collection
    
    try:
        sessions = list(collection.find())
        if not sessions:
            return jsonify({"error": "No sessions found"}), 404
        
        # Add document_id and timestamp to each session
        for s in sessions:
            s["document_id"] = str(s["_id"])
            s["timestamp"] = s["_id"].generation_time.isoformat()
            del s["_id"]
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    # Create single wide format CSV with raw data only
    csv_data = []
    
    for session in sessions:
        session_id = session.get("document_id")
        
        # Start with basic session data
        row = {
            "session_id": session_id,
            "timestamp": session.get("timestamp"),
            "resume": session.get("resume"),
            "job_desc": session.get("job_desc"),
            "completed": session.get("completed", False),
        }
        
        # Control profile data (v1.5 structure)
        control_profile = session.get("controlProfile", {})
        row["control_profile_text"] = control_profile.get("text")
        
        # Control profile Likert responses (1-7 scale)
        control_likert = control_profile.get("likertResponses", {})
        row["control_likert_accuracy"] = control_likert.get("accuracy")
        row["control_likert_control"] = control_likert.get("control")
        row["control_likert_expression"] = control_likert.get("expression")
        row["control_likert_alignment"] = control_likert.get("alignment")
        
        # Control profile open-ended responses
        control_open = control_profile.get("openResponses", {})
        row["control_response_likes"] = control_open.get("likes")
        row["control_response_dislikes"] = control_open.get("dislikes")
        row["control_response_changes"] = control_open.get("changes")
        
        # Aligned profile data (v1.5 structure)
        aligned_profile = session.get("alignedProfile", {})
        row["aligned_profile_text"] = aligned_profile.get("text")
        
        # Aligned profile Likert responses (1-7 scale)
        aligned_likert = aligned_profile.get("likertResponses", {})
        row["aligned_likert_accuracy"] = aligned_likert.get("accuracy")
        row["aligned_likert_control"] = aligned_likert.get("control")
        row["aligned_likert_expression"] = aligned_likert.get("expression")
        row["aligned_likert_alignment"] = aligned_likert.get("alignment")
        
        # Aligned profile open-ended responses
        aligned_open = aligned_profile.get("openResponses", {})
        row["aligned_response_likes"] = aligned_open.get("likes")
        row["aligned_response_dislikes"] = aligned_open.get("dislikes")
        row["aligned_response_changes"] = aligned_open.get("changes")
        
        # Bullet iterations - extract ALL iterations for each bullet using 1.1, 1.2, 1.3 format
        bullet_iterations = session.get("bulletIterations", [])
        
        # Collect all iterations across all bullets to determine max iterations needed
        all_iterations = []
        for bullet in bullet_iterations:
            bullet_idx = bullet.get("bulletIndex", 0)
            iterations = bullet.get("iterations", [])
            for iteration in iterations:
                iteration_num = iteration.get("iterationNumber", 1)
                all_iterations.append({
                    "bullet_num": bullet_idx + 1,  # Convert to 1-based indexing
                    "iteration_num": iteration_num,
                    "key": f"bullet_{bullet_idx + 1}_{iteration_num}",
                    "data": iteration
                })
        
        # Add all iterations to the row
        for iteration_data in all_iterations:
            key = iteration_data["key"]
            data = iteration_data["data"]
            
            row[f"{key}_text"] = data.get("bulletText")
            row[f"{key}_rationale"] = data.get("rationale")
            row[f"{key}_rating"] = data.get("userRating")
            row[f"{key}_feedback"] = data.get("userFeedback")
        
        csv_data.append(row)
    
    # Create CSV content
    csv_buffer = io.StringIO()
    
    # Collect all possible fieldnames from all rows (since iterations are dynamic)
    all_fieldnames = set()
    for row in csv_data:
        all_fieldnames.update(row.keys())
    
    # Define base fieldnames in order
    base_fieldnames = [
        "session_id", "timestamp", "resume", "job_desc", "completed",
        "control_profile_text", 
        "control_likert_accuracy", "control_likert_control", "control_likert_expression", "control_likert_alignment",
        "control_response_likes", "control_response_dislikes", "control_response_changes",
        "aligned_profile_text",
        "aligned_likert_accuracy", "aligned_likert_control", "aligned_likert_expression", "aligned_likert_alignment", 
        "aligned_response_likes", "aligned_response_dislikes", "aligned_response_changes"
    ]
    
    # Add bullet iteration fieldnames in sorted order
    bullet_fieldnames = sorted([f for f in all_fieldnames if f.startswith("bullet_")])
    
    # Combine all fieldnames
    fieldnames = base_fieldnames + bullet_fieldnames
    
    writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames, extrasaction="ignore", 
                            quoting=csv.QUOTE_ALL, lineterminator='\n')
    writer.writeheader()
    writer.writerows(csv_data)
    
    # Return as CSV file
    output = make_response(csv_buffer.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=research_data.csv"
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

    # Frontend - check based on environment
    try:
        import os
        # In development, frontend runs on port 5173 (Vite default)
        # In production, it's served by the same host
        if os.environ.get("FLASK_ENV") == "development":
            frontend_url = "http://localhost:5173"
        else:
            frontend_url = "https://letterlab.me"
        
        res = requests.get(frontend_url, timeout=2)
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
