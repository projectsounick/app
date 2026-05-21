import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from "react-native-reanimated";
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
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const OnboardingScreen = () => {
  const theme = useGlobalTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const navigation = useNavigation<any>();

  const {
    loading,
    setLoading,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(userService.updateUser);

  const finalizeOnboarding = async () => {
    try {
      setLoading(true);
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      if (userData && userData.exists) {
        const data = {
          ...(userData.data || {}),
          onboarding: true,
        };
        const {
          _id,
          role,
          __v,
          jwtToken,
          accessToken,
          createdAt,
          updatedAt,
          appleId,
          googleId,
          otp,
          phoneNumber,
          ...cleanData
        } = data;

        if (phoneNumber && phoneNumber.length >= 10) {
          (cleanData as any).phoneNumber = phoneNumber;
        }

        console.log(
          "Sending onboarding data:",
          JSON.stringify(cleanData, null, 2)
        );

        const response = await userService.updateUser(cleanData);
        if (response.success) {
          navigation.navigate("secondsplashscreen");
        } else {
          setSnackbarMessage(response.message || "Failed to save. Please try again.");
          setSnackbarVisible(true);
        }
      } else {
        setSnackbarMessage("Please complete the onboarding process first.");
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      console.log("Onboarding error:", error);
      Alert.alert(
        "Error",
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await finalizeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip onboarding?",
      "You can skip for now and complete your profile later from the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          style: "destructive",
          onPress: () => {
            finalizeOnboarding();
          },
        },
      ]
    );
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
        return <OnboardingPrimaryGoal onNext={handleNext} onBack={handleBack} />;
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

  const progress = (currentStep + 1) / onboardingSteps.length;
  const styles = getStyles(theme, insets);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "top"]}>
        <StatusBar style="dark" />
        
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <Text style={styles.stepText}>
                Step {currentStep + 1} of {onboardingSteps.length}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { width: `${progress * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSkip}
              style={styles.skipButton}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Step Content */}
          <View style={styles.content}>
            {renderStepComponent(loading)}
          </View>

          <CustomSnackbar
            visible={snackbarVisible}
            message={snackbarMessage}
            bgColor={theme.colors.success}
            onDismiss={() => setSnackbarVisible(false)}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Intro Modal - shown on first step */}
      <InfoModal
        showIntroModal={showIntroModal}
        setShowIntroModal={setShowIntroModal}
      />
    </View>
  );
};

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? Math.max(insets.top, 16) : 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressSection: {
    flex: 1,
    marginHorizontal: 16,
  },
  stepText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    marginBottom: 6,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.success,
    borderRadius: 3,
  },
  skipButton: {
    minWidth: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
  },
  content: {
    flex: 1,
  },
});

export default OnboardingScreen;
