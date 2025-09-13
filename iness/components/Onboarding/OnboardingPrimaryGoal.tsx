import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
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
    property: "goal", // or "age"
    setter: setGoal, // or setAge
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
        paddingHorizontal: "5%",
        paddingBottom: "2%",
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <OnboardingHeading>Primary fitness {"\n"} goal?</OnboardingHeading>
        {goalOptionsOnboarding.map(({ label, icon }: any, index) => (
          <OnboardingCard
            key={label}
            index={index}
            option={label}
            state={goal}
            icon={icon}
            updateState={updateState}
            height={70} // smaller height passed here
            fontSize={16}
          />
        ))}
      </ScrollView>

      {/* Next Button */}
      <AnimatedSubmitButton
        loading={false}
        onPress={handleNext}
        title="Next"
        height={50}
      />
    </View>
  );
};

export default OnboardingPrimaryGoal;
