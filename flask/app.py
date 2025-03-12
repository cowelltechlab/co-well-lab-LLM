from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import MongoClient
from dotenv import load_dotenv
import os
import langchain_openai as lcai

load_dotenv("project.env")

app = Flask(__name__)

#  CORS
CORS(app)

# MongoDB
mongo_db_name = os.getenv('MONGO_DB_NAME')
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client.get_database(mongo_db_name)

# LangChain
llmchat = lcai.AzureChatOpenAI(
    openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_deployment="PROPILOT",
    openai_api_version="2024-05-01-preview",
    model_name="gpt-4o",
)

def generate_cover_letter(resume_text, job_desc):
    try:
        prompt = f"""
        Given the following resume content and job description, write a professional and concise cover letter.
        
        Resume:
        {resume_text}
        
        Job Description:
        {job_desc}
        
        Cover Letter:
        """
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating cover letter:", str(e))
        return "Error generating cover letter."

@app.route('/cover-letter', methods=['POST'])
def cover_letter():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        job_desc = data.get("job_desc")

        if not resume_text or not job_desc:
            return jsonify({"error": "Missing resume text or job description"}), 400

        cover_letter = generate_cover_letter(resume_text, job_desc)
        return jsonify({"cover_letter": cover_letter})
    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error processing cover letter"}), 500
    
@app.route('/test-mongo')
def test_mongo():
    try:
        db.command("ping")
        return jsonify({"status": "Connected to MongoDB"})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)