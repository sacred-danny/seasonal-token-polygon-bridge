import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  status: 'idle',
  walletAddress: '',
  currentSeason: 0,
  ethProvider: {}
};

export const bridgeSlice = createSlice({
  name: 'counter',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setEth(state, action) {
      state.ethProvider = action.payload;
    },
  }
});
export default bridgeSlice.reducer;
