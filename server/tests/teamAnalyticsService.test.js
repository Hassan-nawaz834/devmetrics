const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateTeamAnalytics } = require('../services/teamAnalyticsService');

test('calculateTeamAnalytics aggregates team metrics and member contribution totals', () => {
  const team = {
    name: 'Alpha Team',
    members: [
      { userId: { _id: 'user1', username: 'Alice', avatarUrl: 'https://example.com/alice.png' }, role: 'admin' },
      { userId: { _id: 'user2', username: 'Bob', avatarUrl: 'https://example.com/bob.png' }, role: 'member' }
    ]
  };

  const commits = [
    { userId: 'user1', additions: 10, deletions: 2 },
    { userId: 'user1', additions: 5, deletions: 1 },
    { userId: 'user2', additions: 3, deletions: 0 }
  ];

  const analytics = calculateTeamAnalytics(team, commits);

  assert.equal(analytics.teamName, 'Alpha Team');
  assert.equal(analytics.totalCommits, 3);
  assert.equal(analytics.totalAdditions, 18);
  assert.equal(analytics.totalDeletions, 3);
  assert.equal(analytics.memberStats[0].stats.commits, 2);
  assert.equal(analytics.memberStats[0].stats.additions, 15);
  assert.equal(analytics.memberStats[1].stats.commits, 1);
  assert.equal(analytics.memberStats[1].stats.additions, 3);
});
