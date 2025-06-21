import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {launchImageLibrary} from 'react-native-image-picker';
import { Platform } from 'react-native';


import firestore from '@react-native-firebase/firestore';

// ✅ Use correct RNFirebase instances
import {
  authInstance,
  firestoreInstance,
  storageInstance,
} from '../services/firebase';

const CreatePost = ({navigation}) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

const getFileExtension = (uri) => {
  const match = uri.match(/\.(\w+)(\?.*)?$/);
  return match ? match[1] : 'jpg'; // Fallback to jpg
};

const handlePost = async () => {
  if (!content.trim() && !image) {
    setError('Please add content or select an image');
    return;
  }

  setUploading(true);
  setError('');

  try {
    let imageUrl = null;

   if (image) {
  try {
    const fileExt = image.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `post_${Date.now()}.${fileExt}`;
    const storagePath = `posts/${authInstance.currentUser.uid}/${fileName}`;
    const storageRef = storageInstance.ref(storagePath);

    console.log('Uploading image:', image);
    console.log('Storage path:', storagePath);

    // Upload file
    await storageRef.putFile(image);

    // Now get download URL
    const downloadURL = await storageRef.getDownloadURL();
    console.log('Image uploaded. URL:', downloadURL);

    imageUrl = downloadURL;
  } catch (uploadError) {
    console.error('Image upload failed:', uploadError);
    setError('Image upload failed. Try again.');
    setUploading(false);
    return;
  }
}


    // Upload post content to Firestore
    await firestoreInstance.collection('posts').add({
      userId: authInstance.currentUser.uid,
      content: content.trim(),
      imageUrl,
      likes: 0,
      commentsCount: 0,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    navigation.goBack();
  } catch (err) {
    console.error('Error creating post:', err);
    setError('Failed to create post. Please try again.');
  } finally {
    setUploading(false);
  }
};


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="times" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#4A90E2" />
          ) : (
            <Text style={styles.postButton}>Post</Text>
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
        <Image
          source={{uri: image}}
          style={styles.previewImage}
          resizeMode="cover"
        />
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
  previewImage: {
    width: '100%',
    height: 300,
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
