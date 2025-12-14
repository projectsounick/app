import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");

// Enhanced goal options with descriptions
const goalOptions = [
  {
    label: "Lose Weight",
    icon: "fire",
    description: "Burn fat and achieve your ideal body weight",
  },
  {
    label: "Build Muscle",
    icon: "arm-flex",
    description: "Gain strength and increase muscle mass",
  },
  {
    label: "Get Fitter",
    icon: "run-fast",
    description: "Improve overall fitness and endurance",
  },
  {
    label: "Gain Weight",
    icon: "trending-up",
    description: "Healthy weight gain with proper nutrition",
  },
  {
    label: "Stay Active",
    icon: "heart-pulse",
    description: "Maintain health and stay energetic",
  },
];

const OnboardingPrimaryGoal = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [goal, setGoal] = useState<string>("");

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "goal",
    setter: setGoal,
  });

  const handleNext = () => {
    if (goal.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({ goal });
      onNext();
    }
  };

  const updateState = (value: string) => {
    setGoal(value);
  };

  const isValid = goal.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OnboardingHeading
          icon="target"
          subtitle="Select your main fitness objective and we'll create a personalized plan for you"
        >
          What's your{"\n"}primary goal?
        </OnboardingHeading>

        {/* Goal Cards */}
        <View style={styles.cardsContainer}>
          {goalOptions.map((item, index) => (
            <OnboardingCard
              key={item.label}
              index={index}
              option={item.label}
              state={goal}
              icon={item.icon}
              description={item.description}
              updateState={updateState}
              height={Math.min(screenWidth * 0.2, 75)}
              fontSize={Math.max(screenWidth * 0.04, 15)}
            />
          ))}
        </View>

        {/* Motivation Box */}
        <View style={styles.motivationBox}>
          <MaterialCommunityIcons
            name="star-circle"
            size={24}
            color="#9747FF"
          />
          <View style={styles.motivationTextContainer}>
            <Text style={styles.motivationTitle}>You've got this! 💪</Text>
            <Text style={styles.motivationText}>
              Whatever your goal, we'll help you get there step by step.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!isValid}
          style={[
            styles.nextButton,
            {
              backgroundColor: isValid ? "#67C694" : "#E0E0E0",
            },
          ]}
        >
          <Text
            style={[
              styles.nextButtonText,
              { color: isValid ? "#FFFFFF" : "#999" },
            ]}
          >
            Continue
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={isValid ? "#FFFFFF" : "#999"}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cardsContainer: {
    marginTop: 8,
  },
  motivationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3EDFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8E0F5",
  },
  motivationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  motivationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
  },
  nextButton: {
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
});

export default OnboardingPrimaryGoal;
