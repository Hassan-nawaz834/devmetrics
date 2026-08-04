const axios = require('axios');

async function collectPaginatedData(requestFn, { perPage = 100 } = {}) {
  const allItems = [];
  let page = 1;

  while (true) {
    const response = await requestFn(page);
    const items = response?.data || [];

    if (!Array.isArray(items)) {
      break;
    }

    allItems.push(...items);

    if (items.length === 0) {
      break;
    }

    page += 1;
  }

  return allItems;
}

async function fetchGitHubUserData(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json'
  };

  const [repos, events] = await Promise.all([
    collectPaginatedData(async (page) => axios.get(`https://api.github.com/user/repos?per_page=100&sort=updated&page=${page}`, { headers })),
    collectPaginatedData(async (page) => axios.get(`https://api.github.com/users?per_page=5&page=${page}`, { headers }))
  ]);

  const normalizedRepos = repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner?.login || '',
    private: repo.private,
    visibility: repo.private ? 'private' : 'public',
    updatedAt: repo.updated_at,
    language: repo.language,
    defaultBranch: repo.default_branch
  }));

  const commits = [];
  for (const repo of normalizedRepos.slice(0, 20)) {
    try {
      const response = await axios.get(`https://api.github.com/repos/${repo.fullName}/commits?per_page=10`, { headers });
      response.data.forEach((item) => {
        commits.push({
          repoName: repo.name,
          visibility: repo.visibility,
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

  return { repos: normalizedRepos, commits, events };
}

module.exports = {
  fetchGitHubUserData,
  collectPaginatedData
};
