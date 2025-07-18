import sys
import json
from bson.objectid import ObjectId

from flask import Blueprint, request, jsonify
from flask import session

# GENERATION SERVICE FUNCTIONS
from services.openai_service import generate_control_profile
from services.openai_service import generate_bse_bullets, parse_bse_bullets_response
from services.openai_service import regenerate_bullet, parse_regenerated_bullet_response
from services.openai_service import generate_aligned_profile

# MONGODB SERVICE FUNCTIONS
from services.mongodb_service import get_session, create_session
from services.mongodb_service import set_fields
from services.mongodb_service import is_valid_token
from services.mongodb_service import log_progress_event

# UTILITIES
from utils.generation_helpers import retry_generation
from utils.validation import is_valid_string_output
from utils.auth_decorators import token_required

letter_lab_bp = Blueprint("letter_lab_bp", __name__)

@letter_lab_bp.route("/validate-token", methods=["POST"])
def validate_token():
    data = request.get_json()
    token = data.get("token", "").strip()

    if not token or not is_valid_token(token):
        return jsonify({"error": "Invalid or expired token"}), 401

    # Store in session so @token_required works
    session["token"] = token

    return jsonify({"status": "authorized"}), 200

@letter_lab_bp.route("/logout", methods=["POST"])
def logout_participant():
    session.pop("token", None)
    return jsonify({"status": "logged_out"}), 200

@letter_lab_bp.route("/generate-control-profile", methods=["POST"])
@token_required
def generate_control_profile_endpoint():
    """Generate control profile for collaborative alignment research."""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        resume = data.get("resume")
        job_description = data.get("job_description")
        
        # Validate required fields
        if not all([session_id, resume, job_description]):
            return jsonify({
                "error": "Missing required fields: session_id, resume, job_description"
            }), 400
        
        # Handle session creation or retrieval
        session_doc = None
        
        # Check if session_id is a valid ObjectId and session exists
        if ObjectId.is_valid(session_id):
            session_doc = get_session(session_id)
        
        # If session doesn't exist, create a new one
        if not session_doc:
            session_data = {
                "resume": resume,
                "job_desc": job_description,
                "completed": False
            }
            session_id = create_session(session_data)
            session_doc = get_session(session_id)
        
        # Generate control profile using prompt management system
        profile_result = retry_generation(
            generate_control_profile,
            validator_fn=lambda x: x is not None and isinstance(x, dict) and "content" in x,
            args=(resume, job_description),
            debug_label="Control Profile"
        )
        
        if not profile_result:
            return jsonify({"error": "Failed to generate control profile"}), 500
        
        # Store control profile in session document with version tracking
        update_fields = {
            "controlProfile": {
                "text": profile_result["content"],
                "promptVersion": profile_result["prompt_version"],
                "promptType": profile_result["prompt_type"]
            }
        }
        
        result = set_fields(session_id, update_fields)
        if not result or result.modified_count == 0:
            return jsonify({"error": "Failed to save control profile"}), 500
        
        log_progress_event("control_profile_generated", session_id=session_id)
        
        return jsonify({
            "success": True,
            "profile_text": profile_result["content"],
            "session_id": session_id
        }), 200
        
    except Exception as e:
        print("Error generating control profile:", str(e))
        return jsonify({"error": "Internal server error"}), 500

