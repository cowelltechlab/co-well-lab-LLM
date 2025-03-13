import pytest
from main import app

@pytest.fixture
def client():
  app.config["TESTING"] = True
  with app.test_client() as client:
    yield client

def test_flask_running(client):
  """Check if Flask app starts and responds to a test route."""
  response = client.get("/health")
  assert response.status_code == 200
  assert response.json == {"status": "ok"}