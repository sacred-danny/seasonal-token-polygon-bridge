import { createSlice } from '@reduxjs/toolkit';

interface initialProps{
  ethProvider: any[];
}
const initialState:initialProps = {
  ethProvider: []
};

export const bridgeSlice = createSlice({
  name: 'app',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    SetEthProvider(state, action) {
      state.ethProvider.push(action.payload);
    },
  }
});
export const { SetEthProvider } = bridgeSlice.actions;
export default bridgeSlice.reducer;
