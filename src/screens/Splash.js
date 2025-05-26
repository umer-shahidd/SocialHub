import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Splash = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Login'); // or 'Signup' if you prefer
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View style={styles.purpleCircle} />

          <Image
            source={{
              uri: 'https://reactnative.dev/img/tiny_logo.png', // Replace with your actual image
            }}
            style={styles.personImage}
          />

          {/* Emoji reactions */}
          <Text style={[styles.emoji, styles.emojiTop]}>😄</Text>
          <Text style={[styles.emoji, styles.emojiBottom]}>😊</Text>
          <Text style={[styles.emoji, styles.emojiRight]}>😍</Text>

          {/* Reaction bar */}
          <View style={styles.reactionBar}>
            <Text style={styles.reactionIcon}>❤️</Text>
            <Text style={styles.reactionIcon}>💬</Text>
            <Text style={styles.reactionIcon}>✈️</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.embraceText}>S O C I A L</Text>
          <Text style={styles.connectionsText}>Connect App</Text>
          <Text style={styles.descriptionText}>
            Bringing people closer, one tap at a time.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff7e1',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  imageContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  purpleCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0d0ff',
    position: 'absolute',
    zIndex: 1,
  },
  personImage: {
    width: 180,
    height: 180,
    zIndex: 2,
  },
  emoji: {
    fontSize: 24,
    position: 'absolute',
    zIndex: 3,
  },
  emojiTop: {
    top: 50,
    right: 100,
  },
  emojiBottom: {
    bottom: 70,
    left: 80,
  },
  emojiRight: {
    right: 80,
    bottom: 100,
  },
  reactionBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'absolute',
    bottom: 40,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reactionIcon: {
    fontSize: 18,
    marginHorizontal: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  embraceText: {
    fontSize: 14,
    letterSpacing: 3,
    color: '#333',
    fontWeight: '500',
  },
  connectionsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    fontFamily: 'Georgia',
  },
  descriptionText: {
    letterSpacing: 0.5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: '90%',
  },
});

export default Splash;