@letter_lab_bp.route("/generate-bse-bullets", methods=["POST"])
@token_required
def generate_bse_bullets_endpoint():
    """Generate 3 BSE theory bullets for collaborative alignment research."""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        resume = data.get("resume")
        job_description = data.get("job_description")
        
        # Validate required fields
        if not all([session_id, resume, job_description]):
            return jsonify({
                "error": "Missing required fields: session_id, resume, job_description"
            }), 400
        
        # Validate session exists
        if not ObjectId.is_valid(session_id):
            return jsonify({"error": "Invalid session_id format"}), 400
            
        session_doc = get_session(session_id)
        if not session_doc:
            return jsonify({"error": "Session not found"}), 404
        
        # Generate BSE bullets using prompt management system
        bullets_result = retry_generation(
            generate_bse_bullets,
            validator_fn=lambda x: x is not None and isinstance(x, dict) and "content" in x,
            args=(resume, job_description),
            debug_label="BSE Bullets"
        )
        
        if not bullets_result:
            return jsonify({"error": "Failed to generate BSE bullets"}), 500
        
        # Parse the response to extract bullets and rationales
        try:
            bullets = parse_bse_bullets_response(bullets_result["content"])
        except ValueError as e:
            print("Error parsing BSE bullets:", str(e))
            return jsonify({"error": "Failed to parse BSE bullets response"}), 500
        
        # Initialize bulletIterations structure with generated bullets
        bullet_iterations = []
        for i, bullet in enumerate(bullets):
            bullet_iterations.append({
                "bulletIndex": i,
                "iterations": [{
                    "iterationNumber": 1,
                    "bulletText": bullet["text"],
                    "rationale": bullet["rationale"],
                    "userRating": None,
                    "userFeedback": "",
                    "timestamp": None,
                    "promptVersion": bullets_result["prompt_version"],
                    "promptType": bullets_result["prompt_type"]
                }],
                "finalIteration": None
            })
        
        update_fields = {
            "bulletIterations": bullet_iterations
        }
        
        # Check if session exists before updating
        existing_session = get_session(session_id)
        if not existing_session:
            print(f"ERROR: Session {session_id} not found in database")
            return jsonify({"error": "Session not found"}), 404
            
        # Check if bulletIterations already exists
        if "bulletIterations" in existing_session and existing_session["bulletIterations"]:
            # If bullets were already generated, retrieve them from the stored data
            existing_bullets = []
            bullet_iterations_data = existing_session.get("bulletIterations", [])
            for bullet_data in bullet_iterations_data:
                if bullet_data.get("iterations") and len(bullet_data["iterations"]) > 0:
                    # Get the first iteration as the "current" bullet
                    first_iteration = bullet_data["iterations"][0]
                    existing_bullets.append({
                        "index": bullet_data.get("bulletIndex", len(existing_bullets)),
                        "text": first_iteration.get("bulletText", ""),
                        "rationale": first_iteration.get("rationale", "")
                    })
            
            if existing_bullets:
                return jsonify({
                    "success": True,
                    "bullets": existing_bullets
                }), 200
        
        # Update session with new bulletIterations
        result = set_fields(session_id, update_fields)
        
        if not result:
            return jsonify({"error": "Database update failed"}), 500
        
        log_progress_event("bse_bullets_generated", session_id=session_id)
        
        return jsonify({
            "success": True,
            "bullets": bullets
        }), 200
        
    except Exception as e:
        print("Error generating BSE bullets:", str(e))
        return jsonify({"error": "Internal server error"}), 500

