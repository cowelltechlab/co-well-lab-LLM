const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const upload = require("../../../middleware/uploadMiddleware");

router.get("/openai-test", async (req, res) => {
  try {
    const response = await axios.get("http://flask:5002/openai-test");
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask service:", error.message);
    res.status(500).json({ error: "Error calling Flask service" });
  }
});

router.post("/cover-letter", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file || !req.body.job_desc) {
      return res.status(400).json({ error: "Missing file or job description" });
    }

    const formData = new FormData();
    formData.append("pdf", fs.createReadStream(req.file.path));
    formData.append("job_desc", req.body.job_desc);

    const flaskResponse = await axios.post(
      "http://flask:5002/cover-letter",
      formData,
      {
        headers: { ...formData.getHeaders() },
      }
    );

    res.json(flaskResponse.data);
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    res.status(500).json({ error: "Error generating cover letter" });
  }
});

module.exports = router;
