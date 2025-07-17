import sys
import json
from bson.objectid import ObjectId

from flask import Blueprint, request, jsonify
from flask import session

# GENERATION SERVICE FUNCTIONS
from services.openai_service import generate_initial_cover_letter
from services.openai_service import generate_control_profile
from services.openai_service import generate_bse_bullets, parse_bse_bullets_response
from services.openai_service import regenerate_bullet, parse_regenerated_bullet_response
from services.openai_service import generate_aligned_profile
from services.openai_service import generate_role_name
from services.openai_service import generate_enactive_mastery_bullet_points
from services.openai_service import generate_vicarious_experience_bullet_points
from services.openai_service import generate_verbal_persuasion_bullet_points
from services.openai_service import generate_rationales_for_enactive_mastery_bullet_points
from services.openai_service import generate_rationales_for_vicarious_bullet_points
from services.openai_service import generate_rationales_for_verbal_persuasion_bullet_points
from services.openai_service import generate_final_cover_letter

# MONGODB SERVICE FUNCTIONS
from services.mongodb_service import create_session
from services.mongodb_service import update_session
from services.mongodb_service import get_session
from services.mongodb_service import set_fields
from services.mongodb_service import is_valid_token
from services.mongodb_service import mark_token_used
from services.mongodb_service import log_progress_event
from services.mongodb_service import get_active_prompt

# UTILITIES
from utils.generation_helpers import retry_generation
from utils.validation import is_valid_bullet_output, is_valid_rationale_output, is_valid_string_output, is_valid_role_name
from utils.data_structuring import zip_bullets_and_rationales
from utils.auth_decorators import token_required

letter_lab_bp = Blueprint("letter_lab_bp", __name__)

