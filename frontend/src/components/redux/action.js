export const updateScore = (score) => ({
    type: 'UPDATE_SCORE',
    payload: score,
  });
  
  export const saveGameState = () => ({
    type: 'SAVE_GAME_STATE',
  });