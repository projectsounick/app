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
              marginBottom: 20,
            }}
          >
            <Text style={styles.heading}>Why We Ask These Details</Text>
            {/* Close icon at top-right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowIntroModal(false)}
            >
              <Ionicons name="close" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Group 1 */}
          <View style={styles.pointCard}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#E3F2FD",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <MaterialCommunityIcons
                name="human-male-height"
                size={24}
                color="#9747FF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointText}>
                Height, weight, and age help us calculate your BMI, track
                progress, and tailor safe workout intensities.
              </Text>
            </View>
          </View>

          {/* Group 2 */}
          <View style={styles.pointCard}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#E8F5E9",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="fitness" size={24} color="#67C694" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointText}>
                Your goals and current activity level allow us to design programs
                that match your lifestyle and progress pace.
              </Text>
            </View>
          </View>

          {/* Group 3 */}
          <View style={styles.pointCard}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#FFEBEE",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="medkit" size={24} color="#FF6B6B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointText}>
                Medical history helps avoid risky exercises and keeps your plan
                safe and effective.
              </Text>
            </View>
          </View>

          {/* Group 4 */}
          <View style={styles.pointCard}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#FFF3E0",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="restaurant" size={24} color="#FF9800" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointText}>
                Dietary preferences ensure that when you upload your daily images,
                we can identify your eating habits and inform you about what's
                good or needs improvement.
              </Text>
            </View>
          </View>

          {/* Disclaimer */}
          <View
            style={{
              backgroundColor: "#F8F8F8",
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
              borderWidth: 1,
              borderColor: "#F5F5F5",
            }}
          >
            <Text style={styles.disclaimer}>
              * Any other information you provide will also be used solely to
              optimize your personalized fitness regime.
            </Text>
          </View>
        </ScrollView>

        {/* Buttons: Proceed & Skip */}
        <View style={styles.buttonRow}>
          {/* Proceed Button */}
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }], flex: 1, marginRight: 8 }}
          >
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={handleProceed}
            >
              <Text style={styles.proceedButtonText}>Proceed</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip Button */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.7,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    backgroundColor: "#F0F0F0",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  pointCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    fontWeight: "400",
  },
  disclaimer: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  proceedButton: {
    backgroundColor: "#67C694",
    borderRadius: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  proceedButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 30,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  skipButtonText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 16,
  },
});
