import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function TeamDetails() {
  const { teamId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`/api/team-analytics/${teamId}`, { withCredentials: true });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to load team analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [teamId]);

  if (loading) {
    return <div className="p-8 text-gray-600">Loading team analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-8 text-red-600">Unable to load team analytics.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/teams" className="text-blue-600 hover:underline">← Back to teams</Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">{analytics.teamName}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Total commits</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.totalCommits}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Additions</p>
            <p className="text-3xl font-bold text-green-600 mt-2">+{analytics.totalAdditions}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-sm text-gray-500">Deletions</p>
            <p className="text-3xl font-bold text-red-600 mt-2">-{analytics.totalDeletions}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Member activity</h2>
          <div className="space-y-4">
            {analytics.memberStats.map((member) => (
              <div key={member.user.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <img src={member.user.avatarUrl} alt={member.user.username} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-800">{member.user.username}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="mr-4">Commits: {member.stats.commits}</span>
                  <span className="mr-4">Additions: +{member.stats.additions}</span>
                  <span>Deletions: -{member.stats.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

