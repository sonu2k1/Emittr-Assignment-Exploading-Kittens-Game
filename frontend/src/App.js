import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsername } from './components/redux/userSlice.js';
 import { loadGameState } from './components/redux/gameSlice.js';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import "./App.css";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    dispatch(setUsername(tempUsername));
    setLoggedIn(true);
  };

  

  // const handleLogin = async () => {
  //   dispatch(setUsername(tempUsername));
  //   const response = await fetch(`/api/loadGame?username=${tempUsername}`);
  //   if (response.ok) {
  //     const gameState = await response.json();
  //     dispatch(loadGameState(gameState)); // You'll need to create this action in gameSlice.js
  //   }
  //   setLoggedIn(true);
  // };


  return (
    <div className='text-center mt-5 mb-5  ' >
      <h1 id='heading' style={{ textDecorationLine: 'underline'}} class="shadow-lg p-3 mb-5 bg-body-tertiary rounded">Exploding Kittens Game</h1>
  
      {!loggedIn ? (
        <div className=' mt-5 ' >
          <label for='user' className="form-label" style={{color:"red"}} >Enter Your Name:</label>
          <input
          id='user'
          className="form-control "
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter username"
          />
           
          <button type="button" class="btn btn-danger " onClick={handleLogin}>Enter Game</button>
        <div>
        <img id='IMG' className='w-50 p-5 mb-5' src="cat.webp" alt="nth" />
        </div>
        </div>
        
      ) : (
        <>
          <Game />
          <Leaderboard />
        </>
      )}
    </div>
  );
};

export default App;