@letter_lab_bp.route("/regenerate-bullet", methods=["POST"])
@token_required
def regenerate_bullet_endpoint():
    """Regenerate a single bullet based on user feedback for collaborative alignment research."""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        bullet_index = data.get("bullet_index")
        current_bullet = data.get("current_bullet")
        user_rating = data.get("user_rating")
        user_feedback = data.get("user_feedback")
        iteration_history = data.get("iteration_history", [])
        
        # Validate required fields
        if not all([session_id, bullet_index is not None, current_bullet, user_rating]):
            return jsonify({
                "error": "Missing required fields: session_id, bullet_index, current_bullet, user_rating"
            }), 400
        
        # Validate bullet_index range
        if not isinstance(bullet_index, int) or bullet_index < 0 or bullet_index > 2:
            return jsonify({"error": "bullet_index must be 0, 1, or 2"}), 400
        
        # Validate user_rating range
        if not isinstance(user_rating, int) or user_rating < 1 or user_rating > 7:
            return jsonify({"error": "user_rating must be between 1 and 7"}), 400
        
        # Validate session exists
        if not ObjectId.is_valid(session_id):
            return jsonify({"error": "Invalid session_id format"}), 400
            
        session_doc = get_session(session_id)
        if not session_doc:
            return jsonify({"error": "Session not found"}), 404
        
        # Validate current_bullet structure
        if not isinstance(current_bullet, dict) or "text" not in current_bullet or "rationale" not in current_bullet:
            return jsonify({"error": "current_bullet must contain 'text' and 'rationale' fields"}), 400
        
        # Generate regenerated bullet using prompt management system
        regeneration_result = retry_generation(
            regenerate_bullet,
            validator_fn=lambda x: x is not None and isinstance(x, dict) and "content" in x,
            args=(
                current_bullet["text"],
                current_bullet["rationale"],
                user_rating,
                user_feedback or "",
                iteration_history
            ),
            debug_label="Bullet Regeneration"
        )
        
        if not regeneration_result:
            return jsonify({"error": "Failed to regenerate bullet"}), 500
        
        # Parse the response to extract new bullet and rationale
        try:
            regenerated_bullet = parse_regenerated_bullet_response(regeneration_result["content"])
            # Add version information to the regenerated bullet
            regenerated_bullet["promptVersion"] = regeneration_result["prompt_version"]
            regenerated_bullet["promptType"] = regeneration_result["prompt_type"]
        except ValueError as e:
            print("Error parsing regenerated bullet:", str(e))
            return jsonify({"error": "Failed to parse regenerated bullet response"}), 500
        
        log_progress_event("bullet_regenerated", session_id=session_id)
        
        return jsonify({
            "success": True,
            "bullet": regenerated_bullet
        }), 200
        
    except Exception as e:
        print("Error regenerating bullet:", str(e))
        return jsonify({"error": "Internal server error"}), 500

@letter_lab_bp.route("/generate-aligned-profile", methods=["POST"])
@token_required
def generate_aligned_profile_endpoint():
    """Generate aligned profile using bullet iterations data for collaborative alignment research."""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        
        # Validate required fields
        if not session_id:
            return jsonify({"error": "Missing required field: session_id"}), 400
        
        # Validate session exists
        if not ObjectId.is_valid(session_id):
            return jsonify({"error": "Invalid session_id format"}), 400
            
        session_doc = get_session(session_id)
        if not session_doc:
            return jsonify({"error": "Session not found"}), 404
        
        # Get resume and job description from session
        resume = session_doc.get("resume")
        job_description = session_doc.get("job_desc")
        
        if not resume or not job_description:
            return jsonify({"error": "Resume or job description not found in session"}), 400
        
        # Get bullet iterations data from session
        bullet_iterations = session_doc.get("bulletIterations", [])
        
        if not bullet_iterations:
            return jsonify({"error": "No bullet iterations found in session"}), 400
        
        # Generate aligned profile using prompt management system
        aligned_profile_result = retry_generation(
            generate_aligned_profile,
            validator_fn=lambda x: x is not None and isinstance(x, dict) and "content" in x,
            args=(resume, job_description, bullet_iterations),
            debug_label="Aligned Profile"
        )
        
        if not aligned_profile_result:
            return jsonify({"error": "Failed to generate aligned profile"}), 500
        
        # Store aligned profile in session document with version tracking
        update_fields = {
            "alignedProfile": {
                "text": aligned_profile_result["content"],
                "promptVersion": aligned_profile_result["prompt_version"],
                "promptType": aligned_profile_result["prompt_type"]
            }
        }
        
        result = set_fields(session_id, update_fields)
        if not result or result.modified_count == 0:
            return jsonify({"error": "Failed to save aligned profile"}), 500
        
        log_progress_event("aligned_profile_generated", session_id=session_id)
        
        return jsonify({
            "success": True,
            "profile_text": aligned_profile_result["content"],
            "session_id": session_id
        }), 200
        
    except Exception as e:
        print("Error generating aligned profile:", str(e))
        return jsonify({"error": "Internal server error"}), 500

