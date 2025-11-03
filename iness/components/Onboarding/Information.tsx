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
import theme from "@/app/Theme/globalTheme";
import { useRouter } from "expo-router";

const { height, width } = Dimensions.get("window");

interface Props {
  showIntroModal: boolean;
  setShowIntroModal: (value: boolean) => void;
}

export default function OnboardingMetricsModal({
  showIntroModal,
  setShowIntroModal,
}: Props) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current; // for Proceed button
  const router = useRouter();

  useEffect(() => {
    if (showIntroModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();

      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
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
    // add any additional logic for Proceed here
  };

  const handleSkip = () => {
    setShowIntroModal(false);
    router.push("/secondsplashscreen"); // ✅ skip to main app flow
  };

  return (
    <Modal transparent visible={showIntroModal} animationType="fade">
      {/* Background overlay */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setShowIntroModal(false)}
      />

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handle} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.heading}>Why We Ask These Details</Text>
            {/* Close icon at top-right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowIntroModal(false)}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Group 1 */}
          <View style={styles.point}>
            <MaterialCommunityIcons
              name="human-male-height"
              size={28}
              color="#4A90E2"
            />
            <Text style={styles.pointText}>
              Height, weight, and age help us calculate your BMI, track
              progress, and tailor safe workout intensities.
            </Text>
          </View>

          {/* Group 2 */}
          <View style={styles.point}>
            <Ionicons name="fitness" size={26} color="#50C878" />
            <Text style={styles.pointText}>
              Your goals and current activity level allow us to design programs
              that match your lifestyle and progress pace.
            </Text>
          </View>

          {/* Group 3 */}
          <View style={styles.point}>
            <Ionicons name="medkit" size={26} color="#FF6B6B" />
            <Text style={styles.pointText}>
              Medical history helps avoid risky exercises and keeps your plan
              safe and effective.
            </Text>
          </View>

          {/* Group 4 */}
          <View style={styles.point}>
            <Ionicons name="restaurant" size={26} color="#FFA500" />
            <Text style={styles.pointText}>
              Dietary preferences ensure that when you upload your daily images,
              we can identify your eating habits and inform you about what’s
              good or needs improvement.
            </Text>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            * Any other information you provide will also be used solely to
            optimize your personalized fitness regime.
          </Text>
        </ScrollView>

        {/* Buttons: Proceed & Skip */}
        <View style={styles.buttonRow}>
          {/* Proceed Button */}
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }], width: width * 0.45 }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: 40,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleProceed}
            >
              <Text
                style={{
                  color: theme.colors.dark,
                  fontWeight: theme.fontWeights?.bold,
                  fontSize: 18,
                }}
              >
                Proceed
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#FF4D4D",
              width: width * 0.45,
              height: 50,
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={handleSkip}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              Skip
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.65,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    backgroundColor: "#666",
    width: 26,
    height: 26,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    elevation: 5,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "left",
    fontFamily: theme.fonts.bold,
    marginTop: 20,
    color: "#222",
  },
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
    lineHeight: 20,
    textAlign: "justify",
    fontFamily: theme.fonts.regular,
    color: "#444",
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    gap: 10,
  },
});
