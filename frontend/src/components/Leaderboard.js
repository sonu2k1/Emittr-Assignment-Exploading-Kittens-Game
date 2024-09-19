import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data from the server
    const fetchLeaderboard = async () => {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data);
    };

    fetchLeaderboard();
    // Set up a WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.onmessage = (event) => {
      setLeaderboard(JSON.parse(event.data));
    };

    return () => ws.close();
  }, []);

  return (
    <div>
      <hr />
      <h2 style={{color: 'red'}}>Leaderboard</h2>
      <ul>
        {leaderboard.map((user) => (
          <li key={user.username}>
            {user.username}: {user.points} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