@letter_lab_bp.route('/initialize', methods=['POST'])
@token_required
def initialize():
    
    # DEBUG FLAGS
    DEBUG_GENERATION = False
    DEBUG_SESSION_OUTPUT = False
    DEBUG_MONGO_WRITE = False

    try:
        log_progress_event("initialize_request")

        data = request.get_json()
        resume = data.get("resume_text")
        job_desc = data.get("job_desc")

        if not resume or not job_desc:
            return jsonify({"error": "Missing resume or job description"}), 400

        # INITIAL COVER LETTER
        initial_cover_letter = retry_generation(
            generate_initial_cover_letter,
            validator_fn=is_valid_string_output,
            args=(resume, job_desc),
            debug_label="Initial Cover Letter"
        )

        if not initial_cover_letter:
            return jsonify({"error": "Failed to generate initial cover letter"}), 500

        if DEBUG_GENERATION:
            print(initial_cover_letter)
            sys.stdout.flush()

        # ROLE NAME GENERATION
        role_name = retry_generation(
            generate_role_name,
            validator_fn=is_valid_role_name,
            args=(job_desc,),
            debug_label="Role Name"
        )

        if not role_name:
            return jsonify({"error": "Failed to generate role_name"}), 500


        if DEBUG_GENERATION:
            print(role_name)
            sys.stdout.flush()

        ### BULLET POINTS

        # ENACTIVE MASTERY BULLET POINTS
        enactive_mastery_bullet_points = retry_generation(
            generate_enactive_mastery_bullet_points,
            validator_fn=is_valid_bullet_output,
            args=(resume, job_desc),
            debug_label="Enactive Bullet Points"
        )

        if not enactive_mastery_bullet_points:
            return jsonify({"error": "Failed to generate Enactive Mastery bullet points"}), 500

        if DEBUG_GENERATION:
            print("Enactive Mastery Bullet Point 1:", enactive_mastery_bullet_points["BP_1"])
            sys.stdout.flush()

        # VICARIOUS EXPERIENCE BULLET POINTS
        vicarious_experience_bullet_points = retry_generation(
            generate_vicarious_experience_bullet_points,
            validator_fn=is_valid_bullet_output,
            args=(resume, job_desc),
            debug_label="Vicarious Bullet Points"
        )

        if not vicarious_experience_bullet_points:
            return jsonify({"error": "Failed to generate Vicarious Experience bullet points"}), 500
        
        if DEBUG_GENERATION:
            print("Vicarious Experience Bullet Point 1:", vicarious_experience_bullet_points["BP_1"])
            sys.stdout.flush()

        # VERBAL PERSUASION BULLET POINTS
        verbal_persuasion_bullet_points = retry_generation(
            generate_verbal_persuasion_bullet_points,
            validator_fn=is_valid_bullet_output,
            args=(resume, job_desc),
            debug_label="Verbal Persuasion Bullet Points"
        )

        if not verbal_persuasion_bullet_points:
            return jsonify({"error": "Failed to generate Verbal Persuasion bullet points"}), 500
        
        if DEBUG_GENERATION:
            print("Verbal Persuasion Bullet Point 1:", verbal_persuasion_bullet_points["BP_1"])
            sys.stdout.flush()

        ### RATIONALES

        # ENACTIVE MASTERY RATIONALES
        enactive_mastery_rationales = retry_generation(
            generate_rationales_for_enactive_mastery_bullet_points,
            validator_fn=is_valid_rationale_output,
            args=(resume, job_desc, enactive_mastery_bullet_points),
            debug_label="Enactive Rationales"
        )

        if not enactive_mastery_rationales:
            return jsonify({"error": "Failed to generate Enactive Mastery rationales"}), 500
        
        if DEBUG_GENERATION:
            print("Enactive Mastery Rationale 1:", enactive_mastery_rationales.get("R_1"))
            sys.stdout.flush()

        # VICARIOUS EXPERIENCE RATIONALES
        vicarious_experience_rationales = retry_generation(
            generate_rationales_for_vicarious_bullet_points,
            validator_fn=is_valid_rationale_output,
            args=(resume, job_desc, vicarious_experience_bullet_points),
            debug_label="Vicarious Rationales"
        )

        if not vicarious_experience_rationales:
            return jsonify({"error": "Failed to generate Vicarious Experience rationales"}), 500

        if DEBUG_GENERATION:
            print("Vicarious Rationale 1:", vicarious_experience_rationales.get("R_1"))
            sys.stdout.flush()

        # VERBAL PERSUASION RATIONALES
        verbal_persuasion_rationales = retry_generation(
            generate_rationales_for_verbal_persuasion_bullet_points,
            validator_fn=is_valid_rationale_output,
            args=(resume, job_desc, verbal_persuasion_bullet_points),
            debug_label="Verbal Persuasion Rationales"
        )

        if not verbal_persuasion_rationales:
            return jsonify({"error": "Failed to generate Verbal Persuasion rationales"}), 500

        if DEBUG_GENERATION:
            print("Verbal Persuasion Rationale 1:", verbal_persuasion_rationales.get("R_1"))
            sys.stdout.flush()

        ### DATA STRUCTURING

        zipped_enactive = zip_bullets_and_rationales(
            enactive_mastery_bullet_points, enactive_mastery_rationales
        )

        zipped_vicarious = zip_bullets_and_rationales(
            vicarious_experience_bullet_points, vicarious_experience_rationales
        )

        zipped_verbal = zip_bullets_and_rationales(
            verbal_persuasion_bullet_points, verbal_persuasion_rationales
        )

        session_data = {
            "resume": resume,
            "job_desc": job_desc,
            "initial_cover_letter": initial_cover_letter,
            "role_name": role_name,
            "BSETB_enactive_mastery": zipped_enactive,
            "BSETB_vicarious_experience": zipped_vicarious,
            "BSETB_verbal_persuasion": zipped_verbal
        }

        if DEBUG_SESSION_OUTPUT:
            print("Final session_data object:")
            print(json.dumps(session_data, indent=2))
            sys.stdout.flush()

        ### DATA STORAGE

        document_id = create_session(session_data)

        log_progress_event("initialize_success", session_id=document_id)
        
        # Link the token to this session
        if "token" in session:
            mark_token_used(session["token"], session_id=str(document_id))

        if DEBUG_MONGO_WRITE:
            print("MongoDB document successfully created.")
            print("Document ID:", document_id)
            sys.stdout.flush()

        ### RESPONSE TO FRONTEND

        session_data["document_id"] = str(document_id)
        session_data["completed"] = False

        return jsonify(session_data), 200

    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error processing cover letter"}), 500

@letter_lab_bp.route("/final-cover-letter", methods=["POST"])
@token_required
def final_cover_letter():
    try:

        payload = request.get_json()
        document_id = payload.get("document_id")
        section_feedback = payload.get("section_feedback")
        log_progress_event("update_request", session_id=document_id)

        if not document_id or not section_feedback:
            return jsonify({"error": "Missing document_id or section_feedback"}), 400

        result = update_session(document_id, section_feedback)
        if not result:
            raise ValueError("update_session() returned None")
        
        print(f"Updated session with feedback: {document_id}")
        
        document = get_session(document_id)
        if not document:
            return jsonify({"error": "Document not found"}), 404
        
        resume = document.get("resume")
        job_desc = document.get("job_desc")

        all_bullets = {
            "BSETB_enactive_mastery": document.get("BSETB_enactive_mastery"),
            "BSETB_vicarious_experience": document.get("BSETB_vicarious_experience"),
            "BSETB_verbal_persuasion": document.get("BSETB_verbal_persuasion"),
        }

        final_letter = retry_generation(
            generate_final_cover_letter,
            validator_fn=is_valid_string_output,
            args=(resume, job_desc, all_bullets, section_feedback),
            debug_label="Final Cover Letter"
        )

        set_fields(document_id, {"final_cover_letter": final_letter})

        log_progress_event("update_success", session_id=document_id)

        print(f"Updated session with final cover letter: {document_id}")

        return jsonify({"final_cover_letter": final_letter}), 200

    except Exception as e:
        print("Error updating final feedback:", e)
        return jsonify({"error": "Internal server error"}), 500

