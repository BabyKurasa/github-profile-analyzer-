// Store profile data globally
let currentProfile = null;

// ============================================
// PAGE NAVIGATION
// ============================================

function switchPage(page) {
    // Hide all pages
    const homePage = document.getElementById('home-page');
    const suggestionsPage = document.getElementById('suggestions-page');
    const activityPage = document.getElementById('activity-page');
    const featuresPage = document.getElementById('features-page');
    
    if (homePage) homePage.style.display = 'none';
    if (suggestionsPage) suggestionsPage.style.display = 'none';
    if (activityPage) activityPage.style.display = 'none';
    if (featuresPage) featuresPage.style.display = 'none';
    
    // Show selected page
    if (page === 'home') {
        if (homePage) homePage.style.display = 'flex';
        if (featuresPage) featuresPage.style.display = 'block';
    } else if (page === 'suggestions') {
        if (suggestionsPage) suggestionsPage.style.display = 'block';
        if (currentProfile) showSuggestionsPage(currentProfile);
    } else if (page === 'activity') {
        if (activityPage) activityPage.style.display = 'block';
        if (currentProfile) showActivityPage(currentProfile);
    }
    
    // Update nav links
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const pages = ['home', 'suggestions', 'activity'];
    const idx = pages.indexOf(page);
    if (idx !== -1) {
        const links = document.querySelectorAll('.nav-links a');
        if (links[idx]) links[idx].classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function searchUser(username) {
    document.getElementById('username').value = username;
    analyzeProfile();
}

// ============================================
// MAIN ANALYZE FUNCTION
// ============================================

async function analyzeProfile() {
    const username = document.getElementById("username").value.trim();
    const resultDiv = document.getElementById("result");

    if (!username) {
        showError("Please enter a GitHub username");
        return;
    }

    // Show loading
    resultDiv.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <h3>Analyzing ${username}'s profile...</h3>
            <p style="color: #5a5a72;">Fetching repositories, languages, and insights</p>
        </div>
    `;

    try {
        const response = await fetch(`/api/analyze/${username}`);
        const data = await response.json();

        if (!data.success) {
            showError(data.message || "User not found");
            return;
        }

        currentProfile = data.data;
        displayProfile(currentProfile);
        switchPage('home');
        
    } catch (error) {
        console.error('Error:', error);
        showError("Network error. Please check your connection.");
    }
}

// ============================================
// DISPLAY PROFILE
// ============================================

function displayProfile(profile) {
    const resultDiv = document.getElementById("result");
    
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num;
    };

    const hasLanguages = profile.languages && Object.keys(profile.languages).length > 0;
    const rating = profile.rating || { score: 0, tier: 'Unknown', badge: '❓', tierColor: '#8B8B9E' };
    const suggestions = profile.suggestions || { overall: { message: '', icon: '💡' }, suggestions: [] };

    resultDiv.innerHTML = `
        <div class="profile-card">
            <!-- Navigation Buttons -->
            <div class="page-nav-buttons">
                <button class="page-nav-btn active" onclick="showProfileTab('profile')">
                    <i class="fas fa-user"></i> Profile
                </button>
                <button class="page-nav-btn" onclick="showProfileTab('suggestions')">
                    <i class="fas fa-lightbulb"></i> Suggestions (${suggestions.suggestions.length})
                </button>
                <button class="page-nav-btn" onclick="showProfileTab('activity')">
                    <i class="fas fa-clock"></i> Activity
                </button>
                <button class="page-nav-btn" onclick="showProfileTab('chart')">
                    <i class="fas fa-chart-pie"></i> Languages
                </button>
            </div>

            <!-- Profile Tab -->
            <div id="profile-tab">
                <div class="profile-header">
                    <img 
                        src="${profile.avatar_url}" 
                        alt="${profile.username}'s avatar" 
                        class="profile-avatar"
                        onerror="this.src='https://ui-avatars.com/api/?name=${profile.username}&background=667eea&color=fff&size=120'"
                    />
                    <div class="profile-info">
                        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                            <h2>${profile.name || profile.username}</h2>
                            <span style="background: ${rating.tierColor}22; border: 2px solid ${rating.tierColor}; color: ${rating.tierColor}; padding: 0.3rem 1rem; border-radius: 50px; font-weight: 700; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem;">
                                ${rating.badge} ${rating.tier}
                                <span style="background: ${rating.tierColor}; color: #0a0a0f; padding: 0.1rem 0.5rem; border-radius: 20px; font-size: 0.8rem;">${rating.score}/100</span>
                            </span>
                        </div>
                        <div class="username">
                            <i class="fab fa-github"></i> @${profile.username}
                        </div>
                        <div class="bio">${profile.bio || "🚀 Developer • Open Source Enthusiast"}</div>
                        <div style="margin-top: 0.8rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                            ${profile.company ? `<span style="background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem;"><i class="fas fa-building"></i> ${profile.company}</span>` : ''}
                            ${profile.location ? `<span style="background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem;"><i class="fas fa-map-marker-alt"></i> ${profile.location}</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Rating Breakdown -->
                <div style="background: rgba(255,255,255,0.03); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="margin-bottom: 1rem; text-align: center;">📊 Rating Breakdown</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                        ${Object.entries(rating.breakdown || {}).map(([key, value]) => `
                            <div style="text-align: center;">
                                <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">${value}</div>
                                <div style="color: #5a5a72; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px;">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 1rem; background: rgba(255,255,255,0.05); border-radius: 50px; height: 8px; overflow: hidden;">
                        <div style="width: ${rating.score}%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2, #f093fb); border-radius: 50px; transition: width 1s ease;"></div>
                    </div>
                </div>

                <div class="profile-stats-grid">
                    <div class="stat-item"><div class="stat-value">${formatNumber(profile.followers)}</div><div class="stat-label"><i class="fas fa-users"></i> Followers</div></div>
                    <div class="stat-item"><div class="stat-value">${formatNumber(profile.following)}</div><div class="stat-label"><i class="fas fa-user-plus"></i> Following</div></div>
                    <div class="stat-item"><div class="stat-value">${profile.public_repos}</div><div class="stat-label"><i class="fas fa-code"></i> Repositories</div></div>
                    <div class="stat-item"><div class="stat-value">${profile.public_gists || 0}</div><div class="stat-label"><i class="fas fa-paste"></i> Gists</div></div>
                    <div class="stat-item"><div class="stat-value">${profile.total_stars || 0}</div><div class="stat-label"><i class="fas fa-star"></i> Total Stars</div></div>
                    <div class="stat-item"><div class="stat-value">${profile.total_forks || 0}</div><div class="stat-label"><i class="fas fa-code-branch"></i> Forks</div></div>
                    <div class="stat-item"><div class="stat-value">${profile.top_language || "N/A"}</div><div class="stat-label"><i class="fas fa-terminal"></i> Top Language</div></div>
                    <div class="stat-item"><div class="stat-value">${profile.account_age_days || 0}</div><div class="stat-label"><i class="fas fa-calendar-alt"></i> Days on GitHub</div></div>
                </div>

                <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 2rem; justify-content: center;">
                    <a href="${profile.profile_url}" target="_blank" class="profile-link">
                        <i class="fab fa-github"></i> View Profile
                    </a>
                    <button onclick='exportProfile(${JSON.stringify(profile).replace(/'/g, "\\'")})' class="profile-link" style="background: #2d3748; border: none; cursor: pointer;">
                        <i class="fas fa-download"></i> Export JSON
                    </button>
                </div>
            </div>

            <!-- Suggestions Tab (Hidden) -->
            <div id="suggestions-tab" style="display: none;"></div>

            <!-- Activity Tab (Hidden) -->
            <div id="activity-tab" style="display: none;"></div>

            <!-- Chart Tab (Hidden) -->
            <div id="chart-tab" style="display: none;">
                ${hasLanguages ? `
                <div id="chart-container" style="margin-top: 1rem;">
                    <h3 style="margin-bottom: 1rem; text-align: center;">📊 Language Distribution</h3>
                    <div style="max-width: 400px; margin: 0 auto;">
                        <canvas id="languageChart"></canvas>
                    </div>
                </div>
                ` : '<p style="text-align:center; color:#5a5a72;">No language data available</p>'}
            </div>
        </div>
    `;

    // Store suggestions in hidden div for tab switching
    if (profile.suggestions) {
        document.getElementById('suggestions-tab').innerHTML = buildSuggestionsHTML(profile.suggestions);
    }
    
    if (hasLanguages) {
        setTimeout(() => {
            createLanguageChart(profile.languages);
        }, 100);
    }

    // Fetch activity for activity tab
    if (profile.username) {
        fetchActivityForTab(profile.username);
    }

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// TAB SWITCHING
// ============================================

function showProfileTab(tab) {
    // Hide all tabs
    const tabs = ['profile-tab', 'suggestions-tab', 'activity-tab', 'chart-tab'];
    tabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    
    // Show selected tab
    const tabMap = {
        'profile': 'profile-tab',
        'suggestions': 'suggestions-tab',
        'activity': 'activity-tab',
        'chart': 'chart-tab'
    };
    const selectedTab = document.getElementById(tabMap[tab]);
    if (selectedTab) selectedTab.style.display = 'block';
    
    // Update button styles
    document.querySelectorAll('.page-nav-btn').forEach(btn => btn.classList.remove('active'));
    const btns = document.querySelectorAll('.page-nav-btn');
    const tabIndex = ['profile', 'suggestions', 'activity', 'chart'].indexOf(tab);
    if (btns[tabIndex]) btns[tabIndex].classList.add('active');
}

// ============================================
// SUGGESTIONS
// ============================================

function buildSuggestionsHTML(suggestions) {
    if (!suggestions || suggestions.suggestions.length === 0) {
        return `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #4BC0C0;"></i>
                <h3>🎉 No suggestions needed!</h3>
                <p style="color: #8b8b9e;">Your profile looks great!</p>
            </div>
        `;
    }
    
    return `
        <div style="margin-top: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                <span style="font-size: 1.5rem;">${suggestions.overall.icon || '💡'}</span>
                <h3 style="margin: 0;">Profile Suggestions</h3>
                <span style="background: rgba(102,126,234,0.2); padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem; color: #667eea;">
                    ${suggestions.suggestions.length} tips
                </span>
            </div>
            <p style="color: #8b8b9e; margin-bottom: 1.5rem;">${suggestions.overall.message || 'Here are some ways to improve your GitHub profile:'}</p>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                ${suggestions.suggestions.map((suggestion) => `
                    <div class="suggestion-card ${suggestion.priority}">
                        <div style="font-size: 1.5rem;">${suggestion.icon}</div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                <strong>${suggestion.title}</strong>
                                <span style="background: ${suggestion.priority === 'high' ? '#ef444422' : suggestion.priority === 'medium' ? '#f59e0b22' : '#667eea22'}; color: ${suggestion.priority === 'high' ? '#ef4444' : suggestion.priority === 'medium' ? '#f59e0b' : '#667eea'}; padding: 0.1rem 0.6rem; border-radius: 20px; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">${suggestion.priority}</span>
                            </div>
                            <p style="color: #8b8b9e; font-size: 0.9rem; margin: 0.3rem 0;">${suggestion.description}</p>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 8px; font-size: 0.8rem; color: #667eea; display: inline-block; margin-top: 0.3rem;">
                                <i class="fas fa-lightbulb"></i> ${suggestion.action}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showSuggestionsPage(profile) {
    const content = document.getElementById('suggestions-content');
    if (!content) return;
    
    if (profile.suggestions) {
        content.innerHTML = buildSuggestionsHTML(profile.suggestions);
    } else {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                <h3>No suggestions available</h3>
                <p style="color: #8b8b9e;">Try analyzing a different profile</p>
            </div>
        `;
    }
}

// ============================================
// ACTIVITY
// ============================================

async function fetchActivityForTab(username) {
    try {
        const response = await fetch(`/api/activity/${username}`);
        const data = await response.json();
        
        const activityTab = document.getElementById('activity-tab');
        if (!activityTab) return;
        
        if (!data.success || data.data.length === 0) {
            activityTab.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #5a5a72; margin-bottom: 1rem;"></i>
                    <h4 style="color: #8b8b9e; margin-top: 0.5rem;">No Recent Activity</h4>
                    <p style="color: #5a5a72; font-size: 0.95rem; max-width: 400px; margin: 0.5rem auto;">
                        @${username} hasn't created any public events recently.
                    </p>
                    <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); max-width: 400px; margin-left: auto; margin-right: auto;">
                        <p style="color: #667eea; font-size: 0.85rem; margin: 0;">
                            <i class="fas fa-lightbulb"></i> 
                            Try searching for <strong style="color: #fff; cursor: pointer;" onclick="searchUser('torvalds')">torvalds</strong> or <strong style="color: #fff; cursor: pointer;" onclick="searchUser('gaearon')">gaearon</strong> to see activity
                        </p>
                    </div>
                </div>
            `;
            return;
        }
        
        activityTab.innerHTML = `
            <div style="margin-top: 1rem;">
                <h3 style="margin-bottom: 1rem;">📈 Recent Activity for @${username}</h3>
                ${data.data.slice(0, 15).map(activity => {
                    const timeAgo = getTimeAgo(new Date(activity.created_at));
                    return `
                        <div style="display: flex; align-items: center; gap: 1rem; padding: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 0.5rem; transition: all 0.3s ease;" 
                             onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
                             onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                            <i class="fas ${activity.icon}" style="color: #667eea; width: 20px; font-size: 1.1rem;"></i>
                            <div style="flex: 1;">
                                <span style="font-weight: 600;">${activity.type}</span>
                                <span style="color: #8b8b9e; font-size: 0.9rem;">on <span style="color: #667eea;">${activity.repo}</span></span>
                            </div>
                            <span style="color: #5a5a72; font-size: 0.8rem; white-space: nowrap;">${timeAgo}</span>
                        </div>
                    `;
                }).join('')}
                ${data.data.length > 15 ? `<p style="text-align: center; color: #5a5a72; margin-top: 1rem; font-size: 0.85rem;">Showing 15 of ${data.data.length} events</p>` : ''}
            </div>
        `;
    } catch (error) {
        console.error('Error fetching activity:', error);
        const activityTab = document.getElementById('activity-tab');
        if (activityTab) {
            activityTab.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #ef4444;"></i>
                    <h4 style="color: #ef4444; margin-top: 0.5rem;">Error loading activity</h4>
                    <p style="color: #8b8b9e;">Please try again later</p>
                </div>
            `;
        }
    }
}

