from flask import Blueprint, request, jsonify
from bson.errors import InvalidId
from services.mongodb_service import create_session
from services.mongodb_service import get_session
from services.mongodb_service import update_session

test_bp = Blueprint('test', __name__)

@test_bp.route("/test-init", methods=["POST"])
def test_init():
    data = request.json
    doc_id = create_session(data)
    return jsonify({"document_id": doc_id})

@test_bp.route("/test-get/<doc_id>")
def test_get(doc_id):
    try:
        doc = get_session(doc_id)
        if doc is None:
            return jsonify({"error": "Document not found"}), 404
        doc["_id"] = str(doc["_id"])
        return jsonify(doc)
    except InvalidId:
        return jsonify({"error": "Invalid document ID"}), 400

@test_bp.route("/test-update/<doc_id>", methods=["POST"])
def test_update(doc_id):
    update_data = request.json
    update_session(doc_id, update_data)
    return jsonify({"status": "updated"})
