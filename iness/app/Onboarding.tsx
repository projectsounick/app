import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "./Theme/globalTheme";
import OnboardingName from "@/components/Onboarding/OnboardingName";
import OnboardingSex from "@/components/Onboarding/OnboardingSex";
import { Ionicons } from "@expo/vector-icons"; // Make sure this is installed
import OnboardingPrimaryGoal from "@/components/Onboarding/OnboardingPrimaryGoal";
import OnboardingtimeCommitment from "@/components/Onboarding/OnboardingCommitment";
import { onboardingSteps } from "@/utils/onboardingStaticValues";
import PreferredWorkoutTime from "@/components/Onboarding/PreferWorkoutTime";
import WorkoutPreferences from "@/components/Onboarding/WorkoutPreferences";
import ActivityLevel from "@/components/Onboarding/ActivityLevel";
import { useNavigation } from "@react-navigation/native";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { userService } from "./services/user.service";
import CustomSnackbar from "./modules/Snackbar";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

//// Main functional component for the Onboarding screen ///// -----------------------------------/
const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation<any>();

  const {
    loading,
    data,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(userService.updateUser);
  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      /// So this is the final step of the onboarding process
      /// we will make an api call to the backend will save user data will
      /// move the user to dashboard screen
      const userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
        "user"
      );
      if (userData && userData.exists) {
        //// Adding onboarding ==> true to the user data
        let data = userData.data;
        data.onboarding = true;
        //// Function for update

        const { _id, role, __v, jwtToken, phoneNumber, ...cleanData } = data;
        let response = await userService.updateUser(cleanData);

        if (response.success) {
          navigation.navigate("secondsplashscreen");
        }
      } else {
        setSnackbarMessage("Please complete the onboarding process first.");
        setSnackbarVisible(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const renderStepComponent = (loading: boolean) => {
    switch (currentStep) {
      case 0:
        return <OnboardingName onNext={handleNext} />;
      case 1:
        return <OnboardingSex onNext={handleNext} onBack={handleBack} />;
      case 2:
        return (
          <OnboardingPrimaryGoal onNext={handleNext} onBack={handleBack} />
        );
      case 3:
        return (
          <OnboardingtimeCommitment
            onNext={handleNext}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 4:
        return <PreferredWorkoutTime onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <WorkoutPreferences onNext={handleNext} onBack={handleBack} />;
      case 6:
        return <ActivityLevel onNext={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  const progressWidth =
    ((currentStep + 1) / onboardingSteps.length) *
    (Dimensions.get("window").width - 90); // adjusted to fit beside back button

  return (
    <ImageBackground
      source={require("../assets/images/onboardingBackground.jpg")}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
        {/* Row with Back Button + Progress Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          {/* Back Button */}
          {currentStep > 0 && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                backgroundColor: "#000",
                width: 50,
                height: 50,
                borderRadius: 25,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Progress Bar */}
          <View
            style={{
              flex: 1,
              height: 6,
              backgroundColor: "#eee",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 6,
                width: progressWidth,
                backgroundColor: theme.colors.secondPrimary,
                borderRadius: 5,
              }}
            />
          </View>
        </View>

        {/* Step Content */}
        <View style={{ flex: 1 }}>{renderStepComponent(loading)}</View>
      </View>
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </ImageBackground>
  );
};

export default OnboardingScreen;
