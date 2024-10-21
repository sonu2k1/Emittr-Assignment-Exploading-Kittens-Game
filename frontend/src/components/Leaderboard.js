import React, { useEffect, useState } from 'react';
import axios from 'axios';

const endpoint = "http://localhost:9000";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]); // Initialize with empty array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${endpoint}/api/leaderboard`);
        // Ensure we always set an array, even if response is null/undefined
        setLeaderboard(response.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch leaderboard data');
        console.error('Error fetching leaderboard:', err);
        setLeaderboard([]); // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLeaderboard();

    // Set up polling every 5 seconds
    const pollInterval = setInterval(fetchLeaderboard, 5000);

    // Cleanup polling on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-yellow-500 text-xl">🏆</h2>
          <h2 className="text-2xl font-bold " style={{color:"red"}}>Leaderboard</h2>
        </div>
      </div>
      <div className="space-y-2">
        {(!leaderboard || leaderboard.length === 0) ? (
          <p className="text-gray-500 text-center">No scores yet</p>
        ) : (
          <ul className="space-y-2">
            {leaderboard.map((user, index) => (
              <li 
                key={user.username}
                className={`p-3 rounded-lg flex justify-between items-center ${
                  index === 0 ? 'bg-yellow-50' :
                  index === 1 ? 'bg-gray-50' :
                  index === 2 ? 'bg-orange-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{index + 1}</span>
                  <span className="font-medium">{user.username}</span>
                </div>
                <span className="font-semibold">{user.points} points</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;