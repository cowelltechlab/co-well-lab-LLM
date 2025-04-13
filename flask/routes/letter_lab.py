import sys

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

# MONGODB SERVICE FUNCTIONS
from services.mongodb_service import create_session
from services.mongodb_service import update_session

# UTILITIES
from utils.generation_helpers import retry_generation
from utils.validation import is_valid_bullet_output, is_valid_rationale_output, is_valid_string_output


# DEBUG FLAGS
DEBUG_GENERATION = False

# # bullet point JSON validation
# def is_valid_bullet_output(data):
#     return isinstance(data, dict) and all(k.startswith("BP_") for k in data.keys())

# # rationale JSON validation
# def is_valid_rationale_output(data):
#     return isinstance(data, dict) and all(k.startswith("R_") for k in data.keys())


letter_lab_bp = Blueprint("letter_lab", __name__)

@letter_lab_bp.route('/initialize', methods=['POST'])
def initialize():
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

        # Task 5
        # document_id = create_session(resume, job_desc, initial_cover_letter, review_all_view_intro, bullet_points, rationales)


        # return jsonify({
        #     "initial_cover_letter": initial_cover_letter,
        #     "review_all_view_intro": review_all_view_intro,
        #     "bullet_points": bullet_points,
        #     "rationales": rationales,
        #     "document_id": document_id
        # })

        return jsonify({"status": "initialization completed"}), 200
    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error processing cover letter"}), 500

@letter_lab_bp.route('/cover-letter', methods=['POST'])
def cover_letter():
    return

@letter_lab_bp.route('/finalize', methods=['POST'])
def finalize():
    return