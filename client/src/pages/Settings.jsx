// client/src/pages/Settings.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

function Settings() {
  const { user, logout } = useAuth();
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [emailReports, setEmailReports] = useState(false);
  const [privateRepos, setPrivateRepos] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setSyncFrequency(user.settings.syncFrequency || 'daily');
      setEmailReports(Boolean(user.settings.emailReports));
      setPrivateRepos(Boolean(user.settings.privateRepos));
    }
  }, [user]);

  const updateSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiUrl('/user/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ syncFrequency, emailReports, privateRepos })
      });

      if (!response.ok) throw new Error('Failed to update settings');
      alert('Settings updated!');
    } catch (error) {
      alert('Unable to update settings right now.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(apiUrl('/user/account'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
    } catch (error) {
      alert('Unable to delete account right now.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full" />
            )}
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sync Frequency</label>
            <select
              value={syncFrequency}
              onChange={(e) => setSyncFrequency(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="emailReports"
              checked={emailReports}
              onChange={(e) => setEmailReports(e.target.checked)}
            />
            <label htmlFor="emailReports">Email reports</label>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="privateRepos"
              checked={privateRepos}
              onChange={(e) => setPrivateRepos(e.target.checked)}
            />
            <label htmlFor="privateRepos">Include private repositories</label>
          </div>

          <button
            onClick={updateSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Account
            </button>
          ) : (
            <div>
              <p className="mb-3 text-sm text-gray-600">
                Are you sure? This will permanently delete your account and data.
              </p>
              <button
                onClick={deleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;