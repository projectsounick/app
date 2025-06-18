import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import OnboardingCard from "@/app/modules/OnboardingCard";
import {
  activityLevelOptions,
  goalOptionsOnboarding,
} from "@/utils/onboardingStaticValues";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

//// Main functional component for the activityLevel Level screen--------------------/
const ActivityLevel = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [activityLevel, setactivityLevel] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "activityLevel", // or "age"
    setter: setactivityLevel, // or setAge
  });

  const handleNext = async () => {
    if (activityLevel.length > 0) {
      await asyncStorageUtils.updateUserDataInAsyncStorage({
        activityLevel,
      });
      onNext();
    }
  };
  const updateState = (value: string) => {
    setactivityLevel(value);
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
        <OnboardingHeading> Typical day for {"\n"} you?</OnboardingHeading>
        {activityLevelOptions.map(
          ({ label, icon, description }: any, index) => (
            <OnboardingCard
              key={label}
              index={index}
              option={label}
              state={activityLevel}
              icon={icon}
              description={description}
              updateState={updateState}
              height={70} // smaller height passed here
            />
          )
        )}
      </ScrollView>

      {/* Next Button */}
      <AnimatedSubmitButton loading={false} onPress={handleNext} title="Next" />
    </View>
  );
};

export default ActivityLevel;
