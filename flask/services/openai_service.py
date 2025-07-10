import langchain_openai as lcai
import os
import json
import re
from services.mongodb_service import get_active_prompt

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

# Control Profile Generation for v1.5
def generate_control_profile(resume, job_description):
    """Generate control profile using configurable prompt from database."""
    try:
        # Get the active control prompt from the database
        prompt_doc = get_active_prompt("control")
        if not prompt_doc:
            raise ValueError("No active control prompt found in database")
        
        prompt_template = prompt_doc["content"]
        
        # Substitute variables in the prompt
        prompt = prompt_template.format(
            resume=resume,
            jobDescription=job_description
        )
        
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating control profile:", e)
        return "Error generating control profile."

# BSE Bullet Generation for v1.5
def generate_bse_bullets(resume, job_description):
    """Generate 3 BSE theory bullets using configurable prompt from database."""
    try:
        # Get the active BSE generation prompt from the database
        prompt_doc = get_active_prompt("bse_generation")
        if not prompt_doc:
            raise ValueError("No active BSE generation prompt found in database")
        
        prompt_template = prompt_doc["content"]
        
        # Substitute variables in the prompt
        prompt = prompt_template.format(
            resume=resume,
            jobDescription=job_description
        )
        
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating BSE bullets:", e)
        return "Error generating BSE bullets."

def parse_bse_bullets_response(response_text):
    """Parse BSE bullets response and extract bullets with rationales."""
    try:
        # Extract JSON from response
        bullet_data = extract_and_parse(response_text)
        
        # Expected format from the LLM should include bullets and rationales
        # Structure: { "bullets": [{"index": 0, "text": "...", "rationale": "..."}] }
        bullets = []
        
        if "bullets" in bullet_data and isinstance(bullet_data["bullets"], list):
            for i, bullet_item in enumerate(bullet_data["bullets"][:3]):  # Limit to 3
                if "text" in bullet_item and "rationale" in bullet_item:
                    bullets.append({
                        "index": i,
                        "text": bullet_item["text"],
                        "rationale": bullet_item["rationale"]
                    })
        
        if len(bullets) != 3:
            raise ValueError(f"Expected 3 bullets, got {len(bullets)}")
            
        return bullets
    except Exception as e:
        print("Error parsing BSE bullets response:", e)
        raise ValueError("Failed to parse BSE bullets response")

# Task 2
def generate_role_name(job_desc):
    prompt = f"""
Extract the job title from the job description below and return ONLY the role name.

Examples of good responses:
- Software Engineer
- Senior Product Manager
- Data Analyst
- Marketing Coordinator
- AI Trainer

Rules:
1. Return only the job title (1-4 words maximum)
2. Do NOT include company name, location, or department
3. Do NOT include any explanation or additional text
4. If no clear job title is found, return "Specialist"

Job description:
{job_desc}
"""

    try:
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating role name:", e)
        return "Error generating role name."


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

# VERBAL PERSUASION RATIONALES

def generate_rationales_for_verbal_persuasion_bullet_points(resume, job_desc, bullet_points_dict):
    bullet_text = "\n".join(
        [f"{k}: {v}" for k, v in bullet_points_dict.items()]
    )

    prompt = f"""
You are helping to build a personalized cover letter using Bandura's Self-Efficacy Theory (BSET), specifically focusing on the belief category **Verbal Persuasion and Affective States**. This belief refers to confidence built through encouragement, affirmation, constructive feedback, or emotional conviction (e.g., feeling capable, passionate, or driven in response to external or internal cues).

Given the bullet points below — which reflect experiences influenced by feedback, motivation, personal conviction, or emotional insight — write a **brief rationale** for each bullet point. The rationale should explain how the experience reflects verbal persuasion or affective states and why it aligns with the job description.

Please format your output as JSON with keys R_1, R_2, and R_3 that map to the respective bullet points (BP_1, BP_2, BP_3). Example:

{{
  "R_1": "This bullet describes how the candidate grew in confidence after being recognized by leadership for strong communication skills.",
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
        print("Error generating verbal persuasion rationales:", e)
        return {}

def generate_final_cover_letter(resume, job_desc, all_bullets, feedback):
    prompt = f"""
You are an expert career coach and writer. While you use principles from self-efficacy theory to guide your approach, you will craft a cover letter that focuses entirely on the candidate's experiences and qualifications.

IMPORTANT: Do NOT mention Bandura's Self-Efficacy Theory, BSET, or any theoretical frameworks in the cover letter. The letter should be a professional document focused solely on the candidate's qualifications for the position.

Use the user's resume, job description, and structured reflection (bullet points + feedback) to generate a compelling, final cover letter. This letter should reflect the user's strengths, insights, and confidence, and should align closely with the job description.

Structure:
- Introduction
- Key paragraphs that integrate relevant achievements and demonstrate confidence through specific examples
- Strong, optimistic conclusion

Use a confident but sincere tone. Do not include headers or sign-offs.

Resume:
{resume}

Job Description:
{job_desc}

User Bullet Points and Feedback:
{json.dumps(all_bullets, indent=2)}

Ratings and Reflections:
{json.dumps(feedback, indent=2)}
"""

    try:
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating final cover letter:", e)
        return "Error generating final cover letter."

def chat_with_user(messages):
    """
    Accepts a list of chat messages with roles ('user' or 'assistant').
    Returns the assistant's next reply using Azure OpenAI.
    """
    try:
        response = llmchat.invoke(messages)
        return response.content.strip()
    except Exception as e:
        print("Error during chat_with_user:", e)
        return "Sorry, I ran into a problem trying to respond."

def check_openai_health():
    """
    Sends a minimal request to the Azure OpenAI model to check availability.
    """
    try:
        response = llmchat.invoke("ping")
        return "ok" if response.content.strip() else "error"
    except Exception as e:
        print("Azure OpenAI health check failed:", e)
        return "error"
