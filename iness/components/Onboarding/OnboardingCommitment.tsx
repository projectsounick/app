import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { onboardingCommitmentOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

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
    property: "timeCommitment",
    setter: setTimeCommitment,
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
          Daily Commitment {"\n"} to fitness?
        </OnboardingHeading>
        {onboardingCommitmentOptions.map((item: string, index: number) => (
          <OnboardingCard
            key={item}
            index={index}
            option={item}
            state={timeCommitment}
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
          disabled={loading || !timeCommitment.trim()}
          style={{
            backgroundColor:
              loading || !timeCommitment.trim() ? "#E0E0E0" : "#67C694",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: loading || !timeCommitment.trim() ? "#999" : "#FFFFFF",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            {loading ? "Loading..." : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingtimeCommitment;
