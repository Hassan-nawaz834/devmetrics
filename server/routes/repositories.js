// server/routes/repositories.js
const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const Commit = require('../models/Commit');
const Repository = require('../models/Repository');
const auth = require('../middleware/auth');

// Get all repositories (live from GitHub)
router.get('/', auth, async (req, res) => {
  try {
    const { githubToken, githubUsername } = req.user;

    if (!githubToken || !githubUsername) {
      return res.status(400).json({
        success: false,
        error: 'GitHub not connected. Please connect your GitHub account.'
      });
    }

    const result = await githubService.getUserRepositories(githubUsername, githubToken);

    if (result.success) {
      return res.json({
        success: true,
        data: result.repositories,
        stats: {
          total: result.total,
          public: result.publicCount,
          private: result.privateCount
        }
      });
    }

    res.status(500).json({ success: false, error: result.error });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync repositories + commits from last 30 days
router.post('/sync', auth, async (req, res) => {
  try {
    const { githubToken, githubUsername, _id: userId } = req.user;

    if (!githubToken || !githubUsername) {
      return res.status(400).json({
        success: false,
        error: 'GitHub not connected'
      });
    }

    console.log(`🔄 Starting sync for user: ${githubUsername} (${userId})`);

    const result = await githubService.syncAllRepositories(
      githubUsername,
      githubToken,
      userId
    );

    if (!result.success) {
      console.error('Sync failed:', result.error);
      return res.status(500).json({ success: false, error: result.error });
    }

    // Save repositories
    let reposSaved = 0;
    for (const repo of result.repositories || []) {
      try {
        await Repository.findOneAndUpdate(
          { userId, githubId: repo.id },
          {
            userId,
            githubId: repo.id,
            name: repo.name,
            fullName: repo.fullName,
            owner: repo.owner || githubUsername,
            private: repo.private,
            visibility: repo.visibility,
            language: repo.language,
            defaultBranch: repo.defaultBranch,
            updatedAt: repo.updatedAt ? new Date(repo.updatedAt) : new Date(),
            lastSyncedAt: new Date()
          },
          { upsert: true, new: true }
        );
        reposSaved++;
      } catch (err) {
        console.log(`Error saving repo ${repo.name}:`, err.message);
      }
    }

    // Save commits
    let commitsImported = 0;
    let commitsSkipped = 0;

    for (const c of result.commits || []) {
      try {
        const date = new Date(c.date);

        const updateResult = await Commit.updateOne(
          { userId, commitSha: c.sha },
          {
            $setOnInsert: {
              userId,
              repoName: c.repoName,
              visibility: c.visibility || 'public',
              commitSha: c.sha,
              date,
              hour: date.getUTCHours(),
              dayOfWeek: date.getUTCDay(),
              message: c.message || '',
              additions: c.additions || 0,
              deletions: c.deletions || 0
            }
          },
          { upsert: true }
        );

        if (updateResult.upsertedCount > 0) {
          commitsImported++;
        } else {
          commitsSkipped++;
        }
      } catch (err) {
        console.log(`Error saving commit ${c.sha}:`, err.message);
        commitsSkipped++;
      }
    }

    console.log(
      `✅ Sync complete: ${reposSaved} repos, ${commitsImported} new commits, ${commitsSkipped} skipped, total found: ${(result.commits || []).length}`
    );

    res.json({
      success: true,
      message: `Synced ${reposSaved} repositories and ${commitsImported} new commits (last 30 days)`,
      data: {
        repositories: reposSaved,
        commitsImported,
        commitsSkipped,
        totalCommits: (result.commits || []).length
      }
    });
  } catch (error) {
    console.error('Error syncing repositories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;