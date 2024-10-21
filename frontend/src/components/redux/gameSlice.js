import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deck: [],
  isGameStarted: false,
  defuseCards: 0,
  gameStatus: null,
  drawnCards: [],
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
          state.deck = ['😼', '🙅‍♂️', '🔀', '💣'].sort(() => Math.random() - 0.5);
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
    resetGame: () => initialState,
  },
});

export const { startGame, drawCard, resetGame } = gameSlice.actions;
export default gameSlice.reducer;

export const selectDrawnCardNames = (state) => 
  (state.game?.drawnCards || []).map(card => cardNames[card] || 'Unknown Card');