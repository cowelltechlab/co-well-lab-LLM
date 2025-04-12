from app.services.openai_service import generate_bullet_points
from app.services.openai_service import generate_rationales

def generate_bullet_points_and_rationales(resume, job_desc):
  bullet_points = generate_bullet_points(resume, job_desc)
  rationales = generate_rationales(resume, job_desc, bullet_points)
  return bullet_points, rationales