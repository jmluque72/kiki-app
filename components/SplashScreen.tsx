import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Easing, Image } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animaciones principales
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;
  
  // Animaciones de texto
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(50)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  
  // Animaciones de loading
  const loadingOpacity = useRef(new Animated.Value(0)).current;
  const loadingScale = useRef(new Animated.Value(0.8)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  
  // Animaciones de fondo
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const wave1Scale = useRef(new Animated.Value(0)).current;
  const wave2Scale = useRef(new Animated.Value(0)).current;
  const wave3Scale = useRef(new Animated.Value(0)).current;
  const wave1Opacity = useRef(new Animated.Value(0.1)).current;
  const wave2Opacity = useRef(new Animated.Value(0.1)).current;
  const wave3Opacity = useRef(new Animated.Value(0.1)).current;
  
  // Estado para animación de texto tipo escritura
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Bienvenido a KIKI";

  useEffect(() => {
    // Animación de ondas de fondo
    const animateWaves = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(wave1Scale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(wave1Opacity, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(wave2Scale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(wave2Opacity, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(wave3Scale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(wave3Opacity, {
            toValue: 0.1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateWaves());
    };

    // Animación de entrada del logo con efectos mejorados
    Animated.sequence([
      // Fade in del fondo
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Entrada del logo con rotación y bounce
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.3,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      // Ajuste final del logo
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de pulso continuo del logo
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseAnimation());
    };

    // Iniciar pulso después de que el logo aparezca
    setTimeout(() => {
      pulseAnimation();
    }, 1500);

    // Animación de texto con efecto de escritura
    const typeWriter = () => {
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayedText(fullText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
        }
      }, 100);
    };

    // Iniciar animación de texto después de 1.2 segundos
    setTimeout(() => {
      typeWriter();
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1200);

    // Animación del loading
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(loadingScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    // Animación de los dots mejorada
    const animateDots = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1Opacity, { 
            toValue: 1, 
            duration: 400, 
            easing: Easing.ease,
            useNativeDriver: true 
          }),
          Animated.timing(dot2Opacity, { 
            toValue: 0.3, 
            duration: 400, 
            useNativeDriver: true 
          }),
          Animated.timing(dot3Opacity, { 
            toValue: 0.3, 
            duration: 400, 
            useNativeDriver: true 
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Opacity, { 
            toValue: 0.3, 
            duration: 400, 
            useNativeDriver: true 
          }),
          Animated.timing(dot2Opacity, { 
            toValue: 1, 
            duration: 400, 
            easing: Easing.ease,
            useNativeDriver: true 
          }),
          Animated.timing(dot3Opacity, { 
            toValue: 0.3, 
            duration: 400, 
            useNativeDriver: true 
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Opacity, { 
            toValue: 0.3, 
            duration: 400, 
            useNativeDriver: true 
          }),
          Animated.timing(dot2Opacity, { 
            toValue: 0.3, 
            duration: 400, 
            useNativeDriver: true 
          }),
          Animated.timing(dot3Opacity, { 
            toValue: 1, 
            duration: 400, 
            easing: Easing.ease,
            useNativeDriver: true 
          }),
        ]),
      ]).start(() => animateDots());
    };

    // Iniciar animación de dots después de 2.5 segundos
    setTimeout(() => {
      animateDots();
    }, 2500);

    // Iniciar ondas de fondo
    setTimeout(() => {
      animateWaves();
    }, 500);

    // Simular tiempo de carga y llamar onFinish
    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: backgroundOpacity }]}>
      {/* Ondas de fondo animadas */}
      <Animated.View
        style={[
          styles.wave,
          styles.wave1,
          {
            opacity: wave1Opacity,
            transform: [{ scale: wave1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.wave2,
          {
            opacity: wave2Opacity,
            transform: [{ scale: wave2Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.wave,
          styles.wave3,
          {
            opacity: wave3Opacity,
            transform: [{ scale: wave3Scale }],
          },
        ]}
      />

      <View style={styles.content}>
        {/* Logo animado con efectos mejorados */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, logoPulse) },
                { 
                  rotate: logoRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                },
              ],
            },
          ]}
        >
          <View style={styles.logo}>
            <Image 
              source={require('../assets/design/icons/kiki_splash.png')}
              style={styles.logoImageAnimated}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Texto animado con efecto de escritura */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [
                { translateY: textTranslateY },
                { scale: textScale },
              ],
            },
          ]}
        >
          <Text style={styles.title}>
            {displayedText}
            <Text style={styles.cursor}>|</Text>
          </Text>
          <Text style={styles.subtitle}>Tu plataforma educativa</Text>
        </Animated.View>

        {/* Loading animado mejorado */}
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
          <Text style={styles.loadingText}>Cargando...</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    zIndex: 10,
  },
  // Ondas de fondo
  wave: {
    position: 'absolute',
    borderRadius: width,
    backgroundColor: 'rgba(14, 95, 206, 0.1)',
  },
  wave1: {
    width: width * 2,
    height: width * 2,
    top: -width,
    left: -width / 2,
  },
  wave2: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  wave3: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.2,
    left: -width * 0.1,
  },
  logoContainer: {
    marginBottom: 50,
  },
  logo: {
    width: 320,
    height: 320,
    backgroundColor: 'transparent',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    position: 'relative',
  },
  logoInner: {
    width: 140,
    height: 140,
    backgroundColor: 'transparent',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    left: -10,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  logoImageAnimated: {
    width: 280,
    height: 280,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(14, 95, 206, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  cursor: {
    color: '#F97316',
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#F97316',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(249, 115, 22, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#0E5FCE',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
}); 