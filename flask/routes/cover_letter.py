from flask import Blueprint, request, jsonify
from app.services.openai_service import generate_cover_letter
from app.services.mongodb_service import save_user_request

cover_letter_bp = Blueprint("cover_letter", __name__)

@cover_letter_bp.route('/cover-letter', methods=['POST'])
def cover_letter():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        job_desc = data.get("job_desc")

        if not resume_text or not job_desc:
            return jsonify({"error": "Missing resume text or job description"}), 400

        cover_letter = generate_cover_letter(resume_text, job_desc)
        save_user_request(resume_text, job_desc, cover_letter)

        return jsonify({"cover_letter": cover_letter})
    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error processing cover letter"}), 500
