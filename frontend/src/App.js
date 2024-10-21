import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUsername } from './components/redux/userSlice.js';
import Game from './components/Game';
import Leaderboard from './components/Leaderboard';
import "./App.css";

const App = () => {

  

  const [loggedIn, setLoggedIn] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const validateUsername = (username) => {
    if (username.trim().length === 0) {
      return "Username cannot be empty";
    }
    if (username.trim().length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (username.trim().length > 20) {
      return "Username cannot be longer than 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const handleLogin = () => {
    const validationError = validateUsername(tempUsername);
    if (validationError) {
      setError(validationError);
    } else {
      setError('');
      dispatch(setUsername(tempUsername));
      setLoggedIn(true);
    }
  };

  const handleInputChange = (e) => {
    setTempUsername(e.target.value);
    setError('');
  };

  return (

  

    <div className='text-center mt-5 mb-5'>


      <h1 id='heading' style={{ textDecorationLine: 'underline' }} className="shadow-lg p-3 mb-5 bg-body-tertiary rounded">Exploding Kittens Game</h1>
  
      {!loggedIn ? (
        <div className='mt-5'>
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <label htmlFor='user' className="form-label" style={{color:"red"}}>Enter Your Name:</label>
            <input
              id='user'
              className="form-control align-middle"
              type="text"
              value={tempUsername}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
            {error && <div className="text-danger mt-2">{error}</div>}
            <button type="submit" className="btn btn-danger mt-3">Enter Game</button>
          </form>
          <div>
            <img id='IMG' className='w-50 p-5 mb-5' src="cat.webp" alt="Cat" />
          </div>
        </div>
      ) : (
        <>
          <Game />
          <hr />
          
          
        </>
      )}
    </div>
  );
};

export default App;