import { configureStore } from '@reduxjs/toolkit';
import postReducer from './postSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    posts: postReducer,
    auth: authReducer, // ✅ Required!
  },
});

export default store;
