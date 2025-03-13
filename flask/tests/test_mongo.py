import pytest
from pymongo import MongoClient

@pytest.fixture
def mongo_client():
    """Create a MongoDB test client."""
    client = MongoClient("mongodb://root:examplepassword@mongodb:27017/")
    yield client
    client.close()

def test_mongodb_running(mongo_client):
    """Check if MongoDB is up by running a simple command."""
    assert mongo_client.server_info()  # Raises exception if MongoDB is down
