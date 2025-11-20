import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Easing, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, TrendingUp, PiggyBank, Sparkles, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

export default function Welcome() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  return (
    <LinearGradient
      colors={[currentTheme.colors.primary, currentTheme.colors.secondary, currentTheme.colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.iconContainer, isSmallDevice && styles.iconContainerSmall]}>
            <Wallet size={isSmallDevice ? 50 : 70} color="#ffffff" strokeWidth={2} />
            <View style={styles.sparkleContainer}>
              <Sparkles size={isSmallDevice ? 18 : 24} color={currentTheme.colors.sparkle} fill={currentTheme.colors.sparkle} />
            </View>
          </View>
          <Text style={[styles.title, isSmallDevice && styles.titleSmall]}>MoneyTrack</Text>
          <Text style={[styles.subtitle, isSmallDevice && styles.subtitleSmall]}>Aplikasi Catatan Keuangan Gen Z</Text>
          <View style={styles.tagline}>
            <Text style={[styles.taglineText, isSmallDevice && styles.taglineTextSmall]}>Smart • Simple • Stylish</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <TrendingUp size={28} color="#10b981" strokeWidth={2.5} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Track Transaksi</Text>
            <Text style={styles.featureText}>Catat setiap pemasukan & pengeluaran dengan mudah</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <PiggyBank size={28} color="#f59e0b" strokeWidth={2.5} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Multi Wallet</Text>
            <Text style={styles.featureText}>Kelola bank, e-wallet, dan cash dalam satu aplikasi</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Sparkles size={28} color="#ec4899" strokeWidth={2.5} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Smart Insights</Text>
            <Text style={styles.featureText}>Analisa keuangan otomatis untuk keputusan lebih baik</Text>
          </View>
        </View>
      </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ffffff', '#f3f4f6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Mulai Sekarang</Text>
                <ArrowRight size={20} color="#667eea" strokeWidth={3} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Sudah Punya Akun? </Text>
            <Text style={styles.secondaryButtonTextBold}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={styles.decorativeElements} pointerEvents="none">
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 10 : 20,
    marginBottom: isSmallDevice ? 24 : 40,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  iconContainerSmall: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  titleSmall: {
    fontSize: 38,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 12,
  },
  subtitleSmall: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagline: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  taglineText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  taglineTextSmall: {
    fontSize: 11,
    letterSpacing: 1,
  },
  featuresContainer: {
    justifyContent: 'center',
    gap: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 16 : 20,
    marginTop: isSmallDevice ? 16 : 0,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: isSmallDevice ? 16 : 20,
    padding: isSmallDevice ? 14 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 12 : 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  buttonContainer: {
    gap: 16,
    marginTop: isSmallDevice ? 16 : 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.9,
  },
  secondaryButtonTextBold: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  decorativeElements: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: -1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -120,
    left: -80,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -60,
    right: -40,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 30,
    right: 80,
  },
});
