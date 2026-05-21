import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, View, Text, Image, StyleSheet, Easing, LogBox } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import theme from "./Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trackService } from "./services/track.service";
import { store } from "@/store";
import { updateTrackingField } from "@/Slices/trackSlice";
import { userService } from "./services/user.service";
import { router } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
LogBox.ignoreLogs(["useInsertionEffect must not schedule updates."]);

// Animated letter component for individual letter animations
const AnimatedLetter = ({ 
  letter, 
  color, 
  fontSize 
}: { 
  letter: string; 
  color: string; 
  fontSize: number;
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        fontSize,
        fontWeight: "bold",
        color,
        opacity,
        transform: [{ translateY }, { scale }],
        textShadowColor: "rgba(151, 71, 255, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
      }}
    >
      {letter}
    </Animated.Text>
  );
};

// Floating particle component
const FloatingParticle = ({ 
  delay, 
  startX, 
  startY, 
  color,
  size,
}: { 
  delay: number; 
  startX: number; 
  startY: number; 
  color: string;
  size: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 3000,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };
    startAnimation();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
};

const SecondSplashScreen = () => {
  const dispatch = store.dispatch;
  const isDark = false;
  const themedColors = theme.colors;
  const [progress] = useState(() => new Animated.Value(0));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [logoScale] = useState(() => new Animated.Value(0.8));
  const [glowOpacity] = useState(() => new Animated.Value(0));
  const [pulseScale] = useState(() => new Animated.Value(1));
  const [bgGradientOpacity] = useState(() => new Animated.Value(0));

  const [showLetters, setShowLetters] = useState(false);
  const [letterArray, setLetterArray] = useState<string[]>([]);
  const [showCircle, setShowCircle] = useState(true);
  const [showParticles, setShowParticles] = useState(false);
  
  const CIRCLE_RADIUS = 70;
  const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;
  const LETTER_DELAY = 150;
  const FULL_TEXT = "INESS";

  // Check if health sync is in progress and wait for it to complete
  const waitForSyncCompletion = async (): Promise<void> => {
    const maxWaitTime = 30000; // 30 seconds max wait
    const checkInterval = 500; // Check every 500ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const syncFlag = await AsyncStorage.getItem("healthSyncInProgress");
      
      if (!syncFlag) {
        // Sync completed, refresh data
        console.log("[SecondSplash] Health sync completed, refreshing data...");
        try {
          const response = await trackService.getCurrentDayTrackData();
          if (response.success && response.data) {
            // Update Redux store with fresh data
            if (response.data.steps) {
              dispatch(updateTrackingField({
                type: "steps",
                data: response.data.steps,
              }));
            }
            if (response.data.sleep) {
              dispatch(updateTrackingField({
                type: "sleep",
                data: response.data.sleep,
              }));
            }
            console.log("[SecondSplash] Data refreshed successfully");
          }
        } catch (error) {
          // Error refreshing data
        }
        return; // Exit when sync is complete
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    // Timeout reached, clear flag and proceed anyway
    console.log("[SecondSplash] Sync wait timeout, proceeding...");
    await AsyncStorage.removeItem("healthSyncInProgress");
  };

  // Pulse animation for glow effect
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    const runAnimation = async () => {
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      // Initialize database connection in the background during splash
      console.log("[SecondSplash] Initializing DB connection...");
      userService.initDbConnection()
        .then((response) => {
          if (response.success) {
            console.log("[SecondSplash] DB connection initialized successfully");
          } else {
            console.log("[SecondSplash] DB connection init failed:", response.message);
          }
        })
        .catch((error) => {
          console.log("[SecondSplash] DB connection init error:", error?.message || error);
        });

      // Check if health sync is in progress
      const syncFlag = await AsyncStorage.getItem("healthSyncInProgress");
      if (syncFlag) {
        console.log("[SecondSplash] Health sync in progress, waiting for completion...");
        await waitForSyncCompletion();
      }

      // Start background gradient fade in
      Animated.timing(bgGradientOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Show particles
      setShowParticles(true);

      // Animate circle with glow
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Fade out glow and circle
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
        
        setShowCircle(false);

        // Fade in and scale logo with bounce
        Animated.parallel([
          Animated.spring(logoOpacity, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Show letters one by one after logo appears
          setTimeout(() => {
            setShowLetters(true);
            
            // Animate letters with stagger
            FULL_TEXT.split("").forEach((letter, index) => {
              setTimeout(() => {
                setLetterArray(prev => [...prev, letter]);
              }, index * LETTER_DELAY);
            });

            // Navigate after all animations
            const totalAnimationTime = FULL_TEXT.length * LETTER_DELAY + 800;
            setTimeout(async () => {
              const hasSession =
                await asyncStorageUtils.hasAuthenticatedUserSession();
              const userResponse =
                await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

              if (!hasSession || !userResponse.exists) {
                router.replace("/");
                return;
              }

              if (userResponse.exists && userResponse.data?.onboarding === false) {
                router.replace("/Onboarding");
                return;
              }

              router.replace("/(tabs)/dashboard/tabs");
            }, totalAnimationTime);
          }, 400); // Small delay before letters start
        });
      });
    };

    runAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_LENGTH, 0],
  });

  // Generate random particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: SCREEN_HEIGHT * 0.4 + Math.random() * (SCREEN_HEIGHT * 0.4),
    delay: Math.random() * 2000,
    size: 4 + Math.random() * 6,
    color: i % 2 === 0 ? themedColors.primary : themedColors.secondPrimary,
  }));

  return (
    <View style={[styles.container, { backgroundColor: themedColors.background }]}>
      {/* Gradient overlay for depth */}
      <Animated.View
        style={[
          styles.gradientOverlay,
          {
            opacity: bgGradientOpacity,
            backgroundColor: isDark 
              ? "rgba(151, 71, 255, 0.03)" 
              : "rgba(189, 255, 132, 0.05)",
          },
        ]}
      />

      {/* Floating particles */}
      {showParticles && particles.map((particle) => (
        <FloatingParticle
          key={particle.id}
          delay={particle.delay}
          startX={particle.x}
          startY={particle.y}
          color={particle.color}
          size={particle.size}
        />
      ))}

      {/* Glow effect behind circle */}
      {showCircle && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: glowOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        >
          <View
            style={[
              styles.glowCircle,
              {
                backgroundColor: themedColors.primary,
                shadowColor: themedColors.primary,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Progress Circle with gradient stroke */}
      {showCircle && (
        <Svg
          height="180"
          width="180"
          style={styles.progressCircle}
        >
          <Defs>
            <LinearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={themedColors.primary} stopOpacity="1" />
              <Stop offset="50%" stopColor={themedColors.secondPrimary} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={themedColors.primary} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Background circle track */}
          <Circle
            cx="90"
            cy="90"
            r={CIRCLE_RADIUS}
            stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            strokeWidth="8"
            fill="none"
          />
          {/* Animated progress circle */}
          <AnimatedCircle
            cx="90"
            cy="90"
            r={CIRCLE_RADIUS}
            stroke="url(#circleGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={CIRCLE_LENGTH}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
      )}

      {/* Logo + Text - always centered together */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        {/* Logo with glow */}
        <View style={styles.logoImageWrapper}>
          <Image
            source={require("../assets/images/logo.webp")}
            style={styles.logo}
          />
          {/* Logo glow effect */}
          <View
            style={[
              styles.logoGlow,
              {
                backgroundColor: themedColors.primary,
                shadowColor: themedColors.primary,
              },
            ]}
          />
        </View>

        {/* Animated letters */}
        {showLetters && (
          <View style={styles.lettersContainer}>
            {letterArray.map((letter, index) => (
              <AnimatedLetter
                key={index}
                letter={letter}
                color={themedColors.secondPrimary}
                fontSize={theme.fontSizes.xl}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {/* Subtle tagline at bottom */}
      <Animated.Text
        style={[
          styles.tagline,
          {
            color: themedColors.textMuted,
            opacity: logoOpacity,
          },
        ]}
      >
        Your Wellness Journey
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 20,
  },
  progressCircle: {
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 85,
    height: 85,
    resizeMode: "contain",
    zIndex: 2,
  },
  logoGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  lettersContainer: {
    flexDirection: "row",
    marginLeft: 12,
    alignItems: "center",
  },
  tagline: {
    position: "absolute",
    bottom: 60,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});

export default SecondSplashScreen;
