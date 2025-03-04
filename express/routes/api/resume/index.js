const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const upload = require("../../../middleware/uploadMiddleware");
const {
  uploadFile,
  getFile,
} = require("../../../controllers/resumeController");

router.get("/test-flask", async (req, res) => {
  try {
    const response = await axios.get("http://flask:5002/test");
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask endpoint:", error.message);
    res.status(500).json({ error: "Error calling Flask endpoint" });
  }
});

router.get("/openai-test", async (req, res) => {
  try {
    // Use the Docker service name "flask" to reach the Flask container
    const response = await axios.get("http://flask:5002/openai-test");
    // Forward the JSON response from Flask back to the client
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Flask service:", error.message);
    res.status(500).json({ error: "Error calling Flask service" });
  }
});

// Route to handle PDF resume and generate cover letter
router.post("/cover-letter", upload.single("pdf"), async (req, res) => {
  try {
    // Get the optional prompt from the request body (or set a default)
    const prompt =
      req.body.prompt ||
      "Generate a cover letter based on the attached resume.";

    // Create form data to send to Flask
    const form = new FormData();
    form.append("pdf", fs.createReadStream(req.file.path));
    form.append("prompt", prompt);

    // Make a POST request to the Flask endpoint
    const response = await axios.post("http://flask:5002/cover-letter", form, {
      headers: form.getHeaders(),
    });

    // Forward the JSON response back to the client
    res.json(response.data);
  } catch (error) {
    console.error("Error generating cover letter:", error.message);
    res.status(500).json({ error: "Error generating cover letter" });
  }
});

router.post("/", upload.single("pdf"), uploadFile);
router.get("/:filename", getFile);

module.exports = router;
