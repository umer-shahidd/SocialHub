// src/store/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  async ({ content, image }, { getState }) => {
    const userId = getState().auth.userId;
    const userName = getState().auth.userName || 'Guest User';
    const userAvatar = getState().auth.userAvatar || '';

    let imageUrl = '';
    if (image && image.uri) {
      const filename = image.name || `${uuidv4()}-${new Date().getTime()}.jpg`;
      const storageRef = storage().ref(`post_images/${filename}`);
      await storageRef.putFile(image.uri);
      imageUrl = await storageRef.getDownloadURL();
    }

    const newPost = {
      id: firestore().collection('posts').doc().id,
      authorId: userId,
      author: userName,
      avatar: userAvatar,
      content,
      image: imageUrl ? { uri: imageUrl } : null,
      likes: 0,
      comments: [],
      liked: false,
      time: new Date().toISOString(),
    };

    await firestore().collection('posts').doc(newPost.id).set(newPost);
    return newPost;
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, { getState }) => {
    const postRef = firestore().collection('posts').doc(postId);
    const postDoc = await postRef.get();
    const currentLikes = postDoc.data()?.likes || 0;
    const currentLikedStatus = postDoc.data()?.liked || false;

    const newLikedStatus = !currentLikedStatus;
    const newLikes = newLikedStatus ? currentLikes + 1 : Math.max(0, currentLikes - 1);

    await postRef.update({
      likes: newLikes,
      liked: newLikedStatus,
    });

    return { postId, newLikes, newLikedStatus };
  }
);

export const addCommentToPost = createAsyncThunk(
  'posts/addCommentToPost',
  async ({ postId, commentText }, { getState }) => {
    const userId = getState().auth.userId;
    const userName = getState().auth.userName || 'Anonymous';
    const comment = {
      id: uuidv4(),
      authorId: userId,
      author: userName,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    const postRef = firestore().collection('posts').doc(postId);
    await postRef.update({
      comments: firestore.FieldValue.arrayUnion(comment),
    });

    return { postId, comment };
  }
);

export const postSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    postsReceived: (state, action) => {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    postLikedToggled: (state, action) => {
      const { postId, newLikes, newLikedStatus } = action.payload;
      const existingPost = state.items.find(post => post.id === postId);
      if (existingPost) {
        existingPost.likes = newLikes;
        existingPost.liked = newLikedStatus;
      }
    },
    commentAdded: (state, action) => {
      const { postId, comment } = action.payload;
      const existingPost = state.items.find(post => post.id === postId);
      if (existingPost) {
        if (!existingPost.comments) {
          existingPost.comments = [];
        }
        existingPost.comments.push(comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addNewPost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(addNewPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, newLikes, newLikedStatus } = action.payload;
        const postIndex = state.items.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          state.items[postIndex].likes = newLikes;
          state.items[postIndex].liked = newLikedStatus;
        }
      })
      .addCase(addCommentToPost.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const postIndex = state.items.findIndex(post => post.id === postId);
        if (postIndex !== -1) {
          if (!state.items[postIndex].comments) {
            state.items[postIndex].comments = [];
          }
          state.items[postIndex].comments.push(comment);
        }
      });
  },
});

export const { postsReceived, postLikedToggled, commentAdded } = postSlice.actions;

export const startPostsListener = createAsyncThunk(
  'posts/startPostsListener',
  async (_, { dispatch }) => {
    const unsubscribe = firestore().collection('posts')
      .orderBy('time', 'desc')
      .onSnapshot(querySnapshot => {
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          comments: doc.data().comments || [],
          likes: doc.data().likes || 0,
        }));
        dispatch(postsReceived(posts));
      }, error => {
        console.error("Error listening to posts:", error);
      });
    return unsubscribe;
  }
);

export default postSlice.reducer;
