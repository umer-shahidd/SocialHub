// src/screens/Home.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { startPostsListener } from '../store/postSlice';
import Post from '../components/Post';
import CommentModal from '../components/CommentModel';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const posts = useSelector(state => state.posts.items);

  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    let unsubscribe;
    dispatch(startPostsListener())
      .unwrap()
      .then(unsub => { unsubscribe = unsub; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [dispatch]);

  const handleAuthorPress = post => {
    navigation.navigate('Profile', {
      profile: {
        name: post.author,
        profileImage: post.avatar ? { uri: post.avatar } : null,
        bio: 'Traveler | Content Creator',
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

  const handleLikePress = post => {
    console.log('Like pressed for post:', post.id);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconContainer}>
          <FontAwesome5 name="bars" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SocialHub</Text>
        <TouchableOpacity onPress={handleMyProfilePress} style={styles.headerRight}>
          <Image
            source={require('../assets/Avatar/Woman.jpg')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Post
            post={item}
            onAuthorPress={handleAuthorPress}
            onCommentPress={handleCommentPress}
            onLikePress={handleLikePress}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
  headerIconContainer: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  headerRight: {},
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
