import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import OnboardingCard from "@/app/modules/OnboardingCard";
import {
  onboardingPreferredWorkoutTimeOptions,
} from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

//// Main functional component for the PreferredWorkout Time screen--------------------/
const PreferredWorkoutTime = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "preferredWorkoutTime",
    setter: setPreferredWorkoutTime,
  });

  const handleNext = () => {
    if (preferredWorkoutTime.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        preferredWorkoutTime,
      });
      onNext();
    }
  };
  const updateState = (value: string) => {
    setPreferredWorkoutTime(value);
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
          When do you {"\n"} prefer to workout?
        </OnboardingHeading>

        {onboardingPreferredWorkoutTimeOptions.map(
          (item: string, index: number) => (
            <OnboardingCard
              key={item}
              index={index}
              option={item}
              state={preferredWorkoutTime}
              updateState={updateState}
              height={70}
              fontSize={16}
            />
          )
        )}
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
          disabled={!preferredWorkoutTime.trim()}
          style={{
            backgroundColor: preferredWorkoutTime.trim() ? "#67C694" : "#E0E0E0",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: preferredWorkoutTime.trim() ? "#FFFFFF" : "#999",
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

export default PreferredWorkoutTime;
