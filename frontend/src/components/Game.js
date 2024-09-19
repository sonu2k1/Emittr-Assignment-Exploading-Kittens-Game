import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  startGame,
  drawCard,
  resetGame,
  selectDrawnCardNames,
} from "./redux/gameSlice";
import { incrementPoints } from "./redux/userSlice";
import catImage from "../assets/img/catcard.jpg";
import defuseImage from "../assets/img/defuseCard.jpg";
import shuffleImage from "../assets/img/shuffleCard.png";
import bombImage from "../assets/img/explodeCard.png";
import Rules from "./Rules.js";
import "./Game.css";
import { saveGameState } from "./redux/action.js";

const Game = () => {
  const dispatch = useDispatch();
  const { deck, isGameStarted, gameStatus } = useSelector(
    (state) => state.game
  );
  const { username } = useSelector((state) => state.user);
  const lastDrawnCardNames = useSelector(selectDrawnCardNames);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    dispatch(saveGameState());
  }, [deck, isGameStarted, gameStatus, dispatch]);

  useEffect(() => {
    if (gameStatus === "won") {
      dispatch(incrementPoints());
      updateUserPoints();
    }
  }, [gameStatus, dispatch]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleStartGame = () => {
    dispatch(startGame());
  };

  const handleDrawCard = () => {
    dispatch(drawCard());
  };

  const handleReset = () => {
    dispatch(resetGame());
  };

  const updateUserPoints = async () => {
    try {
      const response = await fetch("/api/incrementPoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        throw new Error("Failed to update points");
      }
      fetchLeaderboard(); // Refresh leaderboard after updating points
    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  return (
    <div id="start">
      <h2>Welcome, {username}!</h2>
      {!isGameStarted ? (
        <button className="btn btn-danger" onClick={handleStartGame}>
          Start Game
        </button>
      ) : (
        <>
          <ul className="list-group list-group">
            <li className="list-group-item" style={{ color: "red" }}>
              Cards left: {deck.length}
            </li>
          </ul>
          <button
            className="btn btn-danger"
            onClick={handleDrawCard}
            disabled={gameStatus !== null}
          >
            Draw Card
          </button>
          <h3>Drawn Cards:</h3>
          <ul className="list-group list-group-numbered">
            {lastDrawnCardNames.map((cardName, index) => (
              <li
                className="list-group-item"
                style={{ color: "red" }}
                key={index}
              >
                {cardName}
              </li>
            ))}
          </ul>
          {gameStatus === "won" && <p>You won!</p>}
          {gameStatus === "lost" && <p>You lost!</p>}
        </>
      )}
      <div className="mt-3 mb-3">
        <button className="btn btn-danger ml-5" onClick={handleReset}>
          Reset
        </button>
      </div>
      {/* Cards */}
      <div className="d-flex justify-content-center ml-5 mb-3">
        <div className="card" style={{ width: "18rem" }}>
          <img src={catImage} className="card-img-top" alt="Cat Card" />
        </div>
        <div className="card" style={{ width: "18rem" }}>
          <img src={defuseImage} className="card-img-top" alt="Defuse Card" />
        </div>
        <div className="card" style={{ width: "18rem" }}>
          <img src={bombImage} className="card-img-top" alt="Bomb Card" />
        </div>
        <div className="card" style={{ width: "18rem" }}>
          <img src={shuffleImage} className="card-img-top" alt="Shuffle Card" />
        </div>
      </div>

      <Rules />
    </div>
  );
};

export default Game;
