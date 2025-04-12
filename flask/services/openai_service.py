import langchain_openai as lcai
import os
import json
import re

llmchat = lcai.AzureChatOpenAI(
    openai_api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    azure_deployment="PROPILOT",
    openai_api_version="2024-05-01-preview",
    model_name="gpt-4o",
)

# Task 1
def generate_initial_cover_letter(resume, job_desc):
    prompt = f"""
You are an expert career coach and professional writer. Based on the resume and job description provided below, write a compelling, concise, and personalized cover letter draft. The tone should be confident and clear, highlighting relevant skills and experiences that align with the job description.

Use a standard cover letter structure: introduction, body paragraphs, and conclusion. Do not include any headers, addresses, or signatures.

Resume:
{resume}

Job Description:
{job_desc}
"""

    try:
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating initial cover letter:", e)
        return "Error generating initial cover letter."

# Task 2
def generate_review_all_view_intro(job_desc):
    return

# Task 3
def generate_bullet_points(resume, job_desc):
    return

# Task 4
def generate_rationales(resume, job_desc, bullet_points):
    return

# Below is old code that might be useful for reference

# def extract_and_parse(json_string):
#     # Extract the content inside the triple backticks
#     match = re.search(r"```json\n(.*?)\n```", json_string, re.DOTALL)
#     if not match:
#         raise ValueError("No valid JSON block found in string.")
    
#     json_content = match.group(1)
#     return json.loads(json_content)

# def generate_cover_letter(resume_text, job_desc):
#     try:
#        prompt_1 = f"""
#        Based on the following resume and job description, generate 5-7 bullet point statements suitable for a personalized cover letter. Each bullet point should reflect a specific qualification, experience, or skill that strongly aligns with the job requirements.
#        Only output the JSON without any explanatory text. Format the output as JSON with this structure:
#        {{
#        "BP_1": "Demonstrated expertise in backend development using Flask.",
#        "BP_2": "Bullet point statement 2",
#        ...
#        }}
      
#        Resume:
#        {resume_text}
      
#        Job Description:
#        {job_desc}


#        """
#        response_1 = llmchat.invoke(prompt_1)
#        bullet_points = response_1.content.strip()


#        prompt_2 = f"""
#        Below are the bullet points generated for a cover letter:
#        {bullet_points}
#        Below is a resume and a job description. Break each into labeled segments using the exact wording from the documents. Ensure that each segment is self-contained and relevant for mapping to the cover letter bullet points.
#        Format the output as JSON with two main keys:
#        {{
#        "resumeSegments": {{
#        "R_1": "Managed a team of 5 engineers...",
#        "R_2": "Developed RESTful APIs using Flask...",
#        ...
#        }},
#        "jobDescriptionSegments": {{
#        "JD_1": "Looking for a candidate with strong backend API development experience...",
#        "JD_2": "Experience leading technical teams preferred...",
#        ...
#        }}
#        }}


#        Resume:
#        {resume_text}
      
#        Job Description:
#        {job_desc}
#        """


#        response_2 = llmchat.invoke(prompt_2)
#        segments = response_2.content.strip()
      
#        prompt_3 = f"""
#        Below are the bullet points generated for a cover letter:
#        {bullet_points}
#        Below are the segments of the resume and job description:
#        {segments}
#        For each bullet point, identify which resume segments and job description segments best support it. If a bullet point aligns with more than one segment, list all applicable references.
#        Format the output as JSON with this structure:
#        {{
#        "BP_1": {{
#        "resume_refs": ["R_3", "R_7"],
#        "job_desc_refs": ["JD_1"]
#        }},
#        ...
#        }}
#        """


#        response_3 = llmchat.invoke(prompt_3)
#        mapping = response_3.content.strip()

#        combined_output = {
#            "bullet_points": extract_and_parse(bullet_points),
#            "segments": extract_and_parse(segments),
#            "mapping": extract_and_parse(mapping)
#        }

#        return combined_output
#     except Exception as e:
#         print("Error generating cover letter:", str(e))
#         return "Error generating cover letter."
