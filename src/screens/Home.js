import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostItem from '../components/Post';
import CommentModal from '../components/CommentModel';

const posts = [
  {
    id: '1',
    author: 'Emma Wilson',
    avatar: require('../assets/Avatar/Woman.jpg'),
    timeAgo: '5h ago',
    content: 'Loving the vibes here 😊',
    image: require('../assets/Posts/Post2.jpg'),
    likes: 24,
    comments: 3,
  },
  {
    id: '2',
    author: 'Robert Smith',
    avatar: require('../assets/Avatar/Man.jpg'),
    timeAgo: '5h ago',
    content: 'Loving the vibes here 😊',
    image: require('../assets/Posts/Post3.jpg'),
    likes: 18,
    comments: 7,
  },
  {
    id: '3',
    author: 'Ellie Brown',
    avatar: require('../assets/Avatar/Man.jpg'),
    timeAgo: '5h ago',
    content: 'Loving the vibes here 😊',
    image: require('../assets/Posts/Post1.jpg'),
    likes: 42,
    comments: 12,
  },
  {
    id: '4',
    author: 'Jane Doe',
    avatar: require('../assets/Avatar/Man.jpg'),
    timeAgo: '1d ago',
    content: 'Desert adventures are always the best!',
    image: require('../assets/Posts/Post4.jpg'),
    likes: 67,
    comments: 5,
  },
];

const Home = ({ navigation }) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  const handleAuthorPress = (post) => {
    navigation.navigate('Profile', {
      profile: {
        name: post.author,
        profileImage: post.avatar,
        bio: 'Traveler | Content Creator',
      },
    });
  };

  const handleMyProfilePress = () => {
    navigation.navigate('UserProfile', {
      screen: 'UserProfile',
      params: {
        profile: {
          name: 'Jane Doe',
          profileImage: require('../assets/Avatar/Man.jpg'),
          bio: 'Digital creator | Travel enthusiast',
          email: 'jane.doe@example.com',
        },
      },
    });
  };

  const handleCommentPress = (post, currentCommentCount, setCurrentCommentCount) => {
    setSelectedPost(post);
    setCommentCount(currentCommentCount);
    setCommentModalVisible(true);
  };

  const handleCloseCommentModal = () => {
    setCommentModalVisible(false);
    setSelectedPost(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
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
  headerSpacer: {
    width: 36, // Same as avatar width for balance
  },
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