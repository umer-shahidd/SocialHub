// src/store/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createPost, listenPosts, toggleLike, addComment } from '../services/postService';

export const startPostsListener = createAsyncThunk(
  'posts/listen',
  async (_, { dispatch }) => {
    // listenPosts returns an unsubscribe fn; keep it in closure
    const unsubscribe = listenPosts(posts => dispatch(postsReceived(posts)));
    return unsubscribe;                 // we store it so we can call later if needed
  }
);

export const addNewPost = createAsyncThunk(
  'posts/addNew',
  async (payload) => await createPost(payload)
);

export const togglePostLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, alreadyLiked }) => await toggleLike(postId, alreadyLiked)
);

export const addNewComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }) => await addComment(postId, text)
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    listening: false,
  },
  reducers: {
    postsReceived: (state, action) => {
      state.items = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(startPostsListener.fulfilled, (state) => {
        state.listening = true;
      });
  }
});

export const { postsReceived } = postSlice.actions;
export default postSlice.reducer;
