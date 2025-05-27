// src/services/postService.js
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// 🔸 create a new post ---------------------------------
export const createPost = async ({ content, imageURL = null }) => {
  const user = auth().currentUser;
  if (!user) throw new Error('Not authenticated');

  await firestore().collection('posts').add({
    userId   : user.uid,
    author   : user.displayName || 'Anonymous',
    avatar   : user.photoURL    || null,
    content,
    imageURL,
    createdAt: firestore.FieldValue.serverTimestamp(),
    likes    : [],       // array of userIds
    comments : []        // array of {id, userId, author, text, createdAt}
  });
};

// 🔸 real-time listener (returns unsubscribe fn) -------
export const listenPosts = (onUpdate) =>
  firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .onSnapshot(snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onUpdate(list);
    });

// 🔸 toggle like ---------------------------------------
export const toggleLike = async (postId, alreadyLiked) => {
  const uid = auth().currentUser.uid;
  const ref = firestore().collection('posts').doc(postId);
  await ref.update({
    likes: alreadyLiked
      ? firestore.FieldValue.arrayRemove(uid)
      : firestore.FieldValue.arrayUnion(uid)
  });
};

// 🔸 add a comment -------------------------------------
export const addComment = async (postId, text) => {
  const user = auth().currentUser;
  const ref  = firestore().collection('posts').doc(postId);
  const comment = {
    id        : Date.now().toString(),
    userId    : user.uid,
    author    : user.displayName || 'You',
    avatar    : user.photoURL    || null,
    text,
    createdAt : firestore.FieldValue.serverTimestamp()
  };
  await ref.update({
    comments : firestore.FieldValue.arrayUnion(comment)
  });
};
