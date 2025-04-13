import json

def generate_payload(resume_path, job_desc_path, output_path):
    # Read raw input from files
    with open(resume_path, "r", encoding="utf-8") as f:
        resume = f.read()

    with open(job_desc_path, "r", encoding="utf-8") as f:
        job_desc = f.read()

    # Compose the payload
    payload = {
        "resume_text": resume,
        "job_desc": job_desc
    }

    # Write the payload to a JSON file
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"✅ Payload written to {output_path}")

# Example usage (can be changed or parameterized)
if __name__ == "__main__":
    generate_payload(
        resume_path="example-resume.txt",
        job_desc_path="example-job-desc.txt",
        output_path="curl-commands/resume-job-desc-payload.json"
    )