@letter_lab_bp.route("/submit-final-data", methods=["POST"])
@token_required
def submit_final_data():
    try:
        data = request.get_json()
        doc_id = data.get("document_id")

        log_progress_event("final_update_request", session_id=doc_id)

        if not doc_id or not ObjectId.is_valid(doc_id):
            return jsonify({"error": "Invalid or missing document_id"}), 400

        # Extract the fields we want to save
        content_ratings = data.get("contentRepresentationRating", {})
        style_ratings = data.get("styleRepresentationRating", {})
        text_feedback = data.get("textFeedback", {})
        draft_mapping = data.get("draftMapping", {})
        
        # Calculate finalPreference based on contentRepresentationRating
        draft1_content = content_ratings.get("draft1")
        draft2_content = content_ratings.get("draft2")
        
        final_preference = None
        if draft1_content is not None and draft2_content is not None:
            # Determine which draft corresponds to initial/final
            initial_rating = draft1_content if draft_mapping.get("draft1") == "initial" else draft2_content
            final_rating = draft1_content if draft_mapping.get("draft1") == "final" else draft2_content
            
            if initial_rating > final_rating:
                final_preference = "control"
            elif final_rating > initial_rating:
                final_preference = "aligned"
            else:
                final_preference = "tie"
        
        # Prepare fields to update (excluding chatMessages and draftRating)
        update_fields = {
            "contentRepresentationRating": content_ratings,
            "styleRepresentationRating": style_ratings,
            "textFeedback": text_feedback,
            "draftMapping": draft_mapping,
            "finalPreference": final_preference,
            "completed": True
        }
        
        # Only include non-None fields from original data
        if data.get("resume"):
            update_fields["resume"] = data["resume"]
        if data.get("job_desc"):
            update_fields["job_desc"] = data["job_desc"]

        result = set_fields(doc_id, update_fields)

        if not result or result.modified_count == 0:
            return jsonify({"error": "No document updated"}), 404
        
        print(f"Updated session with final data: {doc_id}")
        log_progress_event("final_update_success", session_id=doc_id)

        return jsonify({
            "status": "success",
            "completed": True,
            "finalPreference": final_preference
        }), 200

    except Exception as e:
        print("❌ Error submitting final data:", e)
        return jsonify({"error": "Server error"}), 500
    
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
        
        # Validate session exists
        if not ObjectId.is_valid(session_id):
            return jsonify({"error": "Invalid session_id format"}), 400
            
        session_doc = get_session(session_id)
        if not session_doc:
            return jsonify({"error": "Session not found"}), 404
        
        # Generate control profile using prompt management system
        profile_text = retry_generation(
            generate_control_profile,
            validator_fn=is_valid_string_output,
            args=(resume, job_description),
            debug_label="Control Profile"
        )
        
        if not profile_text:
            return jsonify({"error": "Failed to generate control profile"}), 500
        
        # Store control profile in session document
        update_fields = {
            "controlProfile": {
                "text": profile_text
            }
        }
        
        result = set_fields(session_id, update_fields)
        if not result or result.modified_count == 0:
            return jsonify({"error": "Failed to save control profile"}), 500
        
        log_progress_event("control_profile_generated", session_id=session_id)
        
        return jsonify({
            "success": True,
            "profile_text": profile_text,
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
        bullets_response = retry_generation(
            generate_bse_bullets,
            validator_fn=is_valid_string_output,
            args=(resume, job_description),
            debug_label="BSE Bullets"
        )
        
        if not bullets_response:
            return jsonify({"error": "Failed to generate BSE bullets"}), 500
        
        # Parse the response to extract bullets and rationales
        try:
            bullets = parse_bse_bullets_response(bullets_response)
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
                    "timestamp": None
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
        regeneration_response = retry_generation(
            regenerate_bullet,
            validator_fn=is_valid_string_output,
            args=(
                current_bullet["text"],
                current_bullet["rationale"],
                user_rating,
                user_feedback or "",
                iteration_history
            ),
            debug_label="Bullet Regeneration"
        )
        
        if not regeneration_response:
            return jsonify({"error": "Failed to regenerate bullet"}), 500
        
        # Parse the response to extract new bullet and rationale
        try:
            regenerated_bullet = parse_regenerated_bullet_response(regeneration_response)
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
        aligned_profile_text = retry_generation(
            generate_aligned_profile,
            validator_fn=is_valid_string_output,
            args=(resume, job_description, bullet_iterations),
            debug_label="Aligned Profile"
        )
        
        if not aligned_profile_text:
            return jsonify({"error": "Failed to generate aligned profile"}), 500
        
        # Store aligned profile in session document
        update_fields = {
            "alignedProfile": {
                "text": aligned_profile_text
            }
        }
        
        result = set_fields(session_id, update_fields)
        if not result or result.modified_count == 0:
            return jsonify({"error": "Failed to save aligned profile"}), 500
        
        log_progress_event("aligned_profile_generated", session_id=session_id)
        
        return jsonify({
            "success": True,
            "profile_text": aligned_profile_text,
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
            "timestamp": data.get("timestamp") or None
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


