import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const FeatureBanner = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  
  // Animation for circular rotation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create continuous rotation animation
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000, // 10 seconds for full rotation
        useNativeDriver: true,
      }),
      { iterations: -1 } // Infinite iterations
    );
    
    animation.start();
    
    // Cleanup function to stop animation on unmount
    return () => {
      animation.stop();
    };
  }, [rotateAnim]);

  const styles = getStyles(theme, isDark);

  // Gradient colors - only for dark mode
  const gradientColors = isDark
    ? ["#9747FF", "#7A2ECC", "#6B2AB8"]
    : ["#FFFFFF", "#FFFFFF"]; // White for light mode

  const handlePress = () => {
    router.push("/(tabs)/dashboard/tabs/train");
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.bannerCard}>
        {/* Gradient overlay only for dark mode */}
        {isDark && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Background decorative elements */}
        {isDark ? (
          <>
            <View style={styles.bgBlob1} />
            <View style={styles.bgBlob2} />
            <View style={styles.bgBlob3} />
          </>
        ) : (
          <>
            <View style={styles.lightBlob1} />
            <View style={styles.lightBlob2} />
            <View style={styles.lightBlob3} />
          </>
        )}

        {/* Main content */}
        <View style={styles.contentContainer}>
          {/* Left side - Main text */}
          <View style={styles.textSection}>
            <View style={styles.titleRow}>
              <Text style={styles.mainTitle}>
                Hire Fitness trainer at home
              </Text>
            </View>
            <View style={styles.subtitleRow}>
              <View style={styles.timeBadge}>
                <Ionicons name="flash" size={12} color={isDark ? "#BDFF84" : "#9747FF"} />
                <Text style={styles.timeBadgeText}>Within 24 hours</Text>
              </View>
            </View>
            
            <View style={styles.featuresRow}>
              <View style={[styles.featureTag, styles.featureTag1]}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="leaf-outline" size={14} color="#67C694" />
                </View>
                <Text style={styles.featureText}>Sustainable homely diet plans</Text>
              </View>
              <View style={[styles.featureTag, styles.featureTag2]}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="barbell-outline" size={14} color="#FF6B6B" />
                </View>
                <Text style={styles.featureText}>Fun workouts</Text>
              </View>
            </View>
          </View>

          {/* Right side - 3D icon display with circular rotation */}
          <Animated.View
            style={[
              styles.iconSection,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.iconCard, styles.iconCard1]}>
              <LinearGradient
                colors={["#BDFF84", "#A5E66B"]}
                style={styles.iconGradient}
              >
                <Ionicons name="fitness" size={26} color="#1A1A1A" />
              </LinearGradient>
            </View>
            
            <View style={styles.middleRow}>
              <View style={[styles.iconCard, styles.iconCard2]}>
                <LinearGradient
                  colors={["#67C694", "#4FA374"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={[styles.iconCard, styles.iconCard3]}>
                <LinearGradient
                  colors={["#FF6B6B", "#E55555"]}
                  style={styles.iconGradient}
                >
                  <Ionicons name="barbell-outline" size={18} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 12,
      marginTop: 4,
    },
    bannerCard: {
      borderRadius: 20,
      padding: 14,
      position: "relative",
      overflow: "hidden",
      minHeight: 110,
      backgroundColor: isDark ? "transparent" : "#FFFFFF",
      borderWidth: isDark ? 0 : 1,
      borderColor: isDark ? "transparent" : "rgba(151, 71, 255, 0.1)",
    },
    bgBlob1: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      top: -80,
      right: -50,
    },
    bgBlob2: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(189, 255, 132, 0.08)",
      bottom: -40,
      left: -30,
    },
    bgBlob3: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(255, 255, 255, 0.04)",
      top: "50%",
      right: 40,
      transform: [{ translateY: -50 }],
    },
    lightBlob1: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: "rgba(151, 71, 255, 0.03)",
      top: -100,
      right: -60,
    },
    lightBlob2: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: "rgba(189, 255, 132, 0.04)",
      bottom: -50,
      left: -40,
    },
    lightBlob3: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(103, 198, 148, 0.03)",
      top: "50%",
      right: 30,
      transform: [{ translateY: -60 }],
    },
    contentContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 1,
      gap: 16,
    },
    textSection: {
      flex: 1,
      gap: 6,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    mainTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#1A1A1A",
      fontFamily: theme.fonts.bold,
      lineHeight: 24,
      letterSpacing: -0.4,
    },
    subtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 2,
      flexWrap: "wrap",
    },
    timeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: isDark ? "rgba(189, 255, 132, 0.12)" : "rgba(151, 71, 255, 0.1)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "rgba(189, 255, 132, 0.3)" : "rgba(151, 71, 255, 0.2)",
    },
    timeBadgeText: {
      fontSize: 11,
      fontWeight: "700",
      color: isDark ? "#BDFF84" : "#9747FF",
      fontFamily: theme.fonts.bold,
      letterSpacing: 0.3,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: "500",
      color: isDark ? "rgba(255, 255, 255, 0.85)" : "#666666",
      fontFamily: theme.fonts.medium,
      lineHeight: 18,
      letterSpacing: 0.2,
    },
    featuresRow: {
      flexDirection: "row",
      gap: 6,
      flexWrap: "wrap",
      marginTop: 4,
    },
    featureTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    featureTag1: {
      backgroundColor: isDark ? "rgba(103, 198, 148, 0.12)" : "rgba(103, 198, 148, 0.1)",
      borderColor: isDark ? "rgba(103, 198, 148, 0.25)" : "rgba(103, 198, 148, 0.2)",
    },
    featureTag2: {
      backgroundColor: isDark ? "rgba(255, 107, 107, 0.12)" : "rgba(255, 107, 107, 0.1)",
      borderColor: isDark ? "rgba(255, 107, 107, 0.25)" : "rgba(255, 107, 107, 0.2)",
    },
    iconWrapper: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    featureText: {
      fontSize: 11,
      fontWeight: "600",
      color: isDark ? "rgba(255, 255, 255, 0.95)" : "#666666",
      fontFamily: theme.fonts.medium,
      letterSpacing: 0.2,
      flexShrink: 1,
    },
    iconSection: {
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      width: 70,
      height: 70,
      position: "relative",
    },
    iconCard: {
      width: 50,
      height: 50,
      borderRadius: 14,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.5)",
    },
    iconGradient: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    iconCard1: {
      transform: [{ rotate: "-8deg" }],
      marginBottom: 4,
    },
    middleRow: {
      flexDirection: "row",
      gap: 8,
    },
    iconCard2: {
      transform: [{ rotate: "6deg" }],
    },
    iconCard3: {
      transform: [{ rotate: "-10deg" }],
    },
  });

export default FeatureBanner;
