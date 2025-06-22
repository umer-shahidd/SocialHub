import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const Home = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [followLoading, setFollowLoading] = useState({});
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search bar
  const isFocused = useIsFocused();

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async currentUser => {
      try {
        if (currentUser) {
          setUser(currentUser);
          const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
          if (userDoc.exists) {
            setCurrentUserProfile(userDoc.data());
          }
        }
      } catch (err) {
        console.error('Auth state error:', err);
        setError('Failed to load user data');
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user || !isFocused) return;

    // Real-time posts listener
    const postsQuery = firestore()
      .collection('posts')
      .orderBy('timestamp', 'desc');

    const unsubscribePosts = postsQuery.onSnapshot(
      async (snapshot) => {
        try {
          setLoading(true);
          setError(null);

          // Process all document changes
          const newPosts = [];
          const removedIds = [];

          snapshot.docChanges().forEach(change => {
            try {
              if (change.type === 'removed') {
                removedIds.push(change.doc.id);
              } else if (change.type === 'added' || change.type === 'modified') {
                const data = change.doc.data();

                // Validate required fields
                if (!data.userId || !data.timestamp) {
                  console.warn('Invalid post data:', data);
                  return;
                }

                newPosts.push({
                  id: change.doc.id,
                  ...data,
                  timestamp: data.timestamp?.toDate?.(),
                });
              }
            } catch (changeErr) {
              console.error('Change processing error:', changeErr);
            }
          });

          // Process removed posts
          if (removedIds.length > 0) {
            setPosts(prev => prev.filter(p => !removedIds.includes(p.id)));
          }

          if (newPosts.length === 0) {
            setLoading(false);
            return;
          }

          // Get user IDs for new posts
          const userIds = [...new Set(newPosts.map(post => post.userId))];
          const usersMap = await fetchUsersByIds(userIds);

          // Get current user's likes and follows
          const [likedSnapshot, followsSnapshot] = await Promise.all([
            firestore().collection('likes')
              .where('userId', '==', user.uid)
              .get()
              .catch(err => {
                console.error('Likes query error:', err);
                return { docs: [] };
              }),
            firestore().collection('follows')
              .where('followerId', '==', user.uid)
              .get()
              .catch(err => {
                console.error('Follows query error:', err);
                return { docs: [] };
              })
          ]);

          const likedIds = new Set(likedSnapshot.docs.map(doc => doc.data().postId));
          const followingIds = new Set(followsSnapshot.docs.map(doc => doc.data().followingId));

          // Enrich post data
          const enrichedPosts = newPosts.map(post => {
            const userInfo = usersMap[post.userId] || {};
            return {
              ...post,
              author: userInfo.username || 'Unknown',
              avatar: userInfo.avatarUrl ? { uri: userInfo.avatarUrl } : null,
              likedByUser: likedIds.has(post.id),
              isFollowing: followingIds.has(post.userId)
            };
          });

          // Update state
          setPosts(prev => {
            // Create a map of existing posts for quick lookup
            const existingPostsMap = new Map(prev.map(p => [p.id, p]));

            // Merge new posts with existing ones
            const mergedPosts = enrichedPosts.map(newPost => {
              const existingPost = existingPostsMap.get(newPost.id);
              // Preserve local state if exists
              return existingPost ? { ...existingPost, ...newPost } : newPost;
            });

            // Add any existing posts not in the new data
            const remainingPosts = prev.filter(p =>
              !enrichedPosts.some(np => np.id === p.id)
            );

            return [...mergedPosts, ...remainingPosts].sort(
              (a, b) => b.timestamp - a.timestamp
            );
          });
        } catch (err) {
          console.error('Snapshot processing error:', err);
          setError('Failed to load posts');
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      (firestoreError) => {
        console.error('Firestore listener error:', firestoreError);
        setError('Connection error. Please check your network.');
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => {
      if (unsubscribePosts) unsubscribePosts();
    };
  }, [user, isFocused]);

  const fetchUsersByIds = async (userIds) => {
    const users = {};
    if (!userIds || userIds.length === 0) return users;

    try {
      const batchSize = 10;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const snapshot = await firestore()
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', batch)
          .get();

        snapshot.forEach(doc => {
          if (doc.exists) {
            users[doc.id] = doc.data();
          }
        });
      }
    } catch (err) {
      console.error('User fetch error:', err);
    }
    return users;
  };

  const refreshPosts = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Force a refresh by resetting the listener
      if (user) {
        // This will trigger the onSnapshot listener again
        // We don't need to do anything extra as the listener will handle it
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Failed to refresh posts');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLikePress = async (postId) => {
    if (!user || !postId) return;

    try {
      // Optimistic UI update
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? {
            ...post,
            likedByUser: !post.likedByUser,
            likes: post.likedByUser ? (post.likes || 0) - 1 : (post.likes || 0) + 1
          } : post
        )
      );

      const likeQuery = await firestore()
        .collection('likes')
        .where('postId', '==', postId)
        .where('userId', '==', user.uid)
        .get();

      if (likeQuery.empty) {
        await firestore().collection('likes').add({
          postId,
          userId: user.uid,
          timestamp: firestore.FieldValue.serverTimestamp()
        });
        await firestore().collection('posts').doc(postId).update({
          likes: firestore.FieldValue.increment(1)
        });
      } else {
        likeQuery.forEach(async (doc) => await doc.ref.delete());
        await firestore().collection('posts').doc(postId).update({
          likes: firestore.FieldValue.increment(-1)
        });
      }
    } catch (err) {
      console.error('Like error:', err);
      // Revert optimistic update on error
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? {
            ...post,
            likedByUser: !post.likedByUser,
            likes: post.likedByUser ? (post.likes || 0) + 1 : (post.likes || 0) - 1
          } : post
        )
      );
    }
  };

  const fetchComments = async (postId) => {
    if (!postId) return;

    try {
      const snapshot = await firestore()
        .collection('comments')
        .where('postId', '==', postId)
        .orderBy('timestamp', 'asc')
        .get();

      const commentData = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          try {
            const userSnap = await firestore().collection('users').doc(data.userId).get();
            return {
              id: docSnap.id,
              ...data,
              timestamp: data.timestamp?.toDate?.(),
              author: userSnap.exists ? userSnap.data()?.username || 'Unknown' : 'Deleted User'
            };
          } catch (userErr) {
            console.error('User fetch error:', userErr);
            return {
              id: docSnap.id,
              ...data,
              timestamp: data.timestamp?.toDate?.(),
              author: 'Unknown'
            };
          }
        })
      );
      setComments(commentData);
    } catch (err) {
      console.error('Comments error:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !user) return;

    try {
      // Optimistic UI update
      const tempComment = {
        id: `temp-${Date.now()}`,
        text: newComment,
        author: currentUserProfile?.username || 'You',
        userId: user.uid,
        timestamp: new Date()
      };

      setComments(prev => [...prev, tempComment]);
      setNewComment('');

      // Actual Firestore operation
      await firestore().collection('comments').add({
        postId: selectedPost.id,
        userId: user.uid,
        text: newComment,
        timestamp: firestore.FieldValue.serverTimestamp()
      });

      await firestore().collection('posts').doc(selectedPost.id).update({
        commentsCount: firestore.FieldValue.increment(1)
      });

      // Refresh comments to get actual data
      fetchComments(selectedPost.id);
    } catch (err) {
      console.error('Comment error:', err);
      // Revert optimistic update
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      setNewComment(tempComment.text);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!postId) return;

    try {
      // Optimistic removal
      setPosts(prev => prev.filter(p => p.id !== postId));

      const postRef = firestore().collection('posts').doc(postId);
      const postDoc = await postRef.get();

      if (!postDoc.exists) return;

      const postData = postDoc.data();
      await postRef.delete();

      // Delete image if exists
      if (postData?.imageUrl) {
        try {
          const imagePath = decodeURIComponent(postData.imageUrl.split('/o/')[1].split('?')[0]);
          const imageRef = storage().ref(imagePath);
          await imageRef.delete();
        } catch (storageErr) {
          console.error('Image delete error:', storageErr);
        }
      }

      // Delete related likes & comments
      const batch = firestore().batch();

      try {
        const likes = await firestore()
          .collection('likes')
          .where('postId', '==', postId)
          .get();
        likes.forEach(doc => batch.delete(doc.ref));
      } catch (likesErr) {
        console.error('Likes delete error:', likesErr);
      }

      try {
        const comments = await firestore()
          .collection('comments')
          .where('postId', '==', postId)
          .get();
        comments.forEach(doc => batch.delete(doc.ref));
      } catch (commentsErr) {
        console.error('Comments delete error:', commentsErr);
      }

      await batch.commit();
    } catch (err) {
      console.error('Post delete error:', err);
      setError('Failed to delete post');
      // Revert optimistic removal
      if (selectedPost) {
        setPosts(prev => [...prev, selectedPost]);
      }
    }
  };

  const handleFollow = async (targetUserId) => {
    if (!user || user.uid === targetUserId || !targetUserId) return;

    try {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));

      const followQuery = await firestore()
        .collection('follows')
        .where('followerId', '==', user.uid)
        .where('followingId', '==', targetUserId)
        .get();

      if (followQuery.empty) {
        await firestore().collection('follows').add({
          followerId: user.uid,
          followingId: targetUserId,
          timestamp: firestore.FieldValue.serverTimestamp()
        });

        // Optimistic update
        setPosts(prev =>
          prev.map(post =>
            post.userId === targetUserId ? { ...post, isFollowing: true } : post
          )
        );
      } else {
        followQuery.forEach(async doc => await doc.ref.delete());

        // Optimistic update
        setPosts(prev =>
          prev.map(post =>
            post.userId === targetUserId ? { ...post, isFollowing: false } : post
          )
        );
      }
    } catch (err) {
      console.error('Follow error:', err);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (date) => {
    if (!date) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Memoize filtered posts for efficient re-renders
  const filteredPosts = useMemo(() => {
    if (!searchQuery) {
      return posts;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.author && post.author.toLowerCase().includes(lowerCaseQuery)
    );
  }, [posts, searchQuery]);


  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        {item.avatar ? (
          <Image source={item.avatar} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <FontAwesome name="user" size={20} color="#666" />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.author}</Text>
          <Text style={styles.timestamp}>
            {formatTimeAgo(item.timestamp)}
          </Text>
        </View>
        {user?.uid !== item.userId && (
          <TouchableOpacity
            onPress={() => handleFollow(item.userId)}
            disabled={followLoading[item.userId]}
            style={[
              styles.followButton,
              item.isFollowing && styles.followingButton
            ]}
          >
            <Text style={[
              styles.followButtonText,
              item.isFollowing && styles.followingButtonText
            ]}>
              {item.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.caption}>{item.content}</Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => handleLikePress(item.id)}
          style={styles.actionButton}
        >
          <FontAwesome
            name={item.likedByUser ? 'heart' : 'heart-o'}
            size={20}
            color={item.likedByUser ? 'red' : '#333'}
          />
          <Text style={styles.actionCount}>{item.likes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedPost(item);
            setCommentModalVisible(true);
            fetchComments(item.id);
          }}
          style={styles.actionButton}
        >
          <FontAwesome name="comment-o" size={20} color="#333" />
          <Text style={styles.actionCount}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <FontAwesome name="share" size={20} color="#333" />
          <Text style={styles.actionCount}>0</Text>
        </TouchableOpacity>

        {user?.uid === item.userId && (
          <>
            {/* Edit Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('CreatePost', { postId: item.id })}
              style={styles.actionButton}
            >
              <FontAwesome name="pencil" size={20} color="#4A90E2" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeletePost(item.id)}
              style={styles.actionButton}
            >
              <FontAwesome name="trash" size={20} color="#D11A2A" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {currentUserProfile?.avatarUrl ? (
            <Image
              source={{ uri: currentUserProfile.avatarUrl }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <FontAwesome name="user" size={20} color="#666" />
            </View>
          )}
        </TouchableOpacity>
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing" // iOS-specific clear button
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <FontAwesome name="times-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refreshPosts}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator size="large" style={{ marginTop: 100 }} />
      ) : filteredPosts.length === 0 && searchQuery ? ( // Show empty message if searching and no results
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
          <Text style={styles.emptySubtext}>Try a different name</Text>
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.refreshButton}>
            <FontAwesome name="times" size={20} color="#4A90E2" />
            <Text style={styles.refreshText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPosts.length === 0 && !searchQuery ? ( // Show general empty message if no posts at all
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Create your first post or follow users</Text>
          <TouchableOpacity onPress={refreshPosts} style={styles.refreshButton}>
            <FontAwesome name="refresh" size={20} color="#4A90E2" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts} // Use filteredPosts here
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshPosts}
              colors={['#4A90E2']}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal visible={commentModalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 16 }}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
              <FontAwesome name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{item.author}</Text>
                  <Text style={styles.commentTime}>
                    {item.timestamp?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'}
                  </Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noComments}>No comments yet</Text>
            }
            contentContainerStyle={{ flexGrow: 1 }}
          />

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              editable={!!user}
            />
            <TouchableOpacity
              onPress={handleAddComment}
              style={[
                styles.sendButton,
                !newComment.trim() && styles.disabledButton
              ]}
              disabled={!newComment.trim() || !user}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the center
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    gap: 10, // Space between profile icon and search bar
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  // New styles for search bar
  searchContainer: {
    flex: 1, // Take up remaining space
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40, // Fixed height for consistency
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0, // Remove default vertical padding
  },
  clearSearchButton: {
    marginLeft: 8,
    padding: 4, // Add padding to make touch target larger
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#b71c1c',
    textAlign: 'center',
  },
  retryText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  refreshText: {
    color: '#4A90E2',
    marginLeft: 5,
    fontWeight: 'bold'
  },
  postCard: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 13,
    color: '#777'
  },
  caption: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 14,
    color: '#666',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 20,
    flex: 1
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
    minWidth: 60
  },
  disabledButton: {
    backgroundColor: '#cccccc'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  commentItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  commentAuthor: {
    fontWeight: 'bold'
  },
  commentTime: {
    fontSize: 12,
    color: '#666'
  },
  commentText: {
    fontSize: 14
  },
  noComments: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10
  },
  followButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  followingButton: {
    backgroundColor: '#4A90E2',
  },
  followButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  followingButtonText: {
    color: 'white',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4A90E2',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 10,
  },
});

export default Home;
