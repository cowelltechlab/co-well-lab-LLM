const express = require("express");
const router = express.Router();
const axios = require("axios");

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

router.post("/", upload.single("pdf"), uploadFile);
router.get("/:filename", getFile);

module.exports = router;
