// client/src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ActivityChart from '../components/dashboard/ActivityChart';
import PeakHours from '../components/dashboard/PeakHours';
import StreakCard from '../components/dashboard/StreakCard';
import RepositoryList from '../components/dashboard/RepositoryList';
import { apiUrl } from '../config/api';
import '../dashboardTheme.css';

function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [commits, setCommits] = useState([]);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [stats, setStats] = useState({
    totalCommits: 0,
    repositories: 0,
    contributors: 0,
    lastUpdated: null
  });

  const isSyncingRef = useRef(false);

  const fetchRepositories = useCallback(async () => {
    try {
      setLoadingRepos(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('No token found, skipping repository fetch');
        setLoadingRepos(false);
        return;
      }

      console.log('📦 Fetching repositories...');
      const response = await fetch(apiUrl('/repositories'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Repositories response:', data);

      if (data.success) {
        setRepositories(data.data || []);
        setStats(prev => ({
          ...prev,
          repositories: data.data?.length || 0,
          lastUpdated: new Date()
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch repositories');
      }
    } catch (err) {
      console.error('Error fetching repositories:', err);
      setRepositories([]);
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  const fetchCommits = useCallback(async (token) => {
    try {
      const response = await fetch(apiUrl('/commits'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCommits(Array.isArray(data) ? data : []);
        return data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching commits:', err);
      return [];
    }
  }, []);

  const fetchStats = useCallback(async (token) => {
    try {
      const response = await fetch(apiUrl('/stats/dashboard'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          ...data,
          lastUpdated: new Date()
        }));
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  const syncData = useCallback(async (showLoading = true) => {
    if (isSyncingRef.current) {
      console.log('⏳ Sync already in progress, skipping...');
      return false;
    }

    try {
      isSyncingRef.current = true;
      if (showLoading) setSyncing(true);
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('No token found, skipping sync');
        return false;
      }

      console.log('🔄 Auto-syncing GitHub data...');

      const response = await fetch(apiUrl('/repositories/sync'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Sync result:', result);

      if (result.success) {
        setLastSyncTime(new Date());
        await Promise.all([
          fetchCommits(token),
          fetchRepositories(),
          fetchStats(token)
        ]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Sync failed:', err);
      return false;
    } finally {
      if (showLoading) setSyncing(false);
      isSyncingRef.current = false;
    }
  }, [fetchCommits, fetchRepositories, fetchStats]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await fetchRepositories();

      const commitsData = await fetchCommits(token);

      if (!commitsData || commitsData.length === 0) {
        console.log('📊 No commits found, auto-syncing...');
        await syncData(false);
      } else {
        await fetchStats(token);
      }

      setLastSyncTime(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchCommits, fetchRepositories, fetchStats, syncData]);

  useEffect(() => {
    loadDashboard();

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard data...');
      loadDashboard();
    }, 300000);

    return () => clearInterval(intervalId);
  }, [loadDashboard]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible, refreshing data...');
        if (lastSyncTime && (new Date() - lastSyncTime) > 120000) {
          loadDashboard();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadDashboard, lastSyncTime]);

  const handleManualRefresh = useCallback(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="relative min-h-screen font-body text-[var(--text)]">
        <AuroraBackground />
        <div className="relative z-10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--teal)] mx-auto"></div>
            <p className="mt-4 text-muted-aurora font-mono-ui text-sm">
              {syncing ? 'Syncing your GitHub data...' : 'Loading dashboard...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen font-body text-[var(--text)]">
        <AuroraBackground />
        <div className="relative z-10 max-w-3xl mx-auto pt-16 px-5">
          <div className="glass border border-[rgba(251,113,133,0.35)] rounded-[18px] p-6 text-[var(--coral)]">
            <h3 className="font-display text-lg font-medium">Error loading dashboard</h3>
            <p className="mt-1 text-sm text-muted-aurora">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-4 px-4 py-2 gradient-btn rounded-full text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-body text-[var(--text)] pb-24">
      <AuroraBackground />

      <div className="relative z-10 max-w-[1080px] mx-auto px-5 pt-9 flex flex-col gap-5">

        {/* Welcome / Hero */}
        <div className="glass px-9 py-9 md:py-8">
          <div className="flex justify-between items-start gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3 font-mono-ui text-[11.5px] tracking-widest uppercase text-[var(--teal)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shadow-[0_0_10px_#2dd4bf] animate-pulse" />
                repository sync active
              </div>
              <h1 className="font-display font-medium text-3xl md:text-4xl leading-tight">
                Welcome back,<br />
                <span className="gradient-text-cool italic">{user?.username || 'Developer'}</span>
              </h1>
              <p className="mt-3 text-muted-aurora text-[15px] max-w-md leading-relaxed">
                Here's your development activity overview.
              </p>
              {lastSyncTime && (
                <p className="mt-5 flex items-center gap-2 font-mono-ui text-[11.5px] text-faint-aurora">
                  <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Auto-syncs every 5 minutes • Last updated: {new Date(lastSyncTime).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={syncing}
              className="gradient-btn px-5 py-3 rounded-full text-[13.5px] font-semibold flex items-center gap-2 disabled:opacity-60"
            >
              <svg
                className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {syncing ? 'Syncing...' : 'Refresh now'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass glass-hover rounded-[18px] p-6 transition-transform">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3.5 bg-[rgba(45,212,191,0.14)] text-[var(--teal)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="font-display text-3xl font-medium">
              {stats.totalCommits || commits.length}
            </p>
            <p className="text-[13px] text-muted-aurora mt-1">Total Commits (30 days)</p>
          </div>

          <div className="glass glass-hover rounded-[18px] p-6 transition-transform">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3.5 bg-[rgba(167,139,250,0.14)] text-[var(--violet)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="font-display text-3xl font-medium">{stats.repositories || 0}</p>
            <p className="text-[13px] text-muted-aurora mt-1">Repositories</p>
          </div>

          <div className="glass glass-hover rounded-[18px] p-6 transition-transform">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-3.5 bg-[rgba(251,191,103,0.14)] text-[var(--gold)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-display text-3xl font-medium">{stats.contributors || 1}</p>
            <p className="text-[13px] text-muted-aurora mt-1">Contributors</p>
          </div>
        </div>

        {/* Repository List */}
        <RepositoryList
          repositories={repositories}
          loading={loadingRepos}
          onRefresh={handleManualRefresh}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActivityChart commits={commits} />
          <PeakHours commits={commits} />
        </div>

        {/* Streak Card */}
        <StreakCard commits={commits} />

        {/* Recent Activity */}
        {commits.length > 0 && (
          <div className="glass rounded-[18px] p-6">
            <h3 className="font-display text-[17px] font-medium mb-4">Recent Commits</h3>
            <div>
              {commits.slice(0, 8).map((commit, index) => (
                <div
                  key={commit._id || index}
                  className="flex items-center justify-between border-b border-aurora py-3.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_#2dd4bf] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[13.5px] truncate">
                        {commit.message || 'Commit'}
                      </p>
                      <p className="font-mono-ui text-[11.5px] text-faint-aurora mt-0.5">
                        <span className="text-[var(--violet)]">{commit.repoName || 'Unknown repository'}</span>
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-ui text-[11.5px] text-faint-aurora flex-shrink-0">
                    {commit.date ? new Date(commit.date).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;