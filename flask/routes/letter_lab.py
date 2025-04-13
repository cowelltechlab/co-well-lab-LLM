import sys

from flask import Blueprint, request, jsonify

from services.openai_service import generate_initial_cover_letter
from services.openai_service import generate_review_all_view_intro
from services.openai_service import generate_enactive_mastery_bullet_points
from services.openai_service import generate_vicarious_experience_bullet_points
from services.openai_service import generate_verbal_persuasion_bullet_points
from services.openai_service import generate_rationales_for_enactive_mastery_bullet_points
from services.openai_service import generate_rationales_for_vicarious_bullet_points
from services.openai_service import generate_rationales_for_verbal_persuasion_bullet_points

from services.mongodb_service import create_session
from services.mongodb_service import update_session

# DEBUG FLAGS
DEBUG_GENERATION = True

# bullet point JSON validation
def is_valid_bullet_output(data):
    return isinstance(data, dict) and all(k.startswith("BP_") for k in data.keys())

# rationale JSON validation
def is_valid_rationale_output(data):
    return isinstance(data, dict) and all(k.startswith("R_") for k in data.keys())


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
        initial_cover_letter = generate_initial_cover_letter(resume, job_desc)
        if DEBUG_GENERATION:
            print(initial_cover_letter)
            sys.stdout.flush()

        # REVIEW-ALL-VIEW INTRO
        review_all_view_intro = generate_review_all_view_intro(job_desc)

        if DEBUG_GENERATION:
            print(review_all_view_intro)
            sys.stdout.flush()

        ### BULLET POINTS

        # ENACTIVE MASTERY BULLET POINTS
        enactive_mastery_bullet_points = generate_enactive_mastery_bullet_points(resume, job_desc)

        if not is_valid_bullet_output(enactive_mastery_bullet_points):
            print("Enactive Mastery bullet point generation failed or returned invalid data.")
            return jsonify({"error": "Enactive Mastery bullet point generation failed"}), 500

        if DEBUG_GENERATION:
            print("Enactive Mastery Bullet Point 1:", enactive_mastery_bullet_points["BP_1"])
            sys.stdout.flush()

        # VICARIOUS EXPERIENCE BULLET POINTS
        vicarious_experience_bullet_points = generate_vicarious_experience_bullet_points(resume, job_desc)

        if not is_valid_bullet_output(vicarious_experience_bullet_points):
            print("Vicarious Experience bullet point generation failed or returned invalid data.")
            return jsonify({"error": "Vicarious Experience bullet point generation failed"}), 500
        
        if DEBUG_GENERATION:
            print("Vicarious Experience Bullet Point 1:", vicarious_experience_bullet_points["BP_1"])
            sys.stdout.flush()

        # VERBAL PERSUASION BULLET POINTS
        verbal_persuasion_bullet_points = generate_verbal_persuasion_bullet_points(resume, job_desc)

        if not is_valid_bullet_output(verbal_persuasion_bullet_points):
            print("Verbal Persuasion bullet point generation failed or returned invalid data.")
            return jsonify({"error": "Verbal Persuasion bullet point generation failed"}), 500
        
        if DEBUG_GENERATION:
            print("Verbal Persuasion Bullet Point 1:", verbal_persuasion_bullet_points["BP_1"])
            sys.stdout.flush()

        ### RATIONALES

        # ENACTIVE MASTERY RATIONALES
        enactive_mastery_rationales = generate_rationales_for_enactive_mastery_bullet_points(
            resume, job_desc, enactive_mastery_bullet_points
        )

        if not is_valid_rationale_output(enactive_mastery_rationales):
            print("Enactive Mastery rationale generation failed or returned invalid data.")
            return jsonify({"error": "Enactive Mastery rationale generation failed"}), 500
        
        if DEBUG_GENERATION:
            print("Enactive Mastery Rationale 1:", enactive_mastery_rationales.get("R_1"))
            sys.stdout.flush()

        # VICARIOUS EXPERIENCE RATIONALES
        vicarious_experience_rationales = generate_rationales_for_vicarious_bullet_points(
            resume, job_desc, vicarious_experience_bullet_points
        )

        if not is_valid_rationale_output(vicarious_experience_rationales):
            print("Vicarious rationale generation failed or returned invalid data.")
            return jsonify({"error": "Vicarious rationale generation failed"}), 500

        if DEBUG_GENERATION:
            print("Vicarious Rationale 1:", vicarious_experience_rationales.get("R_1"))
            sys.stdout.flush()

        # VERBAL PERSUASION RATIONALES
        verbal_persuasion_rationales = generate_rationales_for_verbal_persuasion_bullet_points(
            resume, job_desc, verbal_persuasion_bullet_points
        )

        if not is_valid_rationale_output(verbal_persuasion_rationales):
            print("Verbal Persuasion rationale generation failed or returned invalid data.")
            return jsonify({"error": "Verbal Persuasion rationale generation failed"}), 500

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