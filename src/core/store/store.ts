import { configureStore } from '@reduxjs/toolkit';

import bridgeReducer from './slices/bridgeSlice';
import messagesReducer from './slices/MessagesSlice';

const store = configureStore({
  reducer: {
    app: bridgeReducer,
    messages: messagesReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
});
export default store;