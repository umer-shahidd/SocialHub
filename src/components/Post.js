import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MoreHorizontal } from 'react-native-feather';

const PostItem = ({ post, onAuthorPress }) => {
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.authorContainer}
          onPress={() => onAuthorPress?.(post)}
        >
          <Image source={post.avatar} style={styles.avatar} />
          <View>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.timeAgo}>{post.timeAgo}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <MoreHorizontal stroke="#555" />
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>
      <Image source={post.image} style={styles.postImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 15,
  },
  timeAgo: {
    fontSize: 12,
    color: '#888',
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
});

export default PostItem;
