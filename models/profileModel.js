const db = require("../config/db");

// Save or Update GitHub Profile
const saveProfile = (profile, callback) => {
    const sql = `
    INSERT INTO github_profiles (
        username,
        name,
        bio,
        followers,
        following,
        public_repos,
        public_gists,
        company,
        location,
        blog,
        avatar_url,
        profile_url,
        created_at_github,
        account_age_days,
        top_language,
        total_stars,
        total_forks
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        bio = VALUES(bio),
        followers = VALUES(followers),
        following = VALUES(following),
        public_repos = VALUES(public_repos),
        public_gists = VALUES(public_gists),
        company = VALUES(company),
        location = VALUES(location),
        blog = VALUES(blog),
        avatar_url = VALUES(avatar_url),
        profile_url = VALUES(profile_url),
        created_at_github = VALUES(created_at_github),
        account_age_days = VALUES(account_age_days),
        top_language = VALUES(top_language),
        total_stars = VALUES(total_stars),
        total_forks = VALUES(total_forks),
        analyzed_at = CURRENT_TIMESTAMP
    `;

    db.query(
        sql,
        [
            profile.username,
            profile.name,
            profile.bio,
            profile.followers,
            profile.following,
            profile.public_repos,
            profile.public_gists,
            profile.company,
            profile.location,
            profile.blog,
            profile.avatar_url,
            profile.profile_url,
            profile.created_at_github,
            profile.account_age_days,
            profile.top_language,
            profile.total_stars,
            profile.total_forks
        ],
        callback
    );
};

// Get All Profiles
const getAllProfiles = (callback) => {
    db.query("SELECT * FROM github_profiles", callback);
};

// Get One Profile
const getProfileByUsername = (username, callback) => {
    db.query(
        "SELECT * FROM github_profiles WHERE username = ?",
        [username],
        callback
    );
};

module.exports = {
    saveProfile,
    getAllProfiles,
    getProfileByUsername
};