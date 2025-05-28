// src/components/Post.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; // For icons
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // For comment icon

const Post = ({ post, onAuthorPress, onCommentPress, onLikePress }) => {
  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity onPress={() => onAuthorPress(post)} style={styles.authorInfo}>
          <Image
            source={post.avatar ? { uri: post.avatar } : require('../assets/Avatar/Woman.jpg')} // Fallback avatar
            style={styles.avatar}
          />
          <View>
            <Text style={styles.authorName}>{post.author || 'Anonymous User'}</Text>
            <Text style={styles.postTime}>{post.time || 'Just now'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Post Content - Caption */}
      {post.content && <Text style={styles.postCaption}>{post.content}</Text>}

      {/* Post Image */}
      {post.image && post.image.uri && (
        <Image source={{ uri: post.image.uri }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Post Footer - Stats and Actions */}
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <Text style={styles.statText}>{post.likes || 0} Likes</Text>
          <Text style={styles.statText}>{post.comments ? post.comments.length : 0} Comments</Text>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => onLikePress(post)} style={styles.actionButton}>
            <FontAwesome5 name="heart" size={20} color={post.liked ? '#ff0000' : '#666'} solid={post.liked} />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onCommentPress(post)} style={styles.actionButton}>
            <MaterialCommunityIcons name="comment-text-multiple-outline" size={22} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          {/* Share and Save icons removed as requested */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#888',
  },
  postCaption: {
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  postImage: {
    width: '100%',
    height: 250,
    marginBottom: 8,
  },
  postFooter: {
    padding: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  statText: {
    fontSize: 13,
    color: '#555',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
});

export default Post;