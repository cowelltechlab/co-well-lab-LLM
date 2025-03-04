from flask import Flask, jsonify
from dotenv import load_dotenv
import os
import langchain_openai as lcai
from langchain_core.prompts import ChatPromptTemplate
import openai

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
