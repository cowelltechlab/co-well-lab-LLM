from flask import Flask
from config import Config  # No more 'app.' needed

from routes.letter_lab import letter_lab_bp
from routes.test_routes import test_bp
from routes.chat import chat_bp
from routes.admin import admin_bp

from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_login import LoginManager
from models.admin_user import AdminUser

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
    CORS(app)
    mongo.init_app(app)

    login_manager.init_app(app)
    login_manager.login_view = "admin.login"

    # Register Blueprints
    app.register_blueprint(letter_lab_bp, url_prefix="/lab")
    app.register_blueprint(test_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(admin_bp)

    return app

app = create_app()