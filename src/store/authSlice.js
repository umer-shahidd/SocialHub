// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: null,
  userName: null,
  userEmail: null,
  userAvatar: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { userId, userName, userEmail, userAvatar } = action.payload;
      state.userId = userId;
      state.userName = userName;
      state.userEmail = userEmail;
      state.userAvatar = userAvatar;
    },
    logoutUser: (state) => {
      state.userId = null;
      state.userName = null;
      state.userEmail = null;
      state.userAvatar = null;
    },
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
