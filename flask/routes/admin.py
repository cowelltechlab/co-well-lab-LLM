import csv
import io
from flask import make_response
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required
from models.admin_user import AdminUser
from services.mongodb_service import get_all_sessions
from services.openai_service import check_openai_health


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if username == "admin":
        user = AdminUser("admin")
        if user.check_password(password):
            login_user(user)
            return jsonify({"status": "logged_in"}), 200

    return jsonify({"error": "Unauthorized"}), 401


@admin_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"status": "logged_out"}), 200

@admin_bp.route("/sessions/export", methods=["GET"])
@login_required
def export_sessions_csv():
    sessions = get_all_sessions()
    if not sessions:
        return jsonify({"error": "No sessions found"}), 404

    # Step 1: Build the full set of all keys used in any session
    all_keys = set()
    for s in sessions:
        all_keys.update(s.keys())
    fieldnames = sorted(all_keys)


    # Step 2: Write the CSV
    si = io.StringIO()
    writer = csv.DictWriter(si, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(sessions)

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=sessions.csv"
    output.headers["Content-Type"] = "text/csv"
    return output

from flask import jsonify
import openai
from services.mongodb_service import collection
from flask_login import login_required

@admin_bp.route("/health", methods=["GET"])
@login_required
def health_check():
    health = {
        "flask": "ok",
        "mongodb": "ok",
        "openai": "ok"
    }

    try:
        collection.estimated_document_count()
    except Exception as e:
        print("MongoDB health check failed:", e)
        health["mongodb"] = "error"

    health["openai"] = check_openai_health()

    return jsonify(health), 200
