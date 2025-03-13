import pytest
from main import app
from pymongo import MongoClient

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mongo_client():
    return MongoClient("mongodb://root:examplepassword@mongodb:27017/")

def test_flask_mongo_connection(client, mongo_client):
    """Check if Flask can access MongoDB."""
    db = mongo_client["test_db"]
    db.test_collection.insert_one({"test": "success"})
    document = db.test_collection.find_one({"test": "success"})
    
    assert document is not None
    assert document["test"] == "success"

    db.test_collection.delete_many({})  # Cleanup
