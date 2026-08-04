import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ActivityChart from '../components/dashboard/ActivityChart';
import PeakHours from '../components/dashboard/PeakHours';
import StreakCard from '../components/dashboard/StreakCard';

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [commits, setCommits] = useState([]);
  const [repoStats, setRepoStats] = useState([]);
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchCommits();
    fetchRepoStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats/overview', { withCredentials: true });
      setStats(response.data);
    } catch (err) {
      console.log('Stats not available yet (no commits synced)');
    }
  };

  const fetchCommits = async () => {
    try {
      const response = await axios.get('/api/commits?limit=100', { withCredentials: true });
      setCommits(response.data);
    } catch (err) {
      console.log('Commits not available yet');
    }
  };

  const fetchRepoStats = async () => {
    try {
      const response = await axios.get('/api/commits/stats', { withCredentials: true });
      setRepoStats(response.data.repos || []);
    } catch (err) {
      console.log('Repository stats not available yet');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await axios.post('/api/sync/start', {}, { withCredentials: true });
      await fetchStats();
      await fetchCommits();
      alert(response.data.message);
    } catch (err) {
      alert('Unable to sync GitHub data right now.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">DevMetrics</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">{user?.username}</span>
            <img src={user?.avatarUrl} className="w-8 h-8 rounded-full" alt="Avatar" />
            <button 
              onClick={logout}
              className="text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username}!</h2>
            <p className="text-gray-500 mt-1">Track your coding productivity and collaborations</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {syncing ? 'Syncing...' : 'Sync GitHub Activity'}
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Total Commits</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCommits || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Avg/Day</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.averageDailyCommits || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Additions</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">+{stats.totalAdditions || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Net Changes</h3>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.netChanges >= 0 ? '+' : ''}{stats.netChanges || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Productivity</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.productivityScore || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.trend || 'Low'} trend</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Private Repos</h3>
                <p className="text-3xl font-bold text-amber-600 mt-2">{repoStats.filter((repo) => repo.visibility === 'private').length}</p>
                <p className="text-sm text-gray-500 mt-1">tracked repositories</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm font-semibold">Public Repos</h3>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{repoStats.filter((repo) => repo.visibility === 'public').length}</p>
                <p className="text-sm text-gray-500 mt-1">tracked repositories</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Over Time</h3>
                <ActivityChart commits={commits} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <StreakCard commits={commits} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakHours commits={commits} />
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Repository Breakdown</h3>
                  <select
                    value={visibilityFilter}
                    onChange={(e) => setVisibilityFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                {repoStats.length > 0 ? (
                  <div className="space-y-3">
                    {repoStats
                      .filter((repo) => visibilityFilter === 'all' || repo.visibility === visibilityFilter)
                      .map((repo) => (
                        <div key={repo.name} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                          <div>
                            <span className="text-gray-700 font-medium">{repo.name}</span>
                            <p className="text-xs text-gray-500 capitalize">{repo.visibility || 'public'}</p>
                          </div>
                          <span className="text-sm text-gray-500">{repo.count} commits</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No repository activity yet. Sync your GitHub history to populate this view.</p>
                )}
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                <span className="text-sm text-gray-500">Latest tracked commits</span>
              </div>
              {commits.length > 0 ? (
                <div className="space-y-3">
                  {commits.slice(0, 8).map((commit) => (
                    <div key={commit._id || commit.commitSha} className="flex flex-col md:flex-row md:items-center md:justify-between border-b last:border-b-0 pb-3 last:pb-0">
                      <div>
                        <p className="font-medium text-gray-800">{commit.message || 'Commit'}</p>
                        <p className="text-sm text-gray-500">{commit.repoName}</p>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 md:mt-0">
                        {new Date(commit.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent activity yet. Sync your GitHub history to see commits here.</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Getting Started</h3>
            <p className="text-gray-600 mb-4">No commits synced yet. Features will be available once you sync your GitHub data:</p>
            <ul className="text-left inline-block text-gray-600">
              <li className="mb-2">• Commit statistics and trends</li>
              <li className="mb-2">• Productivity heatmap</li>
              <li className="mb-2">• Streak tracking</li>
              <li className="mb-2">• Team collaboration analytics</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;