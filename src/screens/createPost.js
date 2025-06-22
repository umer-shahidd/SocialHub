import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert, // Using Alert for simple user feedback as per RN best practices for Modals
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import { Platform } from 'react-native';


import firestore from '@react-native-firebase/firestore';

// ✅ Use correct RNFirebase instances
import {
  authInstance,
  firestoreInstance,
  storageInstance,
} from '../services/firebase';

const CreatePost = ({ navigation, route }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null); // URI of the selected/existing image
  const [initialImageUrl, setInitialImageUrl] = useState(null); // To track original image
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [postId, setPostId] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true); // New state for loading existing post

  useEffect(() => {
    // Check if a postId is passed for editing
    if (route.params?.postId) {
      const id = route.params.postId;
      setPostId(id);
      setIsEditing(true);
      fetchPostData(id);
    } else {
      setIsLoadingPost(false); // No post to load, so done loading
    }
  }, [route.params?.postId]);

  const fetchPostData = async (id) => {
    try {
      const postDoc = await firestoreInstance.collection('posts').doc(id).get();
      if (postDoc.exists) {
        const data = postDoc.data();
        setContent(data.content || '');
        setImage(data.imageUrl || null);
        setInitialImageUrl(data.imageUrl || null); // Store original image URL
      } else {
        setError('Post not found.');
        Alert.alert('Error', 'Post not found.');
        navigation.goBack();
      }
    } catch (err) {
      console.error('Error fetching post for editing:', err);
      setError('Failed to load post for editing.');
      Alert.alert('Error', 'Failed to load post for editing.');
      navigation.goBack();
    } finally {
      setIsLoadingPost(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets?.length) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to select image');
      console.error(err);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    // If we're editing and the image was originally present, it means it needs to be deleted from storage later.
    // We'll handle the actual storage deletion during the post update if initialImageUrl is not null and image becomes null.
  };

  const handlePost = async () => {
    if (!content.trim() && !image) {
      setError('Please add content or select an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let finalImageUrl = image; // Start with the current image state

      // Handle image upload/deletion if image has changed
      if (image !== initialImageUrl) { // Image has been changed or removed
        // If there was an old image and it's now removed or replaced, delete the old one
        if (initialImageUrl) {
          try {
            const oldImagePath = decodeURIComponent(initialImageUrl.split('/o/')[1].split('?')[0]);
            const oldImageRef = storageInstance.ref(oldImagePath);
            await oldImageRef.delete();
            console.log('Old image deleted:', oldImagePath);
          } catch (storageErr) {
            if (storageErr.code === 'storage/object-not-found') {
                console.warn('Old image not found in storage, might have been deleted already.');
            } else {
                console.error('Failed to delete old image from storage:', storageErr);
            }
          }
        }

        // If a new image is selected, upload it
        if (image && image.startsWith('file://')) { // Only upload if it's a new local file URI
          try {
            const fileExt = image.split('.').pop().split('?')[0] || 'jpg';
            const fileName = `post_${Date.now()}.${fileExt}`;
            const storagePath = `posts/${authInstance.currentUser.uid}/${fileName}`;
            const storageRef = storageInstance.ref(storagePath);

            console.log('Uploading new image:', image);
            console.log('Storage path:', storagePath);

            await storageRef.putFile(image);
            const downloadURL = await storageRef.getDownloadURL();
            console.log('New image uploaded. URL:', downloadURL);
            finalImageUrl = downloadURL;
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            setError('Image upload failed. Try again.');
            setUploading(false);
            return;
          }
        } else if (image === null) {
            finalImageUrl = null; // Image was explicitly removed by user
        }
      }

      const postData = {
        content: content.trim(),
        imageUrl: finalImageUrl,
        // likes and commentsCount should not be updated here, they are managed separately
        timestamp: firestore.FieldValue.serverTimestamp(), // Update timestamp on edit
      };

      if (isEditing && postId) {
        // Update existing post
        await firestoreInstance.collection('posts').doc(postId).update(postData);
        Alert.alert('Success', 'Post updated successfully!');
      } else {
        // Create new post
        const newPostData = {
          userId: authInstance.currentUser.uid,
          likes: 0,
          commentsCount: 0,
          ...postData,
        };
        await firestoreInstance.collection('posts').add(newPostData);
        Alert.alert('Success', 'Post created successfully!');
      }

      navigation.goBack();
    } catch (err) {
      console.error('Error creating/updating post:', err);
      setError('Failed to save post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (isLoadingPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 10 }}>Loading post...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="times" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? 'Edit Post' : 'Create Post'}</Text>
        <TouchableOpacity onPress={handlePost} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#4A90E2" />
          ) : (
            <Text style={styles.postButton}>{isEditing ? 'Update' : 'Post'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        multiline
        value={content}
        onChangeText={setContent}
      />

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={handleRemoveImage} style={styles.removeImageButton}>
            <Icon name="times-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Icon name="image" size={24} color="#4A90E2" />
          <Text>Photo</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 2,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CreatePost;
