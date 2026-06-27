const express = require("express");
const axios = require("axios");
const router = express.Router();

// Helper function for activity icons
function getEventIcon(type) {
    const icons = {
        'PushEvent': 'fa-code-commit',
        'CreateEvent': 'fa-plus-circle',
        'DeleteEvent': 'fa-trash',
        'WatchEvent': 'fa-eye',
        'ForkEvent': 'fa-code-branch',
        'IssuesEvent': 'fa-exclamation-circle',
        'PullRequestEvent': 'fa-code-pull-request',
        'ReleaseEvent': 'fa-tag'
    };
    return icons[type] || 'fa-circle';
}

// PROFILE RATING FUNCTION
function calculateProfileRating(data) {
    const {
        followers,
        following,
        public_repos,
        total_stars,
        total_forks,
        languages,
        account_age_days,
        bio,
        company,
        location,
        blog,
        twitter_username
    } = data;

    let score = 0;
    const breakdown = {};

    // 1. Followers Score (20 points)
    let followersScore = 0;
    if (followers >= 1000) followersScore = 20;
    else if (followers >= 500) followersScore = 18;
    else if (followers >= 100) followersScore = 15;
    else if (followers >= 50) followersScore = 12;
    else if (followers >= 10) followersScore = 8;
    else if (followers >= 5) followersScore = 5;
    else followersScore = 2;
    score += followersScore;
    breakdown.followers = followersScore;

    // 2. Repository Quality (25 points)
    let starsScore = 0;
    if (total_stars >= 1000) starsScore = 12;
    else if (total_stars >= 500) starsScore = 10;
    else if (total_stars >= 100) starsScore = 8;
    else if (total_stars >= 50) starsScore = 6;
    else if (total_stars >= 10) starsScore = 4;
    else starsScore = 1;
    
    let forksScore = 0;
    if (total_forks >= 500) forksScore = 8;
    else if (total_forks >= 100) forksScore = 6;
    else if (total_forks >= 50) forksScore = 4;
    else if (total_forks >= 10) forksScore = 2;
    else forksScore = 1;
    
    let repoScore = 0;
    if (public_repos >= 50) repoScore = 5;
    else if (public_repos >= 30) repoScore = 4;
    else if (public_repos >= 15) repoScore = 3;
    else if (public_repos >= 5) repoScore = 2;
    else repoScore = 1;
    
    const repoQualityScore = starsScore + forksScore + repoScore;
    score += repoQualityScore;
    breakdown.repoQuality = repoQualityScore;

    // 3. Activity Score (20 points)
    let activityScore = 0;
    if (account_age_days >= 365 * 3) activityScore += 6;
    else if (account_age_days >= 365 * 2) activityScore += 5;
    else if (account_age_days >= 365) activityScore += 4;
    else if (account_age_days >= 180) activityScore += 2;
    else activityScore += 1;
    
    const ratio = followers / (following + 1);
    if (ratio >= 5) activityScore += 7;
    else if (ratio >= 2) activityScore += 5;
    else if (ratio >= 1) activityScore += 3;
    else activityScore += 1;
    
    const reposPerYear = public_repos / (account_age_days / 365);
    if (reposPerYear >= 20) activityScore += 7;
    else if (reposPerYear >= 10) activityScore += 5;
    else if (reposPerYear >= 5) activityScore += 3;
    else activityScore += 1;
    
    score += activityScore;
    breakdown.activity = activityScore;

    // 4. Profile Completeness (15 points)
    let completenessScore = 0;
    if (bio && bio.length > 20) completenessScore += 4;
    else if (bio) completenessScore += 2;
    
    if (company) completenessScore += 3;
    if (location) completenessScore += 3;
    if (blog) completenessScore += 3;
    if (twitter_username) completenessScore += 2;
    
    score += completenessScore;
    breakdown.completeness = completenessScore;

    // 5. Language Diversity (10 points)
    const languageCount = Object.keys(languages || {}).length;
    let languageScore = 0;
    if (languageCount >= 10) languageScore = 10;
    else if (languageCount >= 7) languageScore = 8;
    else if (languageCount >= 5) languageScore = 6;
    else if (languageCount >= 3) languageScore = 4;
    else if (languageCount >= 1) languageScore = 2;
    else languageScore = 0;
    score += languageScore;
    breakdown.languageDiversity = languageScore;

    // 6. Account Age Bonus (10 points)
    let ageScore = 0;
    if (account_age_days >= 365 * 5) ageScore = 10;
    else if (account_age_days >= 365 * 3) ageScore = 8;
    else if (account_age_days >= 365 * 2) ageScore = 6;
    else if (account_age_days >= 365) ageScore = 4;
    else if (account_age_days >= 180) ageScore = 2;
    else ageScore = 1;
    score += ageScore;
    breakdown.accountAge = ageScore;

    const maxScore = 100;
    const finalScore = Math.min(Math.round(score), maxScore);

    let tier = "Bronze";
    let tierColor = "#CD7F32";
    let badge = "🥉";
    if (finalScore >= 90) {
        tier = "Diamond";
        tierColor = "#B9F2FF";
        badge = "💎";
    } else if (finalScore >= 80) {
        tier = "Platinum";
        tierColor = "#E5E4E2";
        badge = "🥇";
    } else if (finalScore >= 70) {
        tier = "Gold";
        tierColor = "#FFD700";
        badge = "🥇";
    } else if (finalScore >= 60) {
        tier = "Silver";
        tierColor = "#C0C0C0";
        badge = "🥈";
    } else if (finalScore >= 40) {
        tier = "Bronze";
        tierColor = "#CD7F32";
        badge = "🥉";
    } else {
        tier = "Starter";
        tierColor = "#8B8B9E";
        badge = "🌱";
    }

    return {
        score: finalScore,
        tier: tier,
        tierColor: tierColor,
        badge: badge,
        breakdown: breakdown
    };
}

