import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Alert
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  sendPasswordResetEmail
} from '@react-native-firebase/auth';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const app = getApp();
      const auth = getAuth(app);

      await sendPasswordResetEmail(auth, email);

      Alert.alert(
        'Email Sent',
        'A password reset link has been sent to your email address',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error(err);
      let message = 'An error occurred. Please try again.';
      if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No user found with this email address.';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>

          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            keyboardType="email-address" 
            autoCapitalize="none" 
            onChangeText={setEmail} 
            value={email} 
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleResetPassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Back to Login</Text>
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
  subtitle: { textAlign: 'center', marginBottom: 20, color: '#666' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 20 },
  button: { 
    backgroundColor: '#007BFF', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: { color: 'white', fontWeight: '600' },
  linkText: { color: '#007BFF', textAlign: 'center' },
});

export default ForgotPassword;
