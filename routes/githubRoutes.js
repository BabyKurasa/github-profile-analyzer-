const express = require("express");
const router = express.Router();

const {
    analyzeProfile,
    getProfiles,
    getProfile
} = require("../controllers/githubController");

// Analyze a GitHub profile
router.get("/analyze/:username", analyzeProfile);

// Get all analyzed profiles
router.get("/profiles", getProfiles);

// Get one analyzed profile
router.get("/profiles/:username", getProfile);

module.exports = router;