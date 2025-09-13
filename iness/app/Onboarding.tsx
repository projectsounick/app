import React, { useState, useEffect } from "react";
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
  ScrollView,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import theme from "./Theme/globalTheme";
import OnboardingName from "@/components/Onboarding/OnboardingName";
import OnboardingSex from "@/components/Onboarding/OnboardingSex";
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
import OnboardingHeight from "@/components/Onboarding/OnboardingHeight";
import OnboardingDOB from "@/components/Onboarding/OnboardingDOB";
import OnboardingphoneNumber from "@/components/Onboarding/OnboardingPhoneNumber";
import InfoModal from "@/components/Onboarding/Information";

//// Main functional component for the Onboarding screen ///// -----------------------------------/
const OnboardingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showIntroModal, setShowIntroModal] = useState(true); // Show intro first
  const navigation = useNavigation<any>();

  const {
    loading,
    setLoading,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(userService.updateUser);

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        setLoading(true);
        const userData =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userData && userData.exists) {
          let data = userData.data;
          data.onboarding = true;
          const { _id, role, __v, jwtToken, ...cleanData } = data;
          let response = await userService.updateUser(cleanData);
          if (response.success) {
            navigation.navigate("secondsplashscreen");
          }
        } else {
          setSnackbarMessage("Please complete the onboarding process first.");
          setSnackbarVisible(true);
        }
      } catch (error) {
        Alert.alert("Some error has happened");
      } finally {
        setLoading(false);
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
        return (
          <ActivityLevel
            onNext={handleNext}
            onBack={handleBack}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const progressWidth =
    ((currentStep + 1) / onboardingSteps.length) *
    (Dimensions.get("window").width - 90);

  // Info points for modal

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../assets/images/onboardingBackground.jpg")}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, paddingTop: "15%", paddingHorizontal: 20 }}>
              {/* Row with Back Button + Progress Bar */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 30,
                }}
              >
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

      {/* Intro Modal */}
      <InfoModal
        setShowIntroModal={setShowIntroModal}
        showIntroModal={showIntroModal}
      />
    </View>
  );
};

export default OnboardingScreen;
