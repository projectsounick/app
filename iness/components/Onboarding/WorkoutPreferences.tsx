import React, { useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { workoutPreferenceOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const screenHeight = Dimensions.get("window").height;

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

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: "5%",
        paddingBottom: "2%",
        paddingTop: "4%",
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <OnboardingHeading>
          Favourite type of{"\n"}
          workout?
        </OnboardingHeading>

        {workoutPreferenceOptions.map(({ label, icon }, index) => (
          <OnboardingCard
            key={label}
            index={index}
            option={label}
            icon={icon}
            state={workoutPreferences}
            updateState={updateState}
            height={60}
          />
        ))}
      </ScrollView>

      <AnimatedSubmitButton loading={false} onPress={handleNext} title="Next" />
    </View>
  );
};

export default WorkoutPreferences;