function showActivityPage(profile) {
    const content = document.getElementById('activity-content');
    if (!content) return;
    
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea;"></i>
            <p style="color: #8b8b9e; margin-top: 1rem;">Loading activity for @${profile.username}...</p>
        </div>
    `;
    
    fetch(`/api/activity/${profile.username}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success || data.data.length === 0) {
                content.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <i class="fas fa-inbox" style="font-size: 3rem; color: #5a5a72; margin-bottom: 1rem;"></i>
                        <h3 style="color: #8b8b9e;">No Recent Activity</h3>
                        <p style="color: #5a5a72; max-width: 400px; margin: 0.5rem auto;">
                            @${profile.username} hasn't created any public events recently.
                        </p>
                        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 10px; max-width: 400px; margin-left: auto; margin-right: auto;">
                            <p style="color: #667eea; font-size: 0.85rem;">
                                <i class="fas fa-lightbulb"></i> 
                                Try <strong style="color: #fff; cursor: pointer;" onclick="searchUser('torvalds')">torvalds</strong> or 
                                <strong style="color: #fff; cursor: pointer;" onclick="searchUser('gaearon')">gaearon</strong> for active profiles
                            </p>
                        </div>
                    </div>
                `;
                return;
            }
            
            content.innerHTML = `
                <div style="margin-top: 1rem;">
                    <h3 style="margin-bottom: 1rem;">📈 Recent Activity for @${profile.username}</h3>
                    ${data.data.slice(0, 20).map(activity => {
                        const timeAgo = getTimeAgo(new Date(activity.created_at));
                        return `
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 0.5rem;">
                                <i class="fas ${activity.icon}" style="color: #667eea; width: 20px;"></i>
                                <div style="flex: 1;">
                                    <span style="font-weight: 600;">${activity.type}</span>
                                    <span style="color: #8b8b9e; font-size: 0.9rem;">on ${activity.repo}</span>
                                </div>
                                <span style="color: #5a5a72; font-size: 0.8rem;">${timeAgo}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        })
        .catch(() => {
            content.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #ef4444;"></i>
                    <h4 style="color: #ef4444; margin-top: 0.5rem;">Error loading activity</h4>
                    <p style="color: #8b8b9e;">Please try again later</p>
                </div>
            `;
        });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createLanguageChart(languages) {
    const ctx = document.getElementById('languageChart');
    if (!ctx) return;

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const labels = Object.keys(languages);
    const data = Object.values(languages);
    
    const sorted = labels.map((label, i) => ({ label, value: data[i] })).sort((a, b) => b.value - a.value);
    const top5 = sorted.slice(0, 5);
    const otherCount = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
    const finalLabels = top5.map(item => item.label);
    const finalData = top5.map(item => item.value);
    
    if (otherCount > 0) { finalLabels.push('Others'); finalData.push(otherCount); }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: finalLabels,
            datasets: [{
                data: finalData,
                backgroundColor: colors.slice(0, finalLabels.length),
                borderWidth: 2,
                borderColor: '#1a1a2e'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#e4e4e7', font: { size: 12 } }
                }
            },
            cutout: '60%'
        }
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, seconds] of Object.entries(intervals)) {
        const count = Math.floor(diff / seconds);
        if (count >= 1) { return `${count} ${unit}${count > 1 ? 's' : ''} ago`; }
    }
    return 'Just now';
}

function exportProfile(profile) {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${profile.username}_github_profile.json`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
}

function showError(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <h3>${message}</h3>
            <p style="color: #5a5a72; margin-top: 0.5rem;">Try searching for another username</p>
        </div>
    `;
}