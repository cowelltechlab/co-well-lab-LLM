import sys

from flask import Blueprint, request, jsonify

from services.openai_service import generate_initial_cover_letter
from services.openai_service import generate_review_all_view_intro
from services.openai_service import generate_enactive_mastery_bullet_points
from services.openai_service import generate_vicarious_experience_bullet_points
from services.openai_service import generate_verbal_persuasion_bullet_points
from services.openai_service import generate_rationales_for_enactive_mastery_bullet_points

from services.mongodb_service import create_session
from services.mongodb_service import update_session

letter_lab_bp = Blueprint("letter_lab", __name__)

@letter_lab_bp.route('/initialize', methods=['POST'])
def initialize():
    try:
        data = request.get_json()
        resume = data.get("resume_text")
        job_desc = data.get("job_desc")

        if not resume or not job_desc:
            return jsonify({"error": "Missing resume or job description"}), 400

        # Task 1
        initial_cover_letter = generate_initial_cover_letter(resume, job_desc)
        # print(initial_cover_letter)
        # sys.stdout.flush()

        # Task 2
        review_all_view_intro = generate_review_all_view_intro(job_desc)
        # print(review_all_view_intro)
        # sys.stdout.flush()

        # Task 3 - Bullet Points
        enactive_mastery_bullet_points = generate_enactive_mastery_bullet_points(resume, job_desc)
        print("Enactive Mastery Bullet Point 1:", enactive_mastery_bullet_points["BP_1"])
        sys.stdout.flush()

        vicarious_experience_bullet_points = generate_vicarious_experience_bullet_points(resume, job_desc)
        print("Vicarious Experience Bullet Point 1:", vicarious_experience_bullet_points["BP_1"])
        sys.stdout.flush()

        verbal_persuasion_bullet_points = generate_verbal_persuasion_bullet_points(resume, job_desc)
        print("Verbal Persuasion Bullet Point 1:", verbal_persuasion_bullet_points["BP_1"])
        sys.stdout.flush()

        # Task 4 - Rationales
        rationales_enactive = generate_rationales_for_enactive_mastery_bullet_points(
            resume, job_desc, enactive_mastery_bullet_points
        )
        print("Enactive Mastery Rationale 1:", rationales_enactive.get("R_1"))
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