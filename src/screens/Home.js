import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostItem from '../components/Post';

const posts = [
  {
    id: '1',
    author: 'Emma Wilson',
    avatar: require('../assets/Avatar/Woman.jpg'),
    timeAgo: '5h ago',
    content: 'Loving the vibes here 😊',
    image: require('../assets/Posts/Post2.jpg'),
  },
  {
    id: '2',
    author: 'Robert Smith',
    avatar: require('../assets/Avatar/Man.jpg'),
    timeAgo: '5h ago',
    content: 'Loving the vibes here 😊',
    image: require('../assets/Posts/Post3.jpg'),
  },
  {
    id: '3',
    author: 'Ellie Brown',
    avatar: require('../assets/Avatar/Man.jpg'),
    timeAgo: '5h ago',
    content: 'Loving the vibes here 😊',
    image: require('../assets/Posts/Post1.jpg'),
  },
  {
    id: '4',
    author: 'Jane Doe',
    avatar: require('../assets/Avatar/Man.jpg'),
    timeAgo: '1d ago',
    content: 'Desert adventures are always the best!',
    image: require('../assets/Posts/Post4.jpg'),
  },
];

const Home = ({ navigation }) => {
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
          <PostItem post={item} onAuthorPress={handleAuthorPress} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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