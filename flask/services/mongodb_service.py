

def save_user_request(resume_text, job_desc, cover_letter):
    try:
        mongo.db.user_requests.insert_one({
            "resume_text": resume_text,
            "job_desc": job_desc,
            "cover_letter": cover_letter
        })
    except Exception as e:
        print(f"MongoDB Error: {str(e)}")
