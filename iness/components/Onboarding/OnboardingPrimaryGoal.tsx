import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

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
  const theme = useGlobalTheme();
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
  const styles = getStyles(theme, isValid);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeading
          icon="target"
          subtitle="Select your main fitness objective and we'll create a personalized plan"
        >
          What's your{"\n"}primary goal?
        </OnboardingHeading>

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
              height={68}
              fontSize={15}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!isValid}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={isValid ? "#FFFFFF" : theme.colors.textMuted}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isValid: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  cardsContainer: {
    marginTop: 8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  nextButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isValid ? theme.colors.success : theme.colors.lightGrey,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: isValid ? "#FFFFFF" : theme.colors.textMuted,
  },
});

export default OnboardingPrimaryGoal;
