import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { onboardingCommitmentOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const screenHeight = Dimensions.get("window").height;

//// Main functional component for the Onboarding timeCommitment screen--------------------/
const OnboardingtimeCommitment = ({
  onNext,
  onBack,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) => {
  const [timeCommitment, setTimeCommitment] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "timeCommitment", // or "age"
    setter: setTimeCommitment, // or setAge
  });

  const handleNext = () => {
    if (timeCommitment.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        timeCommitment,
      });
      onNext();
    }
  };
  const updateState = (value: string) => {
    setTimeCommitment(value);
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
          {" "}
          Daily Commitment {"\n"} to fitness?
        </OnboardingHeading>
        {onboardingCommitmentOptions.map((item: string, index: number) => (
          <OnboardingCard
            key={item}
            index={index}
            option={item}
            state={timeCommitment}
            updateState={updateState}
            height={70} // 10% of screen height
            fontSize={16}
          />
        ))}
      </ScrollView>

      {/* Next Button */}
      <AnimatedSubmitButton
        loading={loading}
        onPress={handleNext}
        title="Next"
        height={50}
      />
    </View>
  );
};

export default OnboardingtimeCommitment;
