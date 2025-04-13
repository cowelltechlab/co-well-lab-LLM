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

# Extract and parse JSON from chat completion
def extract_and_parse(json_string):
    match = re.search(r"```json\n(.*?)\n```", json_string, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON block found in string.")
    return json.loads(match.group(1))

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
    prompt = f"""
You are helping build a friendly and helpful AI career assistant.

Extract the job title and organization name from the job description below. Then, use them to write a short, welcoming intro message like the following:

Example format:
"Here’s a personalized cover letter outline we’ve created for you, tailored specifically for the [job title] role at [organization].

As you read through each section, you’ll see the thinking behind the wording and structure — why certain skills are emphasized, how the language reflects the job description, and where your strengths shine through.

Take some time to review each section. If something doesn’t feel quite right, let us know! You can agree with our choices or suggest changes — we’re here to build this with you, not just for you."

Job description:
{job_desc}

Only return the final formatted message. Do not include any explanation.
"""

    try:
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating review-all-view intro:", e)
        return "Error generating intro text."


# Task 3
### BULLET POINTS

# ENACTIVE MASTERY BULLET POINTS
def generate_enactive_mastery_bullet_points(resume, job_desc):
    prompt = f"""
You are helping a user build a personalized cover letter using Bandura's Self-Efficacy Theory (BSET) as a framework. BSET suggests that self-efficacy — a person’s belief in their ability to succeed — is influenced by four key sources. One of those is **Enactive Mastery Experience**, which refers to confidence gained through personal accomplishments and direct, successful experiences.

Your task is to generate **3 bullet points** that align with this belief. Each bullet point should reflect a specific skill, experience, or achievement from the user's resume that demonstrates **direct success** in a way that aligns with the job description.

Be specific, action-oriented, and concise. Your response should be strictly formatted as JSON like this:

{{
  "BP_1": "Successfully led a backend migration project, improving API response times by 40%.",
  "BP_2": "...",
  "BP_3": "..."
}}

Resume:
{resume}

Job Description:
{job_desc}
"""

    try:
        response = llmchat.invoke(prompt)
        content = response.content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return extract_and_parse(content)
    except Exception as e:
        print("Error generating enactive mastery bullet points:", e)
        return {}

# VICARIOUS EXPERIENCE BULLET POINTS
def generate_vicarious_experience_bullet_points(resume, job_desc):
    prompt = f"""
You are helping a user build a personalized cover letter using Bandura's Self-Efficacy Theory (BSET) as a framework. BSET suggests that self-efficacy — a person’s belief in their ability to succeed — is influenced by four key sources. One of those is **Vicarious Experience or Social Modeling**, which refers to believing in our own abilities by seeing others succeed through effort, especially those similar to oneself.
Your task is to generate **3 bullet points** that align with this belief. Each bullet point should reflect a specific skill, experience, or achievement from the user's resume that demonstrates **direct success** in a way that aligns with the job description.
Be specific, action-oriented, and concise. Your response should be strictly formatted as JSON like this:
{{
  "BP_1": "Successfully led a backend migration project, improving API response times by 40%.",
  "BP_2": "...",
  "BP_3": "..."
}}
Resume:
{resume}
Job Description:
{job_desc}
"""

    try:
        response = llmchat.invoke(prompt)
        content = response.content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return extract_and_parse(content)
    except Exception as e:
        print("Error generating vicarious experience bullet points:", e)
        return {}
    
# VERBAL PERSUASION BULLET POINTS
def generate_verbal_persuasion_bullet_points(resume, job_desc):
    prompt = f"""
You are helping a user build a personalized cover letter using Bandura's Self-Efficacy Theory (BSET) as a framework. BSET suggests that self-efficacy — a person’s belief in their ability to succeed — is influenced by four key sources. One of those is **Verbal Persuasion**, which refers to boosting belief in our own abilities through encouragement, positive feedback, and managing our emotional state under pressure.
Your task is to generate **3 bullet points** that align with this belief. Each bullet point should reflect a specific skill, experience, or achievement from the user's resume that demonstrates **direct success** in a way that aligns with the job description.
Be specific, action-oriented, and concise. Your response should be strictly formatted as JSON like this:
{{
  "BP_1": "Successfully led a backend migration project, improving API response times by 40%.",
  "BP_2": "...",
  "BP_3": "..."
}}
Resume:
{resume}
Job Description:
{job_desc}
"""

    try:
        response = llmchat.invoke(prompt)
        content = response.content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return extract_and_parse(content)
    except Exception as e:
        print("Error generating verbal persuasion bullet points:", e)
        return {}


# Task 4
### RATIONALES

# ENACTIVE MASTERY RATIONALES
def generate_rationales_for_enactive_mastery_bullet_points(resume, job_desc, bullet_points_dict):
    bullet_text = "\n".join(
        [f"{k}: {v}" for k, v in bullet_points_dict.items()]
    )

    prompt = f"""
You are helping to build a personalized cover letter using Bandura's Self-Efficacy Theory (BSET), specifically focusing on the belief category **Enactive Mastery Experience**, which highlights confidence developed through direct, successful personal experience.

Given the bullet points below — which represent key achievements from the resume that align with the job description — write a **brief rationale** for each bullet point. The rationale should explain why this experience supports the candidate's self-efficacy and why it's a strong match for the job.

Please format your output as JSON with keys R_1, R_2, and R_3 that map to the respective bullet points (BP_1, BP_2, BP_3). Example:

{{
  "R_1": "This statement reflects a successful leadership outcome in a directly relevant domain.",
  "R_2": "...",
  "R_3": "..."
}}

Resume:
{resume}

Job Description:
{job_desc}

Bullet Points:
{bullet_text}
"""

    try:
        response = llmchat.invoke(prompt)
        content = response.content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return extract_and_parse(content)
    except Exception as e:
        print("Error generating enactive mastery rationales:", e)
        return {}

# VICARIOUS EXPERIENCE RATIONALES
def generate_rationales_for_vicarious_bullet_points(resume, job_desc, bullet_points_dict):
    bullet_text = "\n".join(
        [f"{k}: {v}" for k, v in bullet_points_dict.items()]
    )

    prompt = f"""
You are helping to build a personalized cover letter using Bandura's Self-Efficacy Theory (BSET), specifically focusing on the belief category **Vicarious Experience**. This belief refers to confidence gained through observing others — such as mentors, team leaders, or successful peers — and applying those learnings to your own work.

Given the bullet points below — which represent experiences where the candidate has learned by observing or collaborating with others — write a **brief rationale** for each bullet point. The rationale should explain how the experience reflects vicarious learning and why it aligns with the job description.

Please format your output as JSON with keys R_1, R_2, and R_3 that map to the respective bullet points (BP_1, BP_2, BP_3). Example:

{{
  "R_1": "This bullet highlights how the candidate developed best practices under the guidance of a senior engineer.",
  "R_2": "...",
  "R_3": "..."
}}

Resume:
{resume}

Job Description:
{job_desc}

Bullet Points:
{bullet_text}
"""

    try:
        response = llmchat.invoke(prompt)
        content = response.content.strip()

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return extract_and_parse(content)
    except Exception as e:
        print("Error generating vicarious rationales:", e)
        return {}
