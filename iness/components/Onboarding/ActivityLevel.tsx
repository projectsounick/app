import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { activityLevelOptions } from "@/utils/onboardingStaticValues";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

//// Main functional component for the activityLevel Level screen--------------------/
const ActivityLevel = ({
  onNext,
  onBack,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) => {
  const [activityLevel, setactivityLevel] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "activityLevel",
    setter: setactivityLevel,
  });

  const handleNext = () => {
    if (activityLevel.length > 0) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
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
              fontSize={16}
              height={70}
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
          disabled={loading || !activityLevel}
          style={{
            backgroundColor: loading || !activityLevel ? "#E0E0E0" : "#67C694",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: loading || !activityLevel ? "#999" : "#FFFFFF",
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

export default ActivityLevel;
