// src/screens/createPost.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView, 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addNewPost } from '../store/postSlice'; 

const { width } = Dimensions.get('window');

const CreatePost = ({ navigation }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const dispatch = useDispatch();

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera picker');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to open camera.');
      } else if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Gallery Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to open gallery.');
      } else if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0]);
      }
    });
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const submitPost = async () => {
    if ((!text.trim() && !selectedImage) || loading) {
      Alert.alert('Validation', 'Please enter some text or select an image to post.');
      return;
    }

    setLoading(true);
    const postData = {
      content: text.trim(),
      image: selectedImage ? {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.fileName || 'image.jpg',
      } : null,
      
    };

    try {
      await dispatch(addNewPost(postData)).unwrap();
      setText('');
      setSelectedImage(null);
      Alert.alert('Success', 'Post created successfully!');
      navigation.navigate('Home');
    } catch (err) {
      console.error('Post creation error:', err);
      Alert.alert('Error', 'Could not create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPostValid = (text.trim().length > 0 || selectedImage) && !loading;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Post</Text>
            <TouchableOpacity
              style={[styles.postButton, { opacity: isPostValid ? 1 : 0.5 }]}
              onPress={submitPost}
              disabled={!isPostValid}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding} showsVerticalScrollIndicator={false}>
            {/* Input Section */}
            <View style={styles.inputSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Icon name="person" size={24} color="#666" />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="What's on your mind?"
                  placeholderTextColor="#999"
                  value={text}
                  onChangeText={setText}
                  multiline
                  style={styles.textInput}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {text.length}/500
                </Text>
              </View>
            </View>

            {/* Image Preview */}
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={handleImagePicker}>
                <Icon name="photo-camera" size={24} color="#1E90FF" />
                <Text style={styles.actionText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="location-on" size={24} color="#1E90FF" />
                <Text style={styles.actionText}>Location</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="mood" size={24} color="#1E90FF" />
                <Text style={styles.actionText}>Feeling</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
    backgroundColor: '#fff',
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    paddingBottom: 30, 
  },
  inputSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 24,
    color: '#333',
    minHeight: 120, // Increased minHeight for more input space
    textAlignVertical: 'top',
    padding: 0, // Remove default padding for consistent layout
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  imagePreviewContainer: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1, // Add border for better visual separation
    borderColor: '#e1e8ed',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    marginTop: 20,
    justifyContent: 'space-around', // Distribute actions evenly
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10, // Adjusted padding
    // marginRight: 20, // Removed for space-around
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: '500',
  },
});

export default CreatePost;