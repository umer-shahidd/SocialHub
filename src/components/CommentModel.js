// src/components/CommentModel.js (Note: assuming file is named CommentModel.js based on previous context)
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { addCommentToPost } from '../store/postSlice'; // Import addCommentToPost

const { height } = Dimensions.get('window');

const CommentModal = ({ visible, onClose, post }) => {
  const [commentText, setCommentText] = useState('');
  const dispatch = useDispatch();

  // Reset comment text when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setCommentText('');
    }
  }, [visible]);

  const handlePostComment = async () => {
    if (!commentText.trim() || !post || !post.id) {
      return;
    }
    try {
      await dispatch(addCommentToPost({ postId: post.id, commentText: commentText.trim() })).unwrap();
      setCommentText('');
      // The Redux listener in Home.js should automatically update the post data
      // which will re-render the comments in this modal if it's still open.
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Handle error, e.g., show an alert
    }
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Icon name="person-pin" size={24} color="#666" style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <Text style={styles.commentAuthor}>{item.author || 'Anonymous'}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.commentTimestamp}>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments ({post?.comments?.length || 0})</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={post?.comments || []}
              keyExtractor={(item) => item.id}
              renderItem={renderCommentItem}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
              }
            />

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.postCommentButton, { opacity: commentText.trim() ? 1 : 0.5 }]}
                onPress={handlePostComment}
                disabled={!commentText.trim()}
              >
                <Icon name="send" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    maxHeight: height * 0.8, // Adjust height as needed
    flex: 1, // Allow content to expand
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexGrow: 1, // Allow FlatList to grow
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    marginRight: 10,
    borderRadius: 12, // Simple placeholder for avatar
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  commentTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100, // Limit height for multiline
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10, // Adjust for multiline
    paddingBottom: 10, // Adjust for multiline
    fontSize: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postCommentButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentModal;