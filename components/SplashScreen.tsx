import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const loadingScale = useRef(new Animated.Value(0.8)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animación de entrada del logo con bounce
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Animación del texto
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
              // Animación del loading
        Animated.parallel([
          Animated.timing(loadingOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(loadingScale, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Animación de los dots
      const animateDots = () => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot2Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot3Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(dot3Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot2Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
            Animated.timing(dot3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          ]),
        ]).start(() => animateDots());
      };

      // Iniciar animación de dots después de 1.5 segundos
      setTimeout(() => {
        animateDots();
      }, 1500);

      // Simular tiempo de carga y llamar onFinish
      const timer = setTimeout(() => {
        onFinish();
      }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo animado */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>KIKI</Text>
          </View>
        </Animated.View>

        {/* Texto animado */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>Bienvenido a KIKI</Text>
          <Text style={styles.subtitle}>Tu plataforma educativa</Text>
        </Animated.View>

        {/* Loading animado */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: loadingOpacity,
              transform: [{ scale: loadingScale }],
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E5FCE',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
}); 