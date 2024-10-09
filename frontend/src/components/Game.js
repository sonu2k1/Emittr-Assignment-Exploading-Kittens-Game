import React, { useEffect } from "react";
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
      fetchLeaderboard();
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
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  const getCardImage = (cardName) => {
    switch (cardName) {
      case "Cat Card":
        return catImage;
      case "Defuse Card":
        return defuseImage;
      case "Shuffle Card":
        return shuffleImage;
      case "Exploding Kitten":
        return bombImage;
      default:
        console.warn(`No image found for card: ${cardName}`);
        return null;
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
          {gameStatus === "won" && <p>You won!</p>}
          {gameStatus === "lost" && <p>You lost!</p>}
          <h3>Drawn Cards:</h3>
          <div className="drawn-cards">
            {lastDrawnCardNames.map((cardName, index) => {
              const cardImage = getCardImage(cardName);
              return (
                <div class="card " id="drawn-card" style={{ width: "15rem" }}>
                <div key={index} className="drawn-card">
                  {cardImage ? (
                    <img
                      src={cardImage}
                      alt={cardName}
                      className="card-img"
                    />
                  ) : (
                    <div className="card-placeholder">{cardName}</div>
                  )}
                </div>
                </div>
              );
            })}
          </div>
          
        </>
      )}
      <div className="mt-3 mb-3">
        <button className="btn btn-danger ml-5" onClick={handleReset}>
          Reset
        </button>
      </div>
    

      <Rules />
    </div>
  );
};

export default Game;