import { View, Text, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { Images } from '../../assets/images';
import { verticalScale } from '../../constants/helper';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const { getInitialRoute } = useAuth();
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Animations
  const progressWidth = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Progress bar will reach 100% in 10 steps over 4 seconds
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10; // 10 steps → 100% in 4s
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        const initialRoute = getInitialRoute();
        navigation.replace(initialRoute);
      }
    }, 400); // 400ms per step

    // Synchronized animations for logo, text, and progress bar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearInterval(interval);
  }, [navigation, getInitialRoute]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: loadingProgress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [loadingProgress]);

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Animated.Image
            source={Images.mainLogo}
            style={[styles.logo, { transform: [{ scale: logoScale }] }]}
            resizeMode="contain"
          />
          <View style={styles.logoGlow} />
        </View>

        <Animatable.Text animation="fadeInUp" duration={1000} style={styles.title}>
          MTC USDT Mining
        </Animatable.Text>

        <Animatable.Text animation="fadeInUp" duration={1000} style={styles.subtitle}>
          Your Gateway to Digital Mining
        </Animatable.Text>
      </Animated.View>

      {/* Loading Progress */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Loading... {Math.round(loadingProgress)}%</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    height: verticalScale(140),
    width: verticalScale(140),
    tintColor: Colors.primaryColor,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    height: verticalScale(160),
    width: verticalScale(160),
    borderRadius: verticalScale(80),
    backgroundColor: Colors.primaryColor,
    opacity: 0.1,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    color: Colors.primaryColor,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.shadeGrey,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: '80%',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primaryColor,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.shadeGrey,
    marginTop: 15,
    fontWeight: '500',
  },
});