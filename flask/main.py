from flask import Flask
from config import Config  # No more 'app.' needed
from routes.letter_lab import letter_lab_bp
from routes.test_routes import test_bp
from routes.chat import chat_bp

from flask_pymongo import PyMongo
from flask_cors import CORS

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    mongo.init_app(app)

    # Register Blueprints
    app.register_blueprint(letter_lab_bp, url_prefix="/lab")
    app.register_blueprint(test_bp)
    app.register_blueprint(chat_bp)

    return app

app = create_app()