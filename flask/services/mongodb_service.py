

def save_initialization(resume, job_desc, initial_cover_letter, review_all_view_intro, bullet_points, rationales):
    try:
        mongo.db.user_requests.insert_one({
            "resume": resume,
            "job_desc": job_desc,
            "initial_cover_letter": initial_cover_letter,
            "review_all_view_intro": review_all_view_intro,
            "bullet_points": bullet_points,
            "rationales": rationales
        })
    except Exception as e:
        print(f"MongoDB Error: {str(e)}")
