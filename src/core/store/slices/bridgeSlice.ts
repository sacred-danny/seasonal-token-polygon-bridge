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
  }
});
export default bridgeSlice.reducer;