// SUGGESTIONS FUNCTION
function generateSuggestions(data) {
    const {
        followers,
        following,
        public_repos,
        total_stars,
        total_forks,
        languages,
        account_age_days,
        bio,
        company,
        location,
        blog,
        twitter_username,
        name
    } = data;

    const suggestions = [];
    const priority = [];

    // 1. Profile Completeness Suggestions
    if (!bio || bio.length < 20) {
        suggestions.push({
            category: "Profile Completeness",
            icon: "📝",
            title: "Add a detailed bio",
            description: "Your bio is empty or too short. Add a compelling bio that describes your skills, interests, and what you're working on.",
            action: "Go to GitHub Settings → Profile → Edit Bio",
            priority: "high"
        });
        priority.push("high");
    }

    if (!company) {
        suggestions.push({
            category: "Profile Completeness",
            icon: "🏢",
            title: "Add your company or organization",
            description: "Adding your company or organization helps others understand your professional background.",
            action: "Go to GitHub Settings → Profile → Add Company",
            priority: "medium"
        });
    }

    if (!location) {
        suggestions.push({
            category: "Profile Completeness",
            icon: "📍",
            title: "Add your location",
            description: "Adding your location makes it easier for others to connect with you locally.",
            action: "Go to GitHub Settings → Profile → Add Location",
            priority: "medium"
        });
    }

    if (!blog && !twitter_username) {
        suggestions.push({
            category: "Profile Completeness",
            icon: "🔗",
            title: "Add social links",
            description: "Add your website, blog, or Twitter/X profile to help others connect with you.",
            action: "Go to GitHub Settings → Profile → Add Social Links",
            priority: "medium"
        });
    }

    if (!name) {
        suggestions.push({
            category: "Profile Completeness",
            icon: "👤",
            title: "Add your full name",
            description: "Your profile shows your username only. Adding your full name makes your profile more professional.",
            action: "Go to GitHub Settings → Profile → Add Name",
            priority: "high"
        });
        priority.push("high");
    }

    // 2. Activity & Engagement Suggestions
    if (followers < 10) {
        suggestions.push({
            category: "Community Engagement",
            icon: "👥",
            title: "Grow your followers",
            description: "You have few followers. Engage with the community by contributing to open source, commenting on issues, and sharing your work.",
            action: "Star and fork interesting repos, contribute to open source projects",
            priority: "medium"
        });
    }

    if (following > followers * 3 && followers > 0) {
        suggestions.push({
            category: "Community Engagement",
            icon: "⚖️",
            title: "Balance following vs followers",
            description: `You follow ${following} users but only have ${followers} followers. Try to engage more and build a better following ratio.`,
            action: "Focus on quality contributions to attract more followers",
            priority: "medium"
        });
    }

    if (public_repos < 5) {
        suggestions.push({
            category: "Repository Activity",
            icon: "📦",
            title: "Create more repositories",
            description: "You have very few repositories. Start building personal projects to showcase your skills.",
            action: "Create a new repository and start coding!",
            priority: "high"
        });
        priority.push("high");
    }

    if (total_stars === 0 && public_repos > 0) {
        suggestions.push({
            category: "Repository Activity",
            icon: "⭐",
            title: "Get stars on your repositories",
            description: "Your repositories have no stars. Focus on creating useful, well-documented projects that others will find valuable.",
            action: "Improve your README, add examples, and share your projects on social media",
            priority: "medium"
        });
    }

    if (total_stars < 10 && public_repos >= 5) {
        suggestions.push({
            category: "Repository Activity",
            icon: "⭐",
            title: "Increase repository visibility",
            description: "Your projects need more visibility. Share them on Twitter, LinkedIn, and relevant communities.",
            action: "Share your projects on social media and relevant forums",
            priority: "low"
        });
    }

    // 3. Language Diversity Suggestions
    const languageCount = Object.keys(languages || {}).length;
    if (languageCount < 3) {
        suggestions.push({
            category: "Skill Development",
            icon: "💻",
            title: "Learn more programming languages",
            description: `You only use ${languageCount} language${languageCount === 1 ? '' : 's'}. Expand your skills by learning new technologies.`,
            action: "Try Python, JavaScript, TypeScript, Go, or Rust",
            priority: "medium"
        });
    }

    if (languageCount >= 1 && Object.keys(languages || {}).some(lang => lang === "HTML" || lang === "CSS")) {
        const hasOnlyFrontend = Object.keys(languages || {}).every(lang => 
            ["HTML", "CSS", "JavaScript", "TypeScript", "SCSS", "Sass"].includes(lang)
        );
        if (hasOnlyFrontend && languageCount < 5) {
            suggestions.push({
                category: "Skill Development",
                icon: "🚀",
                title: "Explore backend technologies",
                description: "Your projects are primarily frontend-focused. Consider learning backend technologies like Node.js, Python, or Go.",
                action: "Build a full-stack project with Node.js/Express or Django",
                priority: "low"
            });
        }
    }

    // 4. Account Age Suggestions
    if (account_age_days < 180) {
        suggestions.push({
            category: "Account Growth",
            icon: "🌱",
            title: "Stay consistent!",
            description: "Your GitHub account is still new. Keep contributing regularly to build your profile.",
            action: "Set a goal: contribute at least once a week",
            priority: "medium"
        });
    }

    if (account_age_days > 365 && public_repos < 10) {
        suggestions.push({
            category: "Account Growth",
            icon: "📈",
            title: "Increase your contribution rate",
            description: `You've been on GitHub for ${Math.round(account_age_days/365)} years but have only ${public_repos} repositories. Try to be more active.`,
            action: "Start a new project or contribute to existing ones",
            priority: "high"
        });
        priority.push("high");
    }

    // 5. Special Suggestions based on ratings
    if (total_forks > total_stars && total_stars > 0) {
        suggestions.push({
            category: "Repository Quality",
            icon: "🔀",
            title: "Create more original content",
            description: "Your repositories are forked more than they're starred. Focus on creating original, valuable content.",
            action: "Build something unique that solves a real problem",
            priority: "low"
        });
    }

    // Determine overall recommendation
    const highPriorityCount = priority.filter(p => p === "high").length;
    let overallMessage = "";
    let overallIcon = "";

    if (highPriorityCount === 0 && suggestions.length < 3) {
        overallMessage = "🌟 Your profile looks great! Keep up the good work!";
        overallIcon = "🌟";
    } else if (highPriorityCount >= 3) {
        overallMessage = "🚀 Focus on high-priority improvements to boost your profile significantly!";
        overallIcon = "🚀";
    } else if (highPriorityCount >= 1) {
        overallMessage = "📈 You're on the right track! Address the high-priority suggestions first.";
        overallIcon = "📈";
    } else {
        overallMessage = "💪 Keep improving! Every small change makes a difference.";
        overallIcon = "💪";
    }

    return {
        overall: {
            message: overallMessage,
            icon: overallIcon,
            suggestionCount: suggestions.length
        },
        suggestions: suggestions.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
    };
}

