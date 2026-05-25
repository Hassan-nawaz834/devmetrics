import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import CommitHeatmap from '../components/dashboard/CommitHeatmap';
import ActivityChart from '../components/dashboard/ActivityChart';
import StreakCard from '../components/dashboard/StreakCard';

function Dashboard() {
  const { user } = useAuth();
  const [commits, setCommits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [commitsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/commits', { withCredentials: true }),
        axios.get('http://localhost:5000/api/commits/stats', { withCredentials: true })
      ]);
      setCommits(commitsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">DevMetrics</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">{user?.username}</span>
            <img src={user?.avatarUrl} className="w-8 h-8 rounded-full" alt="Avatar" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.username}!</h2>
          <p className="text-gray-500 mt-1">Here's your coding activity summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Total Commits (30 days)</div>
            <div className="text-4xl font-bold text-blue-600">{stats?.totalCommits || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Lines Added</div>
            <div className="text-4xl font-bold text-green-600">+{stats?.totalAdditions?.toLocaleString() || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm">Active Repos</div>
            <div className="text-4xl font-bold text-purple-600">{stats?.repos?.length || 0}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Commit Activity</h3>
            <ActivityChart commits={commits} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Current Streak</h3>
            <StreakCard commits={commits} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Commit Heatmap</h3>
          <CommitHeatmap commits={commits} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;