import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from '@react-native-firebase/auth';

const Signup = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const app = getApp(); // Get the default Firebase app
      const auth = getAuth(app); // Get the auth instance

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });

      Alert.alert(
        'Account Created',
        'Your account has been created successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      setLoading(false);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email already in use');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        default:
          setError('Signup failed. Please try again');
          console.error(err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Create an account</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            onChangeText={setFullName}
            value={fullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff7e1' },
  keyboardAvoid: { flex: 1 },
  scrollView: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  passwordInput: { flex: 1, padding: 10 },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10 },
  registerButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonText: { color: 'white', fontWeight: '600' },
  linkText: { color: '#007BFF', textAlign: 'center', marginTop: 15 }
});

export default Signup;
