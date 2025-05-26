"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { getApp } from "@react-native-firebase/app"
import { getAuth, signInWithEmailAndPassword } from "@react-native-firebase/auth"

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const app = getApp()
      const auth = getAuth(app)

      await signInWithEmailAndPassword(auth, email, password)
      navigation.navigate("Home")
    } catch (err) {
      setLoading(false)
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        case "auth/user-not-found":
          setError("No user found with this email")
          break
        case "auth/wrong-password":
          setError("Wrong password")
          break
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later")
          break
        default:
          setError("Login failed. Please try again")
          console.error(err)
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.appTitle}>SocialHub</Text>
            <Text style={styles.tagline}>Connect • Share • Discover</Text>
            <Text style={styles.subTitle}>Sign in to your Account</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveTab} onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.inactiveTabText}>SignUp</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? "Logging in..." : "Login"}</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5DC",
  },
  keyboardAvoid: { flex: 1 },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 40,
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#1E90FF",
    borderRadius: 20,
    alignItems: "center",
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  inactiveTabText: {
    color: "#666",
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#1E90FF",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#1E90FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#666",
    fontSize: 14,
  },
  signupLink: {
    color: "#1E90FF",
    fontWeight: "600",
    fontSize: 14,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
    backgroundColor: "#FFE6E6",
    padding: 10,
    borderRadius: 8,
  },
})

export default Login
