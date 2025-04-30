import sys
import json

from flask import Blueprint, request, jsonify

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

# UTILITIES
from utils.generation_helpers import retry_generation
from utils.validation import is_valid_bullet_output, is_valid_rationale_output, is_valid_string_output
from utils.data_structuring import zip_bullets_and_rationales

letter_lab_bp = Blueprint("letter_lab", __name__)

@letter_lab_bp.route('/initialize', methods=['POST'])
def initialize():
    
    # DEBUG FLAGS
    DEBUG_GENERATION = False
    DEBUG_SESSION_OUTPUT = False
    DEBUG_MONGO_WRITE = False

    try:
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

        if DEBUG_MONGO_WRITE:
            print("MongoDB document successfully created.")
            print("Document ID:", document_id)
            sys.stdout.flush()

        ### RESPONSE TO FRONTEND

        session_data["document_id"] = str(document_id)

        return jsonify(session_data), 200

    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error processing cover letter"}), 500

@letter_lab_bp.route("/final-cover-letter", methods=["POST"])
def final_cover_letter():
    try:
        payload = request.get_json()
        document_id = payload.get("document_id")
        section_feedback = payload.get("section_feedback")

        if not document_id or not section_feedback:
            return jsonify({"error": "Missing document_id or section_feedback"}), 400

        result = update_session(document_id, section_feedback)
        if not result:
            raise ValueError("update_session() returned None")
        return jsonify({"status": "success", "updated": result.acknowledged})

    except Exception as e:
        print("Error updating final feedback:", e)
        return jsonify({"error": "Internal server error"}), 500

@letter_lab_bp.route('/finalize', methods=['POST'])
def finalize():
    return