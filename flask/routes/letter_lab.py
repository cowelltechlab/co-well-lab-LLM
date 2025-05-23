import sys
import json
from bson.objectid import ObjectId

from flask import Blueprint, request, jsonify
from flask import session

# GENERATION SERVICE FUNCTIONS
from services.openai_service import generate_initial_cover_letter
from services.openai_service import generate_review_all_view_intro
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

# UTILITIES
from utils.generation_helpers import retry_generation
from utils.validation import is_valid_bullet_output, is_valid_rationale_output, is_valid_string_output
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

        # REVIEW-ALL-VIEW INTRO
        review_all_view_intro = retry_generation(
            generate_review_all_view_intro,
            validator_fn=is_valid_string_output,
            args=(job_desc,),
            debug_label="Review-All-View Intro"
        )

        if not review_all_view_intro:
            return jsonify({"error": "Failed to generate review-all-view intro"}), 500


        if DEBUG_GENERATION:
            print(review_all_view_intro)
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
            "review_all_view_intro": review_all_view_intro,
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


