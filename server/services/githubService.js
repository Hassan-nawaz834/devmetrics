// server/services/githubService.js
const { Octokit } = require('@octokit/rest');

class GitHubService {
  constructor() {
    this.octokit = null;
  }

  initialize(token) {
    if (!token) throw new Error('GitHub token is required');
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'DevMetrics App v1.0'
    });
  }

  async getUserRepositories(username, token) {
    try {
      this.initialize(token);

      const { data: repos } = await this.octokit.repos.listForAuthenticatedUser({
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      });

      const repoData = await Promise.all(
        repos.map(async (repo) => {
          let totalCommits = 0;
          let languages = {};

          try {
            const { headers } = await this.octokit.repos.listCommits({
              owner: repo.owner.login,
              repo: repo.name,
              per_page: 1
            });
            const link = headers.link || '';
            const match = link.match(/page=(\d+)>; rel="last"/);
            totalCommits = match ? parseInt(match[1], 10) : 1;
          } catch {
            totalCommits = 0;
          }

          try {
            const { data } = await this.octokit.repos.listLanguages({
              owner: repo.owner.login,
              repo: repo.name
            });
            languages = data || {};
          } catch {
            languages = {};
          }

          return {
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || '',
            private: repo.private,
            visibility: repo.private ? 'private' : 'public',
            url: repo.html_url,
            cloneUrl: repo.clone_url,
            defaultBranch: repo.default_branch || 'main',
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            size: repo.size || 0,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            watchers: repo.watchers_count || 0,
            openIssues: repo.open_issues_count || 0,
            language: repo.language || 'N/A',
            languages,
            commitCount: totalCommits,
            owner: repo.owner.login
          };
        })
      );

      return {
        success: true,
        repositories: repoData,
        total: repoData.length,
        publicCount: repoData.filter((r) => !r.private).length,
        privateCount: repoData.filter((r) => r.private).length
      };
    } catch (error) {
      console.error('Error fetching repositories:', error.message);
      return { success: false, error: error.message, repositories: [] };
    }
  }

  // ---------- MAIN SYNC - LAST 30 DAYS ----------
  async syncAllRepositories(username, token, userId) {
    try {
      this.initialize(token);

      const { data: authUser } = await this.octokit.users.getAuthenticated();
      const login = authUser.login;

      console.log(`🔍 Syncing commits for user: ${login} (ID: ${userId})`);

      const repoResult = await this.getUserRepositories(login, token);
      if (!repoResult.success) return repoResult;

      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceISO = since.toISOString();

      console.log(`📅 Fetching commits since: ${sinceISO}`);

      const allCommits = [];
      // Sync more repos for better data (up to 50)
      const maxRepos = Math.min(repoResult.repositories.length, 50);

      for (let i = 0; i < maxRepos; i++) {
        const repo = repoResult.repositories[i];
        console.log(`📂 Processing repo: ${repo.name} (${i + 1}/${maxRepos})`);

        try {
          // Get commits by this user in the last 30 days
          const { data: commits } = await this.octokit.repos.listCommits({
            owner: repo.owner || login,
            repo: repo.name,
            author: login,
            since: sinceISO,
            per_page: 100
          });

          console.log(`  📝 Found ${commits.length} commits in ${repo.name}`);

          for (const c of commits || []) {
            const dateStr = c.commit?.author?.date || c.commit?.committer?.date;
            if (!dateStr) continue;

            const d = new Date(dateStr);
            if (d < since) continue;

            let additions = 0;
            let deletions = 0;
            try {
              if (c.stats) {
                additions = c.stats.additions || 0;
                deletions = c.stats.deletions || 0;
              }
            } catch {
              // ignore
            }

            allCommits.push({
              sha: c.sha,
              repoName: repo.name,
              visibility: repo.visibility || (repo.private ? 'private' : 'public'),
              date: d.toISOString(),
              message: (c.commit?.message || '').split('\n')[0],
              hour: d.getUTCHours(),
              dayOfWeek: d.getUTCDay(),
              additions,
              deletions
            });
          }
        } catch (err) {
          console.log(`  ⚠️ Error fetching commits for ${repo.name}: ${err.message}`);
        }
      }

      // Deduplicate by SHA
      const uniqueCommits = [];
      const seen = new Set();
      for (const c of allCommits) {
        if (!seen.has(c.sha)) {
          seen.add(c.sha);
          uniqueCommits.push(c);
        }
      }

      uniqueCommits.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log(`✅ Total unique commits found: ${uniqueCommits.length}`);

      return {
        success: true,
        message: `Synced ${repoResult.total} repositories and ${uniqueCommits.length} commits (last 30 days) for ${login}`,
        repositories: repoResult.repositories,
        commits: uniqueCommits,
        total: repoResult.total,
        publicCount: repoResult.publicCount,
        privateCount: repoResult.privateCount
      };
    } catch (error) {
      console.error('Error syncing:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getRepositoryDetails(username, repoName, token) {
    try {
      this.initialize(token);
      const { data: repo } = await this.octokit.repos.get({
        owner: username,
        repo: repoName
      });
      return { success: true, repository: repo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GitHubService();