from flask import Flask, jsonify, request
from dotenv import load_dotenv
import os
import langchain_openai as lcai
from langchain_core.prompts import ChatPromptTemplate
import openai
import PyPDF2
import io

# Load environment variables (if needed)
load_dotenv("project.env")
app = Flask(__name__)

# Configure the Azure Chat OpenAI LLM via LangChain
llmchat = lcai.AzureChatOpenAI(
    openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_deployment="PROPILOT",
    openai_api_version="2024-05-01-preview",
    model_name="gpt-4o",
)

def simple_test_chain():
    # A simplified prompt that doesn't reference customer support details.
    simple_prompt = "Hello, world! Please greet me."
    template = ChatPromptTemplate.from_messages([("system", simple_prompt)])
    chain = template | llmchat
    return chain

# Create the simple chain instance.
simple_chain = simple_test_chain()

@app.route('/openai-test', methods=['GET'])
def openai_test():
    # For a simple test, no parameters are needed.
    response = simple_chain.invoke({})
    # Convert the response to a string (assuming response is an AIMessage object)
    message_content = str(response)
    print(message_content)
    return jsonify({"response": message_content})

@app.route('/cover-letter', methods=['POST'])
def generate_cover_letter():
    try:
        # Check if a file was uploaded
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file uploaded"}), 400

        pdf_file = request.files['pdf']

        # Validate filename
        if pdf_file.filename == '':
            return jsonify({"error": "Invalid filename"}), 400

        # Save the PDF (for now, saving locally)
        save_path = os.path.join("/tmp", pdf_file.filename)
        pdf_file.save(save_path)
        print(f"Received PDF: {save_path}")

        # (Your OpenAI call should go here)
        # Mock response for debugging
        cover_letter = "This is a mock cover letter."

        return jsonify({"cover_letter": cover_letter})

    except Exception as e:
        print("Error processing cover letter:", str(e))
        return jsonify({"error": "Error generating cover letter"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
