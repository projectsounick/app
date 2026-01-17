import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const { height } = Dimensions.get("window");

interface Props {
  showIntroModal: boolean;
  setShowIntroModal: (value: boolean) => void;
}

const infoItems = [
  {
    icon: "human-male-height",
    text: "Height, weight, and age help us calculate your BMI, track progress, and tailor safe workout intensities.",
  },
  {
    icon: "target",
    text: "Your goals and current activity level allow us to design programs that match your lifestyle.",
  },
  {
    icon: "shield-check",
    text: "Medical history helps avoid risky exercises and keeps your plan safe and effective.",
  },
  {
    icon: "food-apple",
    text: "Dietary preferences help us identify your eating habits and provide personalized nutrition guidance.",
  },
];

export default function OnboardingInfoModal({
  showIntroModal,
  setShowIntroModal,
}: Props) {
  const theme = useGlobalTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const router = useRouter();

  useEffect(() => {
    if (showIntroModal) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showIntroModal]);

  const handleProceed = () => {
    setShowIntroModal(false);
  };

  const handleSkip = () => {
    setShowIntroModal(false);
    router.push("/secondsplashscreen");
  };

  const styles = getStyles(theme);

  return (
    <Modal transparent visible={showIntroModal} animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setShowIntroModal(false)}
      />

      <Animated.View
        style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Text style={styles.heading}>Why We Ask{"\n"}These Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowIntroModal(false)}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {infoItems.map((item, index) => (
            <View key={index} style={styles.infoCard}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={22}
                  color={theme.colors.secondPrimary}
                />
              </View>
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}

          <View style={styles.disclaimer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={16}
              color={theme.colors.textMuted}
            />
            <Text style={styles.disclaimerText}>
              Your information is private and secure
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>Let's Begin</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: height * 0.75,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    lineHeight: 32,
  },
  closeButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: theme.colors.backgroundCardLight, // Purple tint background
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 8,
    fontFamily: theme.fonts.regular,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  proceedButton: {
    flex: 2,
    backgroundColor: theme.colors.success,
    borderRadius: 16,
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  proceedButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  skipButton: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skipButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 16,
    fontFamily: theme.fonts.medium,
  },
});
