import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats/overview', { withCredentials: true });
      setStats(response.data);
    } catch (err) {
      console.log('Stats not available yet (no commits synced)');
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username}!</h2>
          <p className="text-gray-500 mt-1">Track your coding productivity and collaborations</p>
        </div>

        {loading ? (
          <div className="text-center">
            <p className="text-gray-600">Loading statistics...</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-semibold">Total Commits</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalCommits || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-semibold">Unique Days</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.uniqueDays || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-semibold">Additions</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">+{stats.totalAdditions || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-semibold">Deletions</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">-{stats.totalDeletions || 0}</p>
            </div>
          </div>
        ) : null}

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
      </div>
    </div>
  );
}

export default Dashboard;