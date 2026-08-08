// client/src/components/dashboard/RepositoryList.jsx
import React, { useState } from 'react';
import { FaGithub, FaCodeBranch, FaStar, FaEye, FaCode, FaLock, FaUnlock } from 'react-icons/fa';

function RepositoryList({ repositories, loading }) {
  const [expandedRepo, setExpandedRepo] = useState(null);

  // If loading is true, show skeleton
  if (loading) {
    return (
      <div className="glass rounded-[18px] p-6 text-[var(--text)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[17px] font-medium">Repositories</h3>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--teal)]"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 rounded-xl bg-white/[0.04] border border-[var(--border)]"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no repositories
  if (!repositories || repositories.length === 0) {
    return (
      <div className="glass rounded-[18px] p-6 text-[var(--text)]">
        <h3 className="font-display text-[17px] font-medium mb-4">Repositories</h3>
        <div className="text-center py-8 text-muted-aurora">
          <FaGithub className="mx-auto text-4xl mb-3 opacity-40" />
          <p>No repositories found</p>
          <p className="text-sm mt-1 text-faint-aurora">Connect your GitHub account to see repositories</p>
        </div>
      </div>
    );
  }

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C#': '#178600',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Vue': '#41b883',
      'React': '#61dafb',
      'Angular': '#b52e31'
    };
    return colors[language] || '#8b90ac';
  };

  const getCommitStatus = (commitCount) => {
    if (commitCount > 1000) return '🔥 High Activity';
    if (commitCount > 100) return '⚡ Active';
    if (commitCount > 10) return '📈 Moderate';
    if (commitCount > 0) return '📊 Low Activity';
    return '💤 No Commits';
  };

  const getCommitColor = (commitCount) => {
    if (commitCount > 1000) return 'text-[var(--coral)]';
    if (commitCount > 100) return 'text-[var(--gold)]';
    if (commitCount > 10) return 'text-[var(--violet)]';
    if (commitCount > 0) return 'text-[var(--teal)]';
    return 'text-faint-aurora';
  };

  return (
    <div className="glass rounded-[18px] p-6 text-[var(--text)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-[17px] font-medium">Repositories</h3>
          <p className="text-[13px] text-muted-aurora mt-0.5">
            {repositories.length} repositories ({repositories.filter(r => !r.private).length} public, {repositories.filter(r => r.private).length} private)
          </p>
        </div>
        <span className="font-mono-ui text-[11px] text-faint-aurora">Auto-syncs every 5 minutes</span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="glass-sm rounded-xl border border-[var(--border)] hover:border-[var(--border-hi)] transition-colors"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <div
              className="p-4 cursor-pointer hover:bg-white/[0.03] rounded-xl transition-colors"
              onClick={() => setExpandedRepo(expandedRepo === repo.id ? null : repo.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-[13.5px]">{repo.name}</h4>
                    {repo.private ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] bg-white/[0.06] text-muted-aurora px-2 py-0.5 rounded-full border border-[var(--border)]">
                        <FaLock className="text-[10px]" /> Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10.5px] bg-[rgba(45,212,191,0.14)] text-[var(--teal)] px-2 py-0.5 rounded-full">
                        <FaUnlock className="text-[10px]" /> Public
                      </span>
                    )}
                    {repo.language && (
                      <span className="font-mono-ui text-[11px] text-faint-aurora flex items-center gap-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        />
                        {repo.language}
                      </span>
                    )}
                  </div>

                  {repo.description && (
                    <p className="text-[13px] text-muted-aurora mt-1.5 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[12px] font-mono-ui text-faint-aurora">
                    <span className="flex items-center gap-1.5">
                      <FaCode className="text-[11px]" />
                      <span className={getCommitColor(repo.commitCount)}>
                        {repo.commitCount || 0} commits
                      </span>
                      <span className="text-[10.5px] text-faint-aurora ml-1">
                        ({getCommitStatus(repo.commitCount || 0)})
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaStar className="text-[11px]" />
                      {repo.stars || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaCodeBranch className="text-[11px]" />
                      {repo.forks || 0}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaEye className="text-[11px]" />
                      {repo.watchers || 0}
                    </span>
                    <span>
                      Updated: {new Date(repo.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--teal)] hover:text-[var(--violet)] text-[12.5px] font-mono-ui transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on GitHub →
                  </a>
                </div>
              </div>
            </div>

            {expandedRepo === repo.id && (
              <div className="border-t border-[var(--border)] p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12.5px]">
                  <div>
                    <p className="text-faint-aurora">Default Branch</p>
                    <p className="font-mono-ui text-[var(--text)] mt-0.5">{repo.defaultBranch || 'main'}</p>
                  </div>
                  <div>
                    <p className="text-faint-aurora">Size</p>
                    <p className="font-mono-ui text-[var(--text)] mt-0.5">{repo.size} KB</p>
                  </div>
                  <div>
                    <p className="text-faint-aurora">Open Issues</p>
                    <p className="font-mono-ui text-[var(--text)] mt-0.5">{repo.openIssues || 0}</p>
                  </div>
                  <div>
                    <p className="text-faint-aurora">Created</p>
                    <p className="font-mono-ui text-[var(--text)] mt-0.5">
                      {new Date(repo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {repo.languages && Object.keys(repo.languages).length > 0 && (
                  <div className="mt-4">
                    <p className="text-[12.5px] text-faint-aurora mb-2">Languages Used:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(repo.languages).map(([lang, bytes]) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1.5 text-[11px] font-mono-ui px-2.5 py-1 rounded-full border border-[var(--border)]"
                        >
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: getLanguageColor(lang) }}
                          />
                          {lang}: {bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RepositoryList;