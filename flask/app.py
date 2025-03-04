from flask import Flask, jsonify
from pymongo import MongoClient
import os

app = Flask(__name__)

mongo_username = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'root')
mongo_password = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'examplepassword')
mongo_host = os.environ.get('MONGO_HOST', 'localhost')
mongo_port = os.environ.get('MONGO_PORT', '27017')
auth_source = os.environ.get('MONGO_AUTH_SOURCE', 'admin')

uri = os.environ.get('MONGODB_URI') or f"mongodb://{mongo_username}:{mongo_password}@{mongo_host}:{mongo_port}/?authSource={auth_source}"

client = MongoClient(uri)
db = client['test_database']

@app.route('/test-db')
def test_db():
    try:
        collections = db.list_collection_names()
        return jsonify({
            "message": "MongoDB connection successful!",
            "collections": collections
        })
    except Exception as e:
        return jsonify({
            "error": "Error accessing MongoDB",
            "details": str(e)
        }), 500
    
@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello from Flask"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