// Analyze GitHub Profile
router.get("/analyze/:username", async (req, res) => {
    try {
        const { username } = req.params;
        
        console.log(`🔍 Analyzing user: ${username}`);
        
        // Fetch user data and repos in parallel
        const [userResponse, reposResponse] = await Promise.all([
            axios.get(`https://api.github.com/users/${username}`),
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
        ]);
        
        // Calculate language stats
        const languages = {};
        let totalStars = 0;
        let totalForks = 0;
        
        reposResponse.data.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
            totalStars += repo.stargazers_count || 0;
            totalForks += repo.forks_count || 0;
        });
        
        // Find top language
        let topLanguage = "N/A";
        let maxCount = 0;
        for (const [lang, count] of Object.entries(languages)) {
            if (count > maxCount) {
                maxCount = count;
                topLanguage = lang;
            }
        }
        
        // Account age
        const createdDate = new Date(userResponse.data.created_at);
        const now = new Date();
        const accountAgeDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        // Prepare data for rating and suggestions
        const profileData = {
            username: userResponse.data.login,
            name: userResponse.data.name,
            followers: userResponse.data.followers,
            following: userResponse.data.following,
            public_repos: userResponse.data.public_repos,
            total_stars: totalStars,
            total_forks: totalForks,
            languages: languages,
            account_age_days: accountAgeDays,
            bio: userResponse.data.bio,
            company: userResponse.data.company,
            location: userResponse.data.location,
            blog: userResponse.data.blog,
            twitter_username: userResponse.data.twitter_username
        };
        
        // Calculate rating
        const rating = calculateProfileRating(profileData);
        
        // Generate suggestions
        const suggestions = generateSuggestions(profileData);
        
        // Return data
        res.json({
            success: true,
            data: {
                username: userResponse.data.login,
                name: userResponse.data.name || userResponse.data.login,
                avatar_url: userResponse.data.avatar_url,
                bio: userResponse.data.bio || "No bio available",
                company: userResponse.data.company,
                location: userResponse.data.location,
                blog: userResponse.data.blog,
                twitter_username: userResponse.data.twitter_username,
                followers: userResponse.data.followers,
                following: userResponse.data.following,
                public_repos: userResponse.data.public_repos,
                public_gists: userResponse.data.public_gists,
                top_language: topLanguage,
                total_stars: totalStars,
                total_forks: totalForks,
                account_age_days: accountAgeDays,
                profile_url: userResponse.data.html_url,
                languages: languages,
                rating: rating,
                suggestions: suggestions  // ← ADD SUGGESTIONS
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.response && error.response.status === 404) {
            res.json({
                success: false,
                message: `User "${req.params.username}" not found on GitHub`
            });
        } else {
            res.json({
                success: false,
                message: 'Error fetching profile. Please try again.'
            });
        }
    }
});

// Get user activity
router.get("/activity/:username", async (req, res) => {
    try {
        const { username } = req.params;
        
        const response = await axios.get(
            `https://api.github.com/users/${username}/events/public?per_page=30`
        );
        
        const activities = response.data.map(event => ({
            type: event.type.replace('Event', ''),
            repo: event.repo.name,
            created_at: event.created_at,
            icon: getEventIcon(event.type)
        }));
        
        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.json({
            success: false,
            message: 'Error fetching activity'
        });
    }
});

// Health check
router.get("/health", (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = router;