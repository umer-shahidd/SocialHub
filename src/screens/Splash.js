import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const Splash = () => {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main animation sequence
    const startAnimations = () => {
      // Logo scale and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for background elements
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation for the main logo
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Floating animations for emoji
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim1, {
            toValue: -10,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim1, {
            toValue: 10,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim2, {
            toValue: 15,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim2, {
            toValue: -15,
            duration: 2500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim3, {
            toValue: -8,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim3, {
            toValue: 8,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimations();

    // Navigate after delay
    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f4c75', '#3282b8', '#bbe1fa']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Background Circles */}
      <Animated.View 
        style={[
          styles.backgroundCircle1,
          { transform: [{ rotate: spin }] }
        ]}
      />
      <Animated.View 
        style={[
          styles.backgroundCircle2,
          { transform: [{ rotate: spin }] }
        ]}
      />

      {/* Content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        {/* Main Logo Container */}
        <View style={styles.logoContainer}>
          <Animated.View 
            style={[
              styles.mainLogoWrapper,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            {/* Central App Icon */}
            <View style={styles.appIconContainer}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a6f', '#d63384']}
                style={styles.appIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.appIconText}>S</Text>
              </LinearGradient>
            </View>

            {/* Floating Social Elements */}
            <Animated.View 
              style={[
                styles.floatingElement,
                styles.element1,
                { transform: [{ translateY: floatAnim1 }] }
              ]}
            >
              <View style={styles.socialBubble}>
                <Text style={styles.socialIcon}>❤️</Text>
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                styles.element2,
                { transform: [{ translateY: floatAnim2 }] }
              ]}
            >
              <View style={styles.socialBubble}>
                <Text style={styles.socialIcon}>💬</Text>
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                styles.element3,
                { transform: [{ translateY: floatAnim3 }] }
              ]}
            >
              <View style={styles.socialBubble}>
                <Text style={styles.socialIcon}>📸</Text>
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                styles.element4,
                { transform: [{ translateY: floatAnim1 }] }
              ]}
            >
              <View style={styles.socialBubble}>
                <Text style={styles.socialIcon}>🌟</Text>
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                styles.element5,
                { transform: [{ translateY: floatAnim2 }] }
              ]}
            >
              <View style={styles.socialBubble}>
                <Text style={styles.socialIcon}>🚀</Text>
              </View>
            </Animated.View>

            <Animated.View 
              style={[
                styles.floatingElement,
                styles.element6,
                { transform: [{ translateY: floatAnim3 }] }
              ]}
            >
              <View style={styles.socialBubble}>
                <Text style={styles.socialIcon}>✨</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Text Content */}
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.appName}>SocialHub</Text>
          <Text style={styles.appTagline}>Mobile App</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Develop By Khanazada Ismail Khan
            </Text>
            <View style={styles.dotIndicator}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingBar, { opacity: fadeAnim }]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -width * 0.5,
    left: -width * 0.25,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -width * 0.4,
    right: -width * 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  mainLogoWrapper: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  appIconContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  appIconText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'System',
  },
  floatingElement: {
    position: 'absolute',
  },
  element1: { top: 20, left: 50 },
  element2: { top: 80, right: 30 },
  element3: { bottom: 80, left: 20 },
  element4: { bottom: 20, right: 60 },
  element5: { top: 50, left: 20 },
  element6: { bottom: 50, right: 20 },
  socialBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  socialIcon: {
    fontSize: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 28,
    fontWeight: '300',
    color: '#bbe1fa',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  descriptionContainer: {
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
    marginBottom: 30,
  },
  dotIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#bbe1fa',
    width: 20,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingBar: {
    width: 60,
    height: 4,
    backgroundColor: '#bbe1fa',
    borderRadius: 2,
  },
});

export default Splash;