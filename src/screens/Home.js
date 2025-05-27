// src/screens/Home.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import { startPostsListener } from '../store/postSlice';
import PostForm from '../components/PostForm';        // ⬅️ new composer
import PostItem from '../components/Post';
import CommentModal from '../components/CommentModel';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();

  /** 🔗 live post list from Redux */
  const posts = useSelector(state => state.posts.items);

  /** local UI state (modal) */
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost,        setSelectedPost]        = useState(null);
  const [commentCount,        setCommentCount]        = useState(0);

  /** 🔔 start / stop Firestore realtime listener */
  useEffect(() => {
    let unsubscribe;                   // keep the cleanup fn
    dispatch(startPostsListener())
      .unwrap()                        // returns payload (unsubscribe fn)
      .then(unsub => { unsubscribe = unsub; });

    return () => { if (unsubscribe) unsubscribe(); };
  }, [dispatch]);

  /* ——— navigation helpers ——— */
  const handleAuthorPress = post => {
    navigation.navigate('Profile', {
      profile: {
        name        : post.author,
        profileImage: post.avatar ? { uri: post.avatar } : null,
        bio         : 'Traveler | Content Creator',
      },
    });
  };

  const handleMyProfilePress = () => navigation.navigate('UserProfile');

  const handleCommentPress = post => {
    setSelectedPost(post);
    setCommentCount(post.comments ? post.comments.length : 0);
    setCommentModalVisible(true);
  };

  const handleCloseCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPost(null);
  };

  /* ——— UI ——— */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={handleMyProfilePress}>
          <Image
            source={require('../assets/Avatar/Woman.jpg')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* New-post composer */}
      <PostForm />

      {/* Feed */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onAuthorPress={handleAuthorPress}
            onCommentPress={handleCommentPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Comment modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={handleCloseCommentModal}
        post={selectedPost}
        commentCount={commentCount}
        setCommentCount={setCommentCount}
      />
    </SafeAreaView>
  );
};

/* ——— styles ——— */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerSpacer: { width: 36 },    // balance for centred title
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listContent: {
    paddingBottom: 80,
    paddingTop: 8,
  },
});

export default Home;
