import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

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
import OnboardingWeight from "@/components/Onboarding/OnboardingWeight";
import OnboardingHeading from "./modules/OnboardingHeading";
import OnboardingHeight from "@/components/Onboarding/OnboardingHeight";
import OnboardingDOB from "@/components/Onboarding/OnboardingDOB";
import OnboardingphoneNumber from "@/components/Onboarding/OnboardingPhoneNumber";
import { SafeAreaView } from "react-native-safe-area-context";

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
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userData && userData.exists) {
        //// Adding onboarding ==> true to the user data
        let data = userData.data;
        data.onboarding = true;
        //// Function for update

        const { _id, role, __v, jwtToken, ...cleanData } = data;
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
        return <OnboardingphoneNumber onNext={handleNext} />;
      case 2:
        return <OnboardingSex onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <OnboardingWeight onNext={handleNext} />;
      case 4:
        return <OnboardingHeight onNext={handleNext} />;
      case 5:
        return <OnboardingDOB onNext={handleNext} />;
      case 6:
        return (
          <OnboardingPrimaryGoal onNext={handleNext} onBack={handleBack} />
        );
      case 7:
        return (
          <OnboardingtimeCommitment
            onNext={handleNext}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 8:
        return <PreferredWorkoutTime onNext={handleNext} onBack={handleBack} />;
      case 9:
        return <WorkoutPreferences onNext={handleNext} onBack={handleBack} />;
      case 10:
        return <ActivityLevel onNext={handleNext} onBack={handleBack} />;
      default:
        return null;
    }
  };

  const progressWidth =
    ((currentStep + 1) / onboardingSteps.length) *
    (Dimensions.get("window").width - 90); // adjusted to fit beside back button

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right"]}
    >
      <ImageBackground
        source={require("../assets/images/onboardingBackground.jpg")}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
              {/* Row with Back Button + Progress Bar */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 30,
                }}
              >
                {currentStep > 0 && (
                  <TouchableOpacity
                    onPress={handleBack}
                    style={{
                      backgroundColor: "#000",
                      width: 35,
                      height: 35,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="arrow-back" size={18} color="#fff" />
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

              {/* Step Content (your OnboardingName component) */}
              <View style={{ flex: 1 }}>{renderStepComponent(loading)}</View>
              <CustomSnackbar
                visible={snackbarVisible}
                message={snackbarMessage}
                bgColor={theme.colors.primary}
                onDismiss={() => setSnackbarVisible(false)}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
