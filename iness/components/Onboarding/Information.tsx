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
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";

interface Props {
  showIntroModal: boolean;
  setShowIntroModal: (value: boolean) => void;
}

const { height } = Dimensions.get("window");

export default function OnboardingMetricsModal({
  showIntroModal,
  setShowIntroModal,
}: Props) {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (showIntroModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
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
          <Text style={styles.heading}>Why We Ask These Details</Text>

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

        {/* Proceed Button */}
        <AnimatedSubmitButton
          loading={false}
          onPress={() => setShowIntroModal(false)}
          title="Proceed"
        />
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
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
    color: "#444",
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
  },
  proceedButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    alignItems: "center",
  },
  proceedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
