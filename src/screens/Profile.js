import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  ArrowLeft,
  Settings,
  Grid,
  Bookmark,
  Heart,
} from "react-native-feather";
import { SafeAreaView } from "react-native-safe-area-context";

const postImages = [
  require("../assets/Posts/Post1.jpg"),
  require("../assets/Posts/Post2.jpg"),
  require("../assets/Posts/Post3.jpg"),
  require("../assets/Posts/Post4.jpg"),
  require("../assets/Posts/Post5.jpg"),
  require("../assets/Posts/Post6.jpg"),
];

const Profile = ({ navigation, route }) => {
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    bio: "Digital creator | Travel enthusiast",
    profileImage: require("../assets/Avatar/Woman.jpg"),
  });

  useEffect(() => {
    if (route.params?.profile) {
      setProfile(route.params.profile);
    }
  }, [route.params?.profile]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft stroke="#000" width={24} height={24} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Settings stroke="#000" width={24} height={24} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <Image source={profile.profileImage} style={styles.profileImage} />
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileBio}>{profile.bio}</Text>

          <View style={styles.statsContainer}>
            {[
              { label: "Posts", value: "248" },
              { label: "Followers", value: "12.4k" },
              { label: "Following", value: "142" },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statNumber}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("UserProfile", { profile })
            }
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Grid stroke="#000" width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Bookmark stroke="#999" width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Heart stroke="#999" width={20} height={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.postsGrid}>
          {postImages.map((img, i) => (
            <Image key={i} source={img} style={styles.gridItem} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  profileInfo: { alignItems: "center", paddingVertical: 20 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileName: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  profileBio: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 18, fontWeight: "bold" },
  statLabel: { fontSize: 12, color: "#666" },
  editButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  editButtonText: { fontWeight: "500" },
  tabContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    marginTop: 20,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#000" },
  postsGrid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: {
    width: "33.33%",
    height: 120,
    borderWidth: 0.5,
    borderColor: "#fff",
  },
});

export default Profile;
