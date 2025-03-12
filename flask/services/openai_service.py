import langchain_openai as lcai
import os

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
