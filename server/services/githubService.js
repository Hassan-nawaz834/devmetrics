const axios = require('axios');

async function fetchGitHubUserData(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json'
  };

  const [reposResponse, eventsResponse] = await Promise.all([
    axios.get('https://api.github.com/user/repos?per_page=100&sort=updated', { headers }),
    axios.get('https://api.github.com/users?per_page=5', { headers })
  ]);

  const repos = reposResponse.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    updatedAt: repo.updated_at,
    language: repo.language
  }));

  const commits = [];
  for (const repo of repos.slice(0, 10)) {
    try {
      const response = await axios.get(`https://api.github.com/repos/${repo.fullName}/commits?per_page=10`, { headers });
      response.data.forEach((item) => {
        commits.push({
          repoName: repo.name,
          sha: item.sha,
          message: item.commit.message,
          date: item.commit.author?.date || new Date().toISOString(),
          author: item.commit.author?.name || 'Unknown'
        });
      });
    } catch (error) {
      console.error(`Unable to fetch commits for ${repo.fullName}`, error.message);
    }
  }

  return { repos, commits, events: eventsResponse.data };
}

module.exports = {
  fetchGitHubUserData
};
