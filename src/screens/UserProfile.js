import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  Edit,
  Mail,
  Camera,
  User,
  Info,
  Globe,
  Phone,
  MapPin
} from 'react-native-feather';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

const UserProfile = ({ route, navigation }) => {
  const [profile, setProfile] = useState({
    name: 'Loading...',
    bio: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    profileImage: null,
  });
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const insets = useSafeAreaInsets();

  // Fetch user data and profile image
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        let imageUrl = null;
        
        // First try to get image from Firebase Auth photoURL
        if (user.photoURL) {
          imageUrl = { uri: user.photoURL };
        } else {
          // If no photoURL, try to get from Firebase Storage
          try {
            const storageRef = storage().ref(`profile_images/${user.uid}`);
            imageUrl = { uri: await storageRef.getDownloadURL() };
          } catch (storageError) {
            console.log('No custom profile image found in Storage');
          }
        }

        setProfile({
          name: user.displayName || 'No name set',
          bio: '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          website: '',
          location: '',
          profileImage: imageUrl,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFieldChange = async (field, value) => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      if (field === 'name') {
        await user.updateProfile({
          displayName: value
        });
      } else if (field === 'email') {
        await user.updateEmail(value);
      }
      
      setProfile(prev => ({ ...prev, [field]: value }));
      setEditingField(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error updating profile:', error);
    }
  };

  const handleEditPress = (field) => {
    setEditingField(editingField === field ? null : field);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to select photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const uploadImage = async (uri) => {
    const user = auth().currentUser;
    if (!user) return;

    setUploading(true);
    
    try {
      const filename = `profile_images/${user.uid}`;
      const reference = storage().ref(filename);
      
      // Upload the image
      await reference.putFile(uri);
      
      // Get the download URL
      const downloadURL = await reference.getDownloadURL();
      
      // Update user profile with the new photo URL
      await user.updateProfile({
        photoURL: downloadURL
      });
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        profileImage: { uri: downloadURL }
      }));
      
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const selectImage = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission required', 'Please allow storage access to select images');
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
        includeBase64: false,
      };

      const response = await launchImageLibrary(options);
      
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select image');
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        uploadImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          {profile.profileImage ? (
            <Image 
              source={profile.profileImage} 
              style={styles.profileImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.profileImage, styles.defaultAvatar]}>
              <Text style={styles.avatarText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.cameraIcon} 
            onPress={selectImage}
            activeOpacity={0.7}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Camera width={18} height={18} stroke="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>

      <View style={styles.detailsSection}>
        <ProfileField
          label="Name"
          IconLeft={User}
          value={profile.name}
          isEditing={editingField === 'name'}
          onEditPress={() => handleEditPress('name')}
          onChangeText={(text) => handleFieldChange('name', text)}
        />

        <ProfileField
          label="Bio"
          IconLeft={Info}
          value={profile.bio}
          isEditing={editingField === 'bio'}
          onEditPress={() => handleEditPress('bio')}
          onChangeText={(text) => handleFieldChange('bio', text)}
          multiline
        />

        <ProfileField
          label="Email"
          IconLeft={Mail}
          value={profile.email}
          isEditing={editingField === 'email'}
          onEditPress={() => handleEditPress('email')}
          onChangeText={(text) => handleFieldChange('email', text)}
        />

        <ProfileField
          label="Phone"
          IconLeft={Phone}
          value={profile.phone}
          isEditing={editingField === 'phone'}
          onEditPress={() => handleEditPress('phone')}
          onChangeText={(text) => handleFieldChange('phone', text)}
        />

        <ProfileField
          label="Website"
          IconLeft={Globe}
          value={profile.website}
          isEditing={editingField === 'website'}
          onEditPress={() => handleEditPress('website')}
          onChangeText={(text) => handleFieldChange('website', text)}
        />

        <ProfileField
          label="Location"
          IconLeft={MapPin}
          value={profile.location}
          isEditing={editingField === 'location'}
          onEditPress={() => handleEditPress('location')}
          onChangeText={(text) => handleFieldChange('location', text)}
        />
      </View>
    </SafeAreaView>
  );
};

const ProfileField = ({ label, IconLeft, value, isEditing, onEditPress, onChangeText, multiline = false }) => {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldContent}>
        <View style={styles.iconContainer}>
          <IconLeft width={18} height={18} stroke="#6b7280" />
        </View>

        <View style={styles.fieldTextContainer}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
              value={value}
              onChangeText={onChangeText}
              multiline={multiline}
              autoFocus
            />
          ) : (
            <Text style={styles.fieldValue}>{value || 'Not set'}</Text>
          )}
        </View>

        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <Edit width={18} height={18} stroke={isEditing ? '#10b981' : '#9ca3af'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#e2e8f0',
  },
  defaultAvatar: {
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '80%',
  },
  detailsSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  fieldContainer: {
    marginVertical: 12,
  },
  fieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldTextContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
  },
  input: {
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  editButton: {
    padding: 8,
  },
});

export default UserProfile;