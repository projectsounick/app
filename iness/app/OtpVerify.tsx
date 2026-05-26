import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import theme from "./Theme/globalTheme";
import AnimatedSubmitButton from "./modules/AnimatedSubmitButton";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { userService } from "./services/user.service";
import CustomSnackbar from "./modules/Snackbar";
import { useNavigation } from "@react-navigation/native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { ActivityIndicator } from "react-native-paper";
import { registerForPushNotificationsAsync } from "@/utils/notificationUtils";
import NormalHeader from "./modules/NormalHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./Theme/ThemeContext";
/// Main functional component for the OTP input screen ///// -----------------------------------/
const OTPInputScreen = () => {
  const { reloadThemeFromUserData } = useTheme();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigation = useNavigation<any>();
  const [otpResendLoading, setOtpResendLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  /// Custom hook to handle the service call and snackbar visibility---/
  const {
    loading,
    data,
    setLoading,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(userService.verifyLoginOtp);
  const handleChange = (text: string, index: number) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (text === "") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && otp[index] === "") {
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  //// Function to handle the submission of the OTP data---------------------/
  const handleSubmit = async () => {
    setLoading(true);
    try {
      let pendingLoginResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("pendingLogin");

      //// Check if the pending login data exists in AsyncStorage
      if (
        !pendingLoginResponse ||
        pendingLoginResponse.exists === false
      ) {
        setLoading(false);
        setSnackbarVisible(true);
        setSnackbarMessage("Login session expired. Please request OTP again.");
        return;
      }

      const fullOtp = otp.join("");
      if (fullOtp.length !== 6) {
        setLoading(false);
        setSnackbarVisible(true);
        setSnackbarMessage("Please enter a valid OTP.");
        return;
      }

      try {
        //// Calling the fcmToken getting tuils funciton to get the fcmToken ------------------/
        const pushToken = await registerForPushNotificationsAsync();

        let requestBody = {
          email: pendingLoginResponse.data.email,
          otp: fullOtp,
          expoPushToken: pushToken,
          appPlatform: Platform.OS === "ios" ? "ios" : "android",
        };

        const response = await callService(requestBody);

        // Ensure loading stays true after callService (which sets it to false in its finally block)
        setLoading(true);

        if (response?.success) {
          /// Store user data in AsyncStorage
          await asyncStorageUtils.storeUserInAsyncStorage(response.data);
          await asyncStorageUtils.removeKeyFromAsyncStorage("pendingLogin");

          try {
            const dietPlanResponse = await userService.getActiveDietPlans();
            if (dietPlanResponse.success && dietPlanResponse.data) {
              let dietPlanUrls = dietPlanResponse.data
                .filter((elem: any) => elem.dietPlanUrl)
                .map((elem: any) => elem.dietPlanUrl);
              await asyncStorageUtils.storeDataInAsyncStorage(
                dietPlanUrls,
                "dietplans"
              );
            }
          } catch (error) {}

          // Reload theme from user data immediately after login to prevent flicker
          // This ensures theme is set correctly before navigation
          // Don't show modal here - it will be shown on home screen if needed
          await reloadThemeFromUserData(false);

          setSnackbarVisible(true);
          setSnackbarMessage("OTP verified successfully!");
          let { onboarding } = response.data;

          if (onboarding) {
            setOtp(["", "", "", "", "", ""]);

            await AsyncStorage.removeItem("wasRedirectedFromCart");

            // Navigate and keep loading visible until navigation transition starts
            navigation.navigate("secondsplashscreen");
            
            // Set loading to false after a brief delay to ensure navigation transition has started
            setTimeout(() => {
              setLoading(false);
            }, 500);

            //// When onboarding is true we will directly redirect him to secondsplashscreen
            // Uncomment to navigate on success
          } else {
            setOtp(["", "", "", "", "", ""]);
            //// when onboarding is false we will redirect him to onboarding screen
            navigation.navigate("Onboarding");
            
            // Set loading to false after a brief delay to ensure navigation transition has started
            setTimeout(() => {
              setLoading(false);
            }, 500);
          }
        } else {
          setLoading(false);
          setSnackbarVisible(true);
          setSnackbarMessage(response?.message || "Invalid OTP. Please try again.");
        }
      } catch (error: any) {
        setLoading(false);
        console.error("Error verifying OTP:", error);
        setSnackbarVisible(true);
        setSnackbarMessage(
          error?.message || "Error verifying OTP. Please try again."
        );
      }
    } catch (error) {
      setLoading(false);
      console.error("Error in handleSubmit:", error);
    }
  };

  /// Function to handle the "Resend OTP" button press---------/
  const handleResendOtp = async () => {
    try {
      setOtpResendLoading(true);
      /// Fetching the pending email from AsyncStorage---/
      const pendingLoginData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("pendingLogin");
      if (!pendingLoginData || pendingLoginData.exists === false) {
        setSnackbarVisible(true);
        setSnackbarMessage("Login session expired. Please request OTP again.");
        return;
      }
      let response = await userService.sendLoginOtp(pendingLoginData.data.email);

      if (response?.success) {
        setSnackbarVisible(true);
        setSnackbarMessage("OTP resent successfully!");
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(
        error?.message || "Error resending OTP. Please try again."
      );
    } finally {
      setOtpResendLoading(false);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../assets/images/onboardingBackground.jpg")}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              paddingTop: Platform.OS === "android" ? "5%" : "12%",
              paddingBottom: "10%",
              paddingHorizontal: theme.spacing.lg,
            }}
          >
          {/* Top Content */}
          <View style={{ alignItems: "center", gap: theme.spacing.lg, width: "100%" }}>
            <View
              style={{
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <NormalHeader screenName="Enter OTP" textColor={theme.colors.dark} />
              <Text
                style={{
                  fontSize: theme.fontSizes.small,
                  color: theme.colors.textSecondary,
                  marginTop: 12,
                }}
              >
                An OTP has been sent to your email
              </Text>
            </View>
            {/* OTP Boxes */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref: any) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  style={{
                    width: 40,
                    height: 50,
                    borderWidth: 1,
                    borderColor: theme.colors.dark,
                    borderRadius: 10,
                    textAlign: "center",
                    fontSize: theme.fontSizes.large,
                    color: theme.colors.dark,
                    backgroundColor: theme.colors.backgroundSecondary,
                  }}
                />
              ))}
            </View>
            {/* Haven’t received? Resend */}
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={otpResendLoading}
              // disable while loading
            >
              {otpResendLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.dark}
                  style={{ marginTop: theme.spacing.sm }}
                />
              ) : (
                <Text
                  style={{
                    color: theme.colors.dark,

                    fontSize: theme.fontSizes.small,
                    marginTop: theme.spacing.sm,
                  }}
                >
                  Haven’t received?{" "}
                  <Text style={{ fontWeight: "bold" }}>Resend</Text>
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit Button at Bottom */}
          <AnimatedSubmitButton
            onPress={handleSubmit}
            title="Verify"
            height={50}
            loading={loading}
          />
          </View>
        </KeyboardAvoidingView>
        <CustomSnackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
          onDismiss={() => setSnackbarVisible(false)}
        />
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

export default OTPInputScreen;
