#!/usr/bin/env python3
"""
Seed script to initialize required prompts in the database for v1.5 implementation.
"""

import os
from datetime import datetime
from pymongo import MongoClient

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
client = MongoClient(MONGO_URI)
db = client["cover_letter_app"]
prompts_collection = db["prompts"]

def seed_prompts():
    """Insert default prompts into the database."""
    
    prompts = [
        {
            "promptType": "control",
            "content": """Based on the resume and job description below, generate a professional profile statement (1-2 paragraphs) that highlights relevant experience and skills. 

The profile should be tailored to the specific role and demonstrate how the candidate's background aligns with the job requirements. Focus on key qualifications, achievements, and value proposition.

Resume:
{resume}

Job Description:
{jobDescription}

Return only the professional profile text, no additional formatting or explanation.""",
            "version": 1,
            "createdAt": datetime.utcnow(),
            "modifiedBy": "system",
            "isActive": True
        },
        {
            "promptType": "bse_generation",
            "content": """Generate 3 bullet points from this resume that demonstrate self-efficacy experiences relevant to this job. Focus on Bandura's Self-Efficacy theory: mastery experiences, vicarious experiences, or verbal persuasion. Each bullet should include rationale explaining the BSE connection.

Resume:
{resume}

Job Description:
{jobDescription}

Return your response in the following JSON format:
```json
{{
  "bullets": [
    {{
      "index": 0,
      "text": "Successfully led a backend migration project, improving API response times by 40%.",
      "rationale": "This demonstrates mastery experience through direct technical achievement and quantifiable results."
    }},
    {{
      "index": 1, 
      "text": "Collaborated with senior developers to implement best practices for code review processes.",
      "rationale": "This shows vicarious learning through observing and working with experienced team members."
    }},
    {{
      "index": 2,
      "text": "Received recognition from team lead for consistently delivering high-quality code under tight deadlines.",
      "rationale": "This reflects verbal persuasion through positive feedback that builds confidence in abilities."
    }}
  ]
}}
```""",
            "version": 1,
            "createdAt": datetime.utcnow(),
            "modifiedBy": "system",
            "isActive": True
        },
        {
            "promptType": "regeneration",
            "content": """The user rated this bullet {rating}/7 and provided feedback: '{feedback}'. Revise the bullet to better represent their self-concept while maintaining BSE theory focus.

Current bullet: "{bulletText}"
Current rationale: "{rationale}"

{iterationHistory}

Create an improved version that addresses the user's feedback while maintaining the self-efficacy framework.

Return your response in the following JSON format:
```json
{{
  "bullet": {{
    "text": "Revised bullet text that incorporates user feedback",
    "rationale": "Updated rationale explaining the BSE connection and how it addresses user concerns"
  }}
}}
```""",
            "version": 1,
            "createdAt": datetime.utcnow(),
            "modifiedBy": "system",
            "isActive": True
        },
        {
            "promptType": "final_synthesis",
            "content": """Create a final professional profile using these refined bullets and user feedback. Synthesize the collaborative alignment process into an authentic representation that reflects the user's identity and preferences.

Resume:
{resume}

Job Description:
{jobDescription}

Bullet Iteration Data:
{bulletData}

Generate a cohesive professional profile (1-2 paragraphs) that incorporates insights from the collaborative refinement process. The profile should feel authentic to the user while being professionally compelling for the target role.

Return only the final professional profile text, no additional formatting or explanation.""",
            "version": 1,
            "createdAt": datetime.utcnow(),
            "modifiedBy": "system",
            "isActive": True
        }
    ]
    
    # Clear existing prompts and insert new ones
    prompts_collection.delete_many({})
    
    for prompt in prompts:
        result = prompts_collection.insert_one(prompt)
        print(f"Inserted {prompt['promptType']} prompt with ID: {result.inserted_id}")
    
    print(f"Successfully seeded {len(prompts)} prompts into the database.")

if __name__ == "__main__":
    seed_prompts()