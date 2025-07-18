import langchain_openai as lcai
import os
import json
import re
from services.mongodb_service import get_active_prompt

llmchat = lcai.ChatOpenAI(
    openai_api_key=os.getenv("PLATFORM_OPENAI_KEY"),
    model_name="gpt-4o",
)

# Extract and parse JSON from chat completion
def extract_and_parse(json_string):
    match = re.search(r"```json\n(.*?)\n```", json_string, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON block found in string.")
    return json.loads(match.group(1))

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

# Bullet Regeneration for v1.5
def regenerate_bullet(bullet_text, rationale, user_rating, user_feedback, iteration_history=None):
    """Regenerate a bullet based on user feedback using configurable prompt from database."""
    try:
        # Get the active regeneration prompt from the database
        prompt_doc = get_active_prompt("regeneration")
        if not prompt_doc:
            raise ValueError("No active regeneration prompt found in database")
        
        prompt_template = prompt_doc["content"]
        
        # Prepare iteration history string
        history_str = ""
        if iteration_history and len(iteration_history) > 0:
            history_str = "Previous iterations:\n"
            for i, iteration in enumerate(iteration_history[-3:], 1):  # Show last 3 iterations
                history_str += f"Iteration {iteration.get('iterationNumber', i)}: \"{iteration.get('bulletText', '')}\"\n"
                if iteration.get('userFeedback'):
                    history_str += f"User feedback: \"{iteration.get('userFeedback')}\"\n"
            history_str += "\n"
        
        # Substitute variables in the prompt
        prompt = prompt_template.format(
            bulletText=bullet_text,
            rationale=rationale,
            rating=user_rating,
            feedback=user_feedback,
            iterationHistory=history_str
        )
        
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error regenerating bullet:", e)
        return "Error regenerating bullet."

def parse_regenerated_bullet_response(response_text):
    """Parse regenerated bullet response and extract bullet with rationale."""
    try:
        # Extract JSON from response
        bullet_data = extract_and_parse(response_text)
        
        # Expected format: { "bullet": {"text": "...", "rationale": "..."} }
        if "bullet" in bullet_data and isinstance(bullet_data["bullet"], dict):
            bullet = bullet_data["bullet"]
            if "text" in bullet and "rationale" in bullet:
                return {
                    "text": bullet["text"],
                    "rationale": bullet["rationale"]
                }
        
        raise ValueError("Invalid bullet structure in response")
    except Exception as e:
        print("Error parsing regenerated bullet response:", e)
        raise ValueError("Failed to parse regenerated bullet response")

# Aligned Profile Generation for v1.5
def generate_aligned_profile(resume, job_description, bullet_iterations_data):
    """Generate aligned profile using bullet iterations data and configurable prompt from database."""
    try:
        # Get the active final synthesis prompt from the database
        prompt_doc = get_active_prompt("final_synthesis")
        if not prompt_doc:
            raise ValueError("No active final synthesis prompt found in database")
        
        prompt_template = prompt_doc["content"]
        
        # Prepare bullet iterations summary for the prompt
        bullet_summary = ""
        for bullet_data in bullet_iterations_data:
            bullet_index = bullet_data.get("bulletIndex", 0)
            iterations = bullet_data.get("iterations", [])
            final_iteration = bullet_data.get("finalIteration")
            
            bullet_summary += f"Bullet {bullet_index + 1}:\n"
            
            # Show iteration progression
            for i, iteration in enumerate(iterations):
                bullet_summary += f"  Iteration {iteration.get('iterationNumber', i + 1)}: \"{iteration.get('bulletText', '')}\"\n"
                bullet_summary += f"    Rationale: {iteration.get('rationale', '')}\n"
                bullet_summary += f"    User Rating: {iteration.get('userRating', 'N/A')}/7\n"
                if iteration.get('userFeedback'):
                    bullet_summary += f"    User Feedback: \"{iteration.get('userFeedback')}\"\n"
                bullet_summary += "\n"
            
            # Indicate final chosen iteration
            if final_iteration is not None:
                bullet_summary += f"  Final chosen iteration: {final_iteration}\n"
            
            bullet_summary += "\n"
        
        # Substitute variables in the prompt
        prompt = prompt_template.format(
            resume=resume,
            jobDescription=job_description,
            bulletData=bullet_summary
        )
        
        response = llmchat.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print("Error generating aligned profile:", e)
        return "Error generating aligned profile."

def check_openai_health():
    """
    Sends a minimal request to the OpenAI model to check availability.
    """
    try:
        response = llmchat.invoke("ping")
        return "ok" if response.content.strip() else "error"
    except Exception as e:
        print("OpenAI health check failed:", e)
        return "error"