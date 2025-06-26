import { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/Feather"
import { getApp } from "@react-native-firebase/app"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "@react-native-firebase/auth"
// Import modular functions for Firestore
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "@react-native-firebase/firestore"

const Signup = ({ navigation }) => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill out all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    try {
      const app = getApp()
      const auth = getAuth(app)
      const firestore = getFirestore(app); // Get Firestore instance

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;

      // 1. Update Firebase Auth profile (displayName) - good practice, but not directly used by Home
      await updateProfile(user, { displayName: fullName });

      // 2. Crucial: Save user data to Firestore 'users' collection using modular syntax
      // Get a reference to the 'users' collection
      const usersCollectionRef = collection(firestore, 'users');
      // Get a document reference for the specific user using their UID
      const userDocRef = doc(usersCollectionRef, user.uid);

      // Set the data for the user document
      await setDoc(userDocRef, {
        username: fullName, // This is the field your Home component looks for
        email: email,
        avatarUrl: null, // Initialize avatarUrl as null or a default placeholder
        bio: "", // Initialize bio as empty
        followersCount: 0, // Initialize counts
        followingCount: 0,
        createdAt: serverTimestamp(), // Use modular serverTimestamp
      });

      Alert.alert("Account Created", "Your account has been created successfully!", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ])
    } catch (err) {
      setLoading(false)
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email already in use")
          break
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        case "auth/weak-password":
          setError("Password is too weak")
          break
        default:
          setError("Signup failed. Please try again")
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
            <Text style={styles.subTitle}>Create your Account</Text>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.inactiveTab} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.inactiveTabText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>SignUp</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              onChangeText={setFullName}
              value={fullName}
            />

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
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                onChangeText={setConfirmPassword}
                value={confirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
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
    backgroundColor: "#F5F5DC", // Light cream background to match design
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
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
    fontSize: 14,
  },
  loginLink: {
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

export default Signup
