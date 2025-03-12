from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from app.config import Config

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    CORS(app)
    mongo.init_app(app)

    # Register Blueprints
    from app.routes.cover_letter import cover_letter_bp
    app.register_blueprint(cover_letter_bp)

    return app