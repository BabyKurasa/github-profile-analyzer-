const { fetchGitHubProfile } = require("../services/githubService");
const {
    saveProfile,
    getAllProfiles,
    getProfileByUsername
} = require("../models/profileModel");

// Analyze GitHub Profile
const analyzeProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const profile = await fetchGitHubProfile(username);

        saveProfile(profile, (err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Profile analyzed successfully",
                data: profile
            });
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// Get all stored profiles
const getProfiles = (req, res) => {
    getAllProfiles((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json(results);
    });
};

// Get one stored profile
const getProfile = (req, res) => {
    const { username } = req.params;

    getProfileByUsername(username, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        res.json(results[0]);
    });
};

module.exports = {
    analyzeProfile,
    getProfiles,
    getProfile
};