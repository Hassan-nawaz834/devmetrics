function buildProductivitySummary(commits) {
  const sorted = [...commits].sort((a, b) => new Date(a.date) - new Date(b.date));
  const totalCommits = sorted.length;
  const totalAdditions = sorted.reduce((sum, commit) => sum + (commit.additions || 0), 0);
  const totalDeletions = sorted.reduce((sum, commit) => sum + (commit.deletions || 0), 0);
  const uniqueDays = new Set(sorted.map((commit) => new Date(commit.date).toDateString())).size;
  const averageDailyCommits = uniqueDays > 0 ? Number((totalCommits / uniqueDays).toFixed(1)) : 0;
  const netChanges = totalAdditions - totalDeletions;
  const productivityScore = Math.max(0, Math.round((totalAdditions / Math.max(1, totalCommits)) + averageDailyCommits * 5));

  return {
    totalCommits,
    totalAdditions,
    totalDeletions,
    uniqueDays,
    averageDailyCommits,
    netChanges,
    productivityScore,
    trend: productivityScore >= 30 ? 'High' : productivityScore >= 15 ? 'Medium' : 'Low'
  };
}

module.exports = {
  buildProductivitySummary
};
