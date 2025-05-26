import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword
} from '@react-native-firebase/auth';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const app = getApp();
      const auth = getAuth(app);

      await signInWithEmailAndPassword(auth, email, password);

      // Optional: you may want to rely on an auth state listener instead
      navigation.navigate('Home');
    } catch (err) {
      setLoading(false);
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setError('No user found with this email');
          break;
        case 'auth/wrong-password':
          setError('Wrong password');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Try again later');
          break;
        default:
          setError('Login failed. Please try again');
          console.error(err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* Optional title */}
          {/* <Text style={styles.title}>Login</Text> */}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            onChangeText={setEmail} 
            value={email} 
          />

          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            secureTextEntry 
            onChangeText={setPassword} 
            value={password} 
          />

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
            style={{ marginTop: 10 }}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
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
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 10 },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10 },
  loginButton: { 
    backgroundColor: '#007BFF', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    marginTop: 10
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: { color: 'white', fontWeight: '600' },
  linkText: { color: '#007BFF', textAlign: 'center', marginTop: 15 },
});

export default Login;
