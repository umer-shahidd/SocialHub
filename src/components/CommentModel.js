import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { X, Send } from 'react-native-feather';

const CommentModal = ({ 
  visible, 
  onClose, 
  post, 
  commentCount, 
  setCommentCount 
}) => {
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Alice Johnson',
      avatar: require('../assets/Avatar/Woman.jpg'),
      content: 'Great photo! Love the vibes 🔥',
      timeAgo: '2h ago',
    },
    {
      id: '2',
      author: 'Mike Chen',
      avatar: require('../assets/Avatar/Man.jpg'),
      content: 'This looks amazing! Where was this taken?',
      timeAgo: '1h ago',
    },
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [slideAnim] = useState(new Animated.Value(0));
  const textInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Focus the text input when modal opens
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        author: 'You',
        avatar: require('../assets/Avatar/Woman.jpg'), // User's avatar
        content: newComment.trim(),
        timeAgo: 'now',
      };
      
      setComments([comment, ...comments]);
      setCommentCount(commentCount + 1);
      setNewComment('');
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={item.avatar} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.author}</Text>
          <Text style={styles.commentTime}>{item.timeAgo}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0],
                })
              }]
            }
          ]}
        >
          <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Comments</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X stroke="#333" width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* Post Preview */}
            <View style={styles.postPreview}>
              <Image source={post?.avatar} style={styles.postAuthorAvatar} />
              <View style={styles.postInfo}>
                <Text style={styles.postAuthor}>{post?.author}</Text>
                <Text style={styles.postContent} numberOfLines={2}>
                  {post?.content}
                </Text>
              </View>
            </View>

            {/* Comments List */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              style={styles.commentsList}
              showsVerticalScrollIndicator={false}
              inverted={false}
            />

            {/* Comment Input */}
            <View style={styles.inputContainer}>
              <Image 
                source={require('../assets/Avatar/Woman.jpg')} 
                style={styles.inputAvatar} 
              />
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline={true}
                maxLength={500}
              />
              <TouchableOpacity 
                onPress={handleAddComment}
                style={[
                  styles.sendButton,
                  { opacity: newComment.trim() ? 1 : 0.5 }
                ]}
                disabled={!newComment.trim()}
              >
                <Send stroke="#007AFF" width={20} height={20} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  postPreview: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postAuthorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 5,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
    marginBottom: 5,
  },
});

export default CommentModal;