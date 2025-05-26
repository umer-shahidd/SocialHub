import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';

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
      await auth().signInWithEmailAndPassword(email, password);
      // Navigation is handled automatically by the auth state listener
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
            style={styles.loginButton} 
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
    marginTop: 10,
    opacity: 1,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: { color: 'white', fontWeight: '600' },
  linkText: { color: '#007BFF', textAlign: 'center', marginTop: 15 },
});

export default Login;