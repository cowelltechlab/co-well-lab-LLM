from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from services.openai_service import chat_with_user

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/api/chat", methods=["POST"])
@cross_origin()
def chat():
    data = request.get_json()
    messages = data.get("messages")

    if not messages or not isinstance(messages, list):
        return jsonify({"error": "Invalid or missing 'messages' array"}), 400

    try:
        reply = chat_with_user(messages)
        return jsonify({"message": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
