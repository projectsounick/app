import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { workoutPreferenceOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");

//// Main functional component for the Workout Preferences screen--------------------/
const WorkoutPreferences = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [workoutPreferences, setWorkoutPreferences] = useState<string[]>([]);

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "workoutPreferences",
    setter: (value) => {
      if (Array.isArray(value)) {
        setWorkoutPreferences(value);
      }
    },
  });

  const handleNext = () => {
    if (workoutPreferences.length > 0) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        workoutPreferences,
      });
      onNext();
    }
  };

  const updateState = (value: string) => {
    setWorkoutPreferences((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const isValid = workoutPreferences.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OnboardingHeading
          icon="dumbbell"
          subtitle="Select all the workout types you enjoy (you can choose multiple)"
        >
          Favourite type of{"\n"}workout?
        </OnboardingHeading>

        {/* Workout Cards */}
        <View style={styles.cardsContainer}>
          {workoutPreferenceOptions.map(({ label, icon, description }, index) => (
            <OnboardingCard
              key={label}
              index={index}
              option={label}
              icon={icon}
              description={description}
              state={workoutPreferences}
              updateState={updateState}
              height={Math.min(screenWidth * 0.2, 75)}
              fontSize={Math.max(screenWidth * 0.04, 15)}
            />
          ))}
        </View>

        {/* Motivation Box */}
        <View style={styles.motivationBox}>
          <MaterialCommunityIcons
            name="heart-multiple"
            size={24}
            color="#9747FF"
          />
          <View style={styles.motivationTextContainer}>
            <Text style={styles.motivationTitle}>Mix it up! 🎯</Text>
            <Text style={styles.motivationText}>
              Variety in workouts keeps things exciting and targets different muscle groups.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Next Button - Always at bottom */}
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
              {
                color: isValid ? "#FFFFFF" : "#999",
              },
            ]}
          >
            Continue
          </Text>
          {isValid && (
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
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
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  motivationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
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
    fontSize: 16,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
});

export default WorkoutPreferences;
