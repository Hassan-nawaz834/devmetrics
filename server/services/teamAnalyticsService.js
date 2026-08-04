function calculateTeamAnalytics(team, commits) {
  const memberStats = team.members.map((member) => ({
    user: {
      id: member.userId._id,
      username: member.userId.username,
      avatarUrl: member.userId.avatarUrl
    },
    role: member.role,
    stats: {
      commits: 0,
      additions: 0,
      deletions: 0
    }
  }));

  const totals = commits.reduce(
    (acc, commit) => {
      const memberIndex = memberStats.findIndex((entry) => entry.user.id.toString() === commit.userId.toString());
      if (memberIndex === -1) {
        return acc;
      }

      memberStats[memberIndex].stats.commits += 1;
      memberStats[memberIndex].stats.additions += commit.additions || 0;
      memberStats[memberIndex].stats.deletions += commit.deletions || 0;

      acc.totalCommits += 1;
      acc.totalAdditions += commit.additions || 0;
      acc.totalDeletions += commit.deletions || 0;
      return acc;
    },
    { totalCommits: 0, totalAdditions: 0, totalDeletions: 0 }
  );

  return {
    teamName: team.name,
    ...totals,
    memberStats
  };
}

module.exports = {
  calculateTeamAnalytics
};
