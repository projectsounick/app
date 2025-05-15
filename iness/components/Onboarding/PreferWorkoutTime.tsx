import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import OnboardingCard from "@/app/modules/OnboardingCard";
import {
  onboardingCommitmentOptions,
  onboardingPreferredWorkoutTimeOptions,
} from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";

const screenHeight = Dimensions.get("window").height;

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
    property: "preferredWorkoutTime", // or "age"
    setter: setPreferredWorkoutTime, // or setAge
  });

  const handleNext = async () => {
    if (preferredWorkoutTime.trim()) {
      await asyncStorageUtils.updateUserDataInAsyncStorage({
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
        paddingHorizontal: "5%",
        paddingBottom: "2%",
        paddingTop: "4%",
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontSize: theme.fontSizes.xl,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          When do you {"\n"} prefer to workout?
        </Text>

        {onboardingPreferredWorkoutTimeOptions.map(
          (item: string, index: number) => (
            <OnboardingCard
              key={item}
              index={index}
              option={item}
              state={preferredWorkoutTime}
              updateState={updateState}
              height={screenHeight * 0.1} // 10% of screen height
            />
          )
        )}
      </ScrollView>

      {/* Next Button */}
      <AnimatedSubmitButton loading={false} onPress={handleNext} title="Next" />
    </View>
  );
};

export default PreferredWorkoutTime;
