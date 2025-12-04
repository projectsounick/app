import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { goalOptionsOnboarding } from "@/utils/onboardingStaticValues";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const OnboardingPrimaryGoal = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [goal, setGoal] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "goal",
    setter: setGoal,
  });

  const handleNext = () => {
    if (goal.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        goal,
      });
      onNext();
    }
  };

  const updateState = (value: string) => {
    setGoal(value);
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
        <OnboardingHeading>Primary fitness {"\n"} goal?</OnboardingHeading>
        {goalOptionsOnboarding.map(({ label, icon }: any, index) => (
          <OnboardingCard
            key={label}
            index={index}
            option={label}
            state={goal}
            icon={icon}
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
          disabled={!goal.trim()}
          style={{
            backgroundColor: goal.trim() ? "#67C694" : "#E0E0E0",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: goal.trim() ? "#FFFFFF" : "#999",
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

export default OnboardingPrimaryGoal;
