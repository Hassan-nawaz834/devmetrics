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

      // Paginate all repositories
      const repos = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const { data } = await this.octokit.repos.listForAuthenticatedUser({
          visibility: 'all',
          affiliation: 'owner,collaborator,organization_member',
          sort: 'updated',
          direction: 'desc',
          per_page: 100,
          page
        });

        repos.push(...data);
        hasMore = data.length === 100;
        page += 1;
        if (page > 10) break; // safety: max 1000 repos
      }

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

  /**
   * Fetch ALL pages of commits for a repo since a given date.
   * Filters to the authenticated user by login + emails.
   */
  async fetchAllCommitsForRepo(owner, repoName, login, userEmails, sinceISO) {
    const commits = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data } = await this.octokit.repos.listCommits({
          owner,
          repo: repoName,
          since: sinceISO,
          per_page: 100,
          page
        });

        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }

        for (const c of data) {
          const authorLogin = (c.author?.login || c.committer?.login || '').toLowerCase();
          const authorEmail = (
            c.commit?.author?.email ||
            c.commit?.committer?.email ||
            ''
          ).toLowerCase();

          const isMine =
            authorLogin === login.toLowerCase() ||
            (authorEmail && userEmails.has(authorEmail));

          if (!isMine) continue;

          const dateStr = c.commit?.author?.date || c.commit?.committer?.date;
          if (!dateStr) continue;

          commits.push({
            sha: c.sha,
            date: dateStr,
            message: (c.commit?.message || '').split('\n')[0].slice(0, 500),
            additions: c.stats?.additions || 0,
            deletions: c.stats?.deletions || 0
          });
        }

        hasMore = data.length === 100;
        page += 1;

        // safety: max 20 pages = 2000 commits per repo
        if (page > 20) break;
      } catch (err) {
        console.log(`  ⚠️ page ${page} failed for ${repoName}: ${err.message}`);
        hasMore = false;
      }
    }

    return commits;
  }

  // ---------- FULL SYNC (all repos, paginated commits, last 365 days) ----------
  async syncAllRepositories(username, token, userId) {
    try {
      this.initialize(token);

      const { data: authUser } = await this.octokit.users.getAuthenticated();
      const login = authUser.login;

      // Collect emails linked to this GitHub account
      const userEmails = new Set();
      try {
        const { data: emails } = await this.octokit.users.listEmailsForAuthenticatedUser();
        emails.forEach((e) => {
          if (e.email) userEmails.add(e.email.toLowerCase());
        });
      } catch (e) {
        console.log('Could not fetch user emails:', e.message);
      }
      if (authUser.email) userEmails.add(authUser.email.toLowerCase());

      console.log(`🔍 Syncing commits for user: ${login} (ID: ${userId})`);
      console.log(`📧 Matching emails:`, [...userEmails]);

      const repoResult = await this.getUserRepositories(login, token);
      if (!repoResult.success) return repoResult;

      // Last 365 days (change to more if needed)
      const since = new Date();
      since.setDate(since.getDate() - 365);
      const sinceISO = since.toISOString();

      console.log(`📅 Fetching commits since: ${sinceISO}`);
      console.log(`📦 Total repositories to process: ${repoResult.repositories.length}`);

      const allCommits = [];
      const repos = repoResult.repositories;

      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        const owner = repo.owner || login;

        console.log(`📂 [${i + 1}/${repos.length}] ${repo.name}`);

        try {
          const commits = await this.fetchAllCommitsForRepo(
            owner,
            repo.name,
            login,
            userEmails,
            sinceISO
          );

          console.log(`  📝 ${commits.length} commits by you`);

          for (const c of commits) {
            const d = new Date(c.date);
            allCommits.push({
              sha: c.sha,
              repoName: repo.name,
              visibility: repo.visibility || (repo.private ? 'private' : 'public'),
              date: d.toISOString(),
              message: c.message,
              hour: d.getUTCHours(),
              dayOfWeek: d.getUTCDay(),
              additions: c.additions,
              deletions: c.deletions
            });
          }
        } catch (err) {
          console.log(`  ⚠️ Error on ${repo.name}: ${err.message}`);
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
        message: `Synced ${repoResult.total} repositories and ${uniqueCommits.length} commits for ${login}`,
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