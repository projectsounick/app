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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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
import { useGlobalTheme } from "./Theme/ThemeContext";

//// Main functional component for the Onboarding screen ///// -----------------------------------/
const OnboardingScreen = () => {
  const theme = useGlobalTheme();
  const insets = useSafeAreaInsets();
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

  const backgroundImg = require("../assets/images/basicBackground.jpg");

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <StatusBar style="dark" />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={{ 
              flex: 1, 
              paddingTop: Platform.OS === "android" ? Math.max(insets.top, 20) : "8%", 
              paddingHorizontal: 20 
            }}>
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
                    backgroundColor: "#FFFFFF",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                    <Ionicons name="arrow-back" size={20} color="#000000" />
                </TouchableOpacity>

                <View
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor: theme.colors.lightGrey,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: 8,
                      width: progressWidth,
                      backgroundColor: theme.colors.secondPrimary,
                      borderRadius: 10,
                    }}
                  />
                </View>
              </View>

              {/* Step Content */}
              <View style={{ flex: 1 }}>{renderStepComponent(loading)}</View>

              <CustomSnackbar
                visible={snackbarVisible}
                message={snackbarMessage}
                bgColor="#67C694"
                onDismiss={() => setSnackbarVisible(false)}
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
