const axios = require("axios");

const fetchGitHubProfile = async (username) => {
    // Fetch user profile
    const profileResponse = await axios.get(
        `https://api.github.com/users/${username}`
    );

    // Fetch repositories
    const reposResponse = await axios.get(
        `https://api.github.com/users/${username}/repos?per_page=100`
    );

    const profile = profileResponse.data;
    const repos = reposResponse.data;

    let totalStars = 0;
    let totalForks = 0;
    const languageCount = {};

    repos.forEach((repo) => {
        totalStars += repo.stargazers_count;
        totalForks += repo.forks_count;

        if (repo.language) {
            languageCount[repo.language] =
                (languageCount[repo.language] || 0) + 1;
        }
    });

    const topLanguage =
        Object.keys(languageCount).length > 0
            ? Object.keys(languageCount).reduce((a, b) =>
                  languageCount[a] > languageCount[b] ? a : b
              )
            : "N/A";

    const accountAgeDays = Math.floor(
        (new Date() - new Date(profile.created_at)) /
            (1000 * 60 * 60 * 24)
    );

    return {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        public_repos: profile.public_repos,
        public_gists: profile.public_gists,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        avatar_url: profile.avatar_url,
        profile_url: profile.html_url,

        // Convert GitHub date to MySQL DATETIME format
        created_at_github: profile.created_at
            .replace("T", " ")
            .replace("Z", ""),

        account_age_days: accountAgeDays,
        top_language: topLanguage,
        total_stars: totalStars,
        total_forks: totalForks
    };
};

module.exports = { fetchGitHubProfile };