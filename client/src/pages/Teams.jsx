import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const response = await axios.get('http://localhost:5000/api/teams', { withCredentials: true });
    setTeams(response.data);
  };

  const createTeam = async () => {
    await axios.post('http://localhost:5000/api/teams', 
      { name: newTeamName, description: newTeamDesc },
      { withCredentials: true }
    );
    setShowCreateModal(false);
    fetchTeams();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Teams</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create Team
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <Link to={`/teams/${team._id}`} key={team._id}>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
                <p className="text-gray-500 mt-2">{team.description || 'No description'}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {team.members?.length || 1} members
                  </span>
                  <span className="text-blue-600">View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">You haven't joined any teams yet.</p>
            <p className="text-gray-400 text-sm mt-2">Create a team or accept an invite to get started!</p>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Create Team</h2>
              <input
                type="text"
                placeholder="Team Name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3"
              />
              <textarea
                placeholder="Description (optional)"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button onClick={createTeam} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teams;