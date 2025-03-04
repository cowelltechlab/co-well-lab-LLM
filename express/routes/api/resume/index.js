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

router.post("/", upload.single("pdf"), uploadFile);
router.get("/:filename", getFile);

module.exports = router;
