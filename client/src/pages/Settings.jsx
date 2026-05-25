import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

function Settings() {
  const { user, logout } = useAuth();
  const [syncFrequency, setSyncFrequency] = useState(user?.settings?.syncFrequency || 'daily');
  const [emailReports, setEmailReports] = useState(user?.settings?.emailReports || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateSettings = async () => {
    await axios.put('http://localhost:5000/api/user/settings',
      { syncFrequency, emailReports },
      { withCredentials: true }
    );
    alert('Settings updated!');
  };

  const deleteAccount = async () => {
    await axios.delete('http://localhost:5000/api/user/account', { withCredentials: true });
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.avatarUrl} className="w-16 h-16 rounded-full" />
            <div>
              <p className="font-medium">{user?.username}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Sync Settings</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Sync Frequency</label>
            <select
              value={syncFrequency}
              onChange={(e) => setSyncFrequency(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailReports}
                onChange={(e) => setEmailReports(e.target.checked)}
              />
              <span>Receive weekly email reports</span>
            </label>
          </div>
          <button
            onClick={updateSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-gray-600 mb-4">Once you delete your account, all data will be permanently removed.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account?</h2>
              <p className="text-gray-600 mb-4">This action cannot be undone. All your data will be lost.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button onClick={deleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;