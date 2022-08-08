import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  status: 'idle',
  walletAddress: '',
  currentSeason: 0,
};

export const bridgeSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
  }
});
export default bridgeSlice.reducer;
