from flask import Flask
from config import Config  # No more 'app.' needed
from flask.routes.letter_lab import cover_letter_bp
from routes.health import health_bp

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
    app.register_blueprint(cover_letter_bp)

    return app

app = create_app()
app.register_blueprint(health_bp)
