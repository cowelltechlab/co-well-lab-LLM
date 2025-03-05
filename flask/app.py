from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
import langchain_openai as lcai
import pdfplumber

load_dotenv("project.env")
app = Flask(__name__)

llmchat = lcai.AzureChatOpenAI(
    openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_deployment="PROPILOT",
    openai_api_version="2024-05-01-preview",
    model_name="gpt-4o",
)

def extract_text_from_pdf(pdf_file):
    try:
        with pdfplumber.open(pdf_file) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
        return text.strip() if text else "No readable text found in the PDF."
    except Exception as e:
        print("Error extracting text:", str(e))
        return None

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
        if 'pdf' not in request.files or 'job_desc' not in request.form:
            return jsonify({"error": "Missing file or job description"}), 400
        
        pdf_file = request.files['pdf']
        job_desc = request.form['job_desc']

        if pdf_file.filename == '':
            return jsonify({"error": "Invalid filename"}), 400

        resume_text = extract_text_from_pdf(pdf_file)
        if not resume_text:
            return jsonify({"error": "Failed to extract text from resume"}), 500

        cover_letter = generate_cover_letter(resume_text, job_desc)
        return jsonify({"cover_letter": cover_letter})
    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error processing cover letter"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)