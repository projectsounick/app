import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { workoutPreferenceOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

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
        justifyContent: "space-between",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
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
            height={70}
            fontSize={16}
          />
        ))}
      </ScrollView>

      {/* Next Button - Always at bottom */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 30,
          paddingTop: 20,
          backgroundColor: "transparent",
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          disabled={workoutPreferences.length === 0}
          style={{
            backgroundColor:
              workoutPreferences.length > 0 ? "#67C694" : "#E0E0E0",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: workoutPreferences.length > 0 ? "#FFFFFF" : "#999",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WorkoutPreferences;
