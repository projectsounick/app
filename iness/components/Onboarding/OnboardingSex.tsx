import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/app/Theme/globalTheme";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
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
    property: "sex", // or "age"
    setter: setSex, // or setAge
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
        paddingHorizontal: "5%",
        paddingBottom: "5%",
        paddingTop: "10%",
      }}
    >
      {/* Question + Options */}
      <View>
        <OnboardingHeading>What is your{"\n"}biological sex?</OnboardingHeading>
        {["Male", "Female"].map((option, index) => (
          <OnboardingCard
            key={option}
            index={index}
            option={option}
            state={sex}
            updateState={updateState}
            height={screenHeight * 0.1} // 10% of screen height
          />
        ))}
      </View>

      {/* Next Button */}
      <AnimatedSubmitButton loading={false} onPress={handleNext} title="Next" />
      <CustomSnackbar
        visible={snackbarVisible}
        bgColor={theme.colors.red}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

export default OnboardingSex;
