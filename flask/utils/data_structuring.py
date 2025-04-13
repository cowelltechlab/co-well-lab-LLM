def zip_bullets_and_rationales(bullet_points, rationales):
    """
    Combines bullet points and rationales into a structured object for one BSET Belief.

    Output format:
    {
      "BP_1": {
        "text": "...",
        "rationale": "...",
        "thumbs": None,
        "qualitative": None
      },
      ...
    }
    """
    zipped = {}
    for i in range(1, 4):
        bp_key = f"BP_1" if i == 1 else f"BP_{i}"
        r_key = f"R_1" if i == 1 else f"R_{i}"

        zipped[bp_key] = {
            "text": bullet_points.get(bp_key, ""),
            "rationale": rationales.get(r_key, ""),
            "thumbs": None,
            "qualitative": None
        }

    return zipped