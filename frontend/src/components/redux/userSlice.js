import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  username: '',
  points: 0,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    incrementPoints: (state) => {
      state.points += 1;
    },
    
  },
});

export const { setUsername, incrementPoints } = userSlice.actions;
export default userSlice.reducer;