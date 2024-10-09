import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  deck: [],
  isGameStarted: false,
  defuseCards: 0,
  gameStatus: null,
  drawnCard:[],
};


const cardNames = {
  '😼': 'Cat Card',
  '🙅‍♂️': 'Defuse Card',
  '🔀': 'Shuffle Card',
  '💣': 'Exploding Kitten',
};



export const gameSlice = createSlice({
 
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.deck = ['😼', '🙅‍♂️', '🔀', '💣'].sort(() => Math.random() - 0.5);
      state.isGameStarted = true;
      state.defuseCards = 0;
      state.gameStatus = null;
      state.drawnCards = [];
    },
    
    drawCard: (state) => {
      const card = state.deck.pop();
      state.drawnCards.push(card); 
      switch (card) {
        case '😼':
          break;
        case '🙅‍♂️':
          state.defuseCards += 1;
          break;
        case '🔀':
          state.deck = ['😼', '🙅‍♂️', '🔀', '💣'].sort(() => Math.random() - 0.5);   // Math.floor(Math.random() * 4)
          break;
        case '💣':
          if (state.defuseCards > 0) {
            state.defuseCards -= 1;
          } else {
            state.gameStatus = 'lost';
          }
          break;
      }
      if (state.deck.length === 0 && state.gameStatus !== 'lost') {
        state.gameStatus = 'won';
      }
    },
    saveGameState: (state) => {
       
        return async (dispatch, getState) => {
          const { game, user } = getState();
          const response = await fetch('/api/saveGame', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, gameState: game }),
          });
          if (!response.ok) {
            console.error('Failed to save game state');
          }
        };
      },
      resetGame: (state) => {
        return initialState;  // Reset the state to its initial value
      },
  },
});



export const { startGame, drawCard, resetGame, loadGameState, saveGameState } = gameSlice.actions;
export default gameSlice.reducer;

export const selectDrawnCardNames = (state) => 
  (state.game?.drawnCards || []).map(card => cardNames[card] || 'Unknown Card');

// export const selectGameStatus = (state) => state.game?.gameStatus;
// export const selectIsGameStarted = (state) => state.game?.isGameStarted;

