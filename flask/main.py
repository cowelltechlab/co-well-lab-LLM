from flask import Flask
from config import Config  # No more 'app.' needed

from dotenv import load_dotenv
load_dotenv()

from routes.letter_lab import letter_lab_bp
from routes.test_routes import test_bp
from routes.admin import admin_bp

from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_login import LoginManager
from models.admin_user import AdminUser
from services.mongodb_service import initialize_default_prompts

mongo = PyMongo()
login_manager = LoginManager()

@login_manager.user_loader
def load_user(user_id):
    if user_id == "admin":
        return AdminUser(user_id)
    return None

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app, supports_credentials=True, origins=["https://letterlab.me"])
    mongo.init_app(app)

    login_manager.init_app(app)
    login_manager.login_view = "admin.login"

    # Register Blueprints
    app.register_blueprint(letter_lab_bp, url_prefix="/lab")
    app.register_blueprint(test_bp)
    app.register_blueprint(admin_bp)

    # Initialize default prompts on startup
    with app.app_context():
        initialize_default_prompts()

    return app

app = create_app()