@letter_lab_bp.route("/save-iteration-data", methods=["POST"])
@token_required
def save_iteration_data_endpoint():
    """Save bullet iteration data for collaborative alignment research."""
    try:
        data = request.get_json()
        session_id = data.get("session_id")
        bullet_index = data.get("bullet_index")
        iteration_number = data.get("iteration_number")
        bullet_text = data.get("bullet_text")
        rationale = data.get("rationale")
        user_rating = data.get("user_rating")
        user_feedback = data.get("user_feedback")
        is_final = data.get("is_final", False)
        
        # Validate required fields
        if not all([session_id, bullet_index is not None, iteration_number is not None, bullet_text, rationale]):
            return jsonify({
                "error": "Missing required fields: session_id, bullet_index, iteration_number, bullet_text, rationale"
            }), 400
        
        # Validate bullet_index range
        if not isinstance(bullet_index, int) or bullet_index < 0 or bullet_index > 2:
            return jsonify({"error": "bullet_index must be 0, 1, or 2"}), 400
        
        # Validate iteration_number
        if not isinstance(iteration_number, int) or iteration_number < 1:
            return jsonify({"error": "iteration_number must be a positive integer"}), 400
        
        # Validate user_rating if provided
        if user_rating is not None:
            if not isinstance(user_rating, int) or user_rating < 1 or user_rating > 7:
                return jsonify({"error": "user_rating must be between 1 and 7"}), 400
        
        # Validate session exists
        if not ObjectId.is_valid(session_id):
            return jsonify({"error": "Invalid session_id format"}), 400
            
        session_doc = get_session(session_id)
        if not session_doc:
            return jsonify({"error": "Session not found"}), 404
        
        # Get current bullet iterations
        bullet_iterations = session_doc.get("bulletIterations", [])
        
        # Ensure we have the right structure
        while len(bullet_iterations) <= bullet_index:
            bullet_iterations.append({
                "bulletIndex": len(bullet_iterations),
                "iterations": [],
                "finalIteration": None
            })
        
        # Create iteration data
        iteration_data = {
            "iterationNumber": iteration_number,
            "bulletText": bullet_text,
            "rationale": rationale,
            "userRating": user_rating,
            "userFeedback": user_feedback or "",
            "timestamp": data.get("timestamp") or None,
            "promptVersion": data.get("prompt_version"),
            "promptType": data.get("prompt_type")
        }
        
        # Add or update iteration in the specific bullet
        bullet_data = bullet_iterations[bullet_index]
        
        # Find if this iteration already exists
        existing_iteration_index = None
        for i, iteration in enumerate(bullet_data["iterations"]):
            if iteration.get("iterationNumber") == iteration_number:
                existing_iteration_index = i
                break
        
        if existing_iteration_index is not None:
            # Update existing iteration
            bullet_data["iterations"][existing_iteration_index] = iteration_data
        else:
            # Add new iteration
            bullet_data["iterations"].append(iteration_data)
        
        # If this is marked as final, set finalIteration
        if is_final:
            bullet_data["finalIteration"] = iteration_number
        
        # Update session document
        update_fields = {
            "bulletIterations": bullet_iterations
        }
        
        result = set_fields(session_id, update_fields)
        if not result or result.modified_count == 0:
            return jsonify({"error": "Failed to save iteration data"}), 500
        
        log_progress_event("iteration_data_saved", session_id=session_id)
        
        return jsonify({
            "success": True,
            "message": "Iteration data saved successfully",
            "bullet_index": bullet_index,
            "iteration_number": iteration_number
        }), 200
        
    except Exception as e:
        print("Error saving iteration data:", str(e))
        return jsonify({"error": "Internal server error"}), 500