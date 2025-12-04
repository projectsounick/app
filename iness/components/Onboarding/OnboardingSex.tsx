import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import OnboardingHeading from "@/app/modules/OnboardingHeading";

const screenHeight = Dimensions.get("window").height;

//// Main functional component for the Onboarding sex screen--------------------/
const OnboardingSex = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [sex, setSex] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "sex",
    setter: setSex,
  });
  //// Function to handle the Next button click
  const handleNext = () => {
    try {
      if (sex) {
        asyncStorageUtils.updateUserDataInAsyncStorage({
          sex,
        });

        onNext();
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    }
  };

  //// Function for updating the state of the selected option---/
  function updateState(value: string) {
    setSex(value);
  }
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
        {/* Question + Options */}
        <View>
          <OnboardingHeading>What is your{"\n"}Gender?</OnboardingHeading>
          {["Male", "Female"].map((option, index) => (
            <OnboardingCard
              key={option}
              index={index}
              option={option}
              state={sex}
              updateState={updateState}
              height={screenHeight * 0.12}
            />
          ))}
        </View>
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
          disabled={!sex}
          style={{
            backgroundColor: sex ? "#67C694" : "#E0E0E0",
            borderRadius: 30,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: sex ? "#FFFFFF" : "#999",
              fontSize: 16,
              fontWeight: "700",
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
      <CustomSnackbar
        visible={snackbarVisible}
        bgColor="#FF6B6B"
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

export default OnboardingSex;
