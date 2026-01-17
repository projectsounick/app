import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Formik } from "formik";
import { useRouter } from "expo-router";
import theme from "./Theme/globalTheme";

import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { userService } from "./services/user.service";
import AnimatedSubmitButton from "./modules/AnimatedSubmitButton";
import CustomSnackbar from "./modules/Snackbar";
import PrivacyPolicyModal from "@/app/Modals/PrivacyPolicyModal";

import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import NormalHeader from "./modules/NormalHeader";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import Checkbox from "expo-checkbox";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
// @ts-ignore - ESM warning can be ignored, works at runtime
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// Complete auth session for web browser (iOS)
WebBrowser.maybeCompleteAuthSession();

// Configure Google Sign-In for Android
if (Platform.OS === "android") {
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    offlineAccess: true,
  });
}

//// Main functional component for the Login screen ///// -----------------------------------/
const Login = () => {
  const formikRef = React.useRef<any>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [emailValue, setEmailValue] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  const router = useRouter();

  // Check Apple Authentication availability
  useEffect(() => {
    const checkAppleAuth = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleAuthAvailable(isAvailable);
    };
    checkAppleAuth();
  }, []);

  // Google Auth configuration
  // iOS: uses expo-auth-session with iosClientId
  // Android: hook is initialized but we use native GoogleSignin instead (see handleAndroidGoogleSignIn)
  const googleAuthConfig = Platform.select({
    ios: {
      iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
      webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    },
    android: {
      // Use webClientId for both to prevent expo-auth-session errors
      // Actual Android sign-in uses native GoogleSignin, not this hook
      androidClientId: Constants.expoConfig?.extra?.googleWebClientId,
      webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    },
    default: {
      webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    },
  });
  
  const [request, response, promptAsync] = Google.useAuthRequest(googleAuthConfig!);

  // Handle Google Auth response (iOS - expo-auth-session)
  useEffect(() => {
    if (Platform.OS === "ios") {
      if (response?.type === "success") {
        handleGoogleSignIn(response.authentication?.idToken);
      } else if (response?.type === "error") {
        setGoogleLoading(false);
        setSnackbarMessage("Google sign-in failed. Please try again.");
        setSnackbarVisible(true);
      }
    }
  }, [response]);

  // Handle Google Sign-In for Android (native)
  const handleAndroidGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      console.log("[Android Google Sign-In] Starting...");
      
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log("[Android Google Sign-In] Play Services available");
      
      // Sign out first to always show account picker
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignore sign out errors (user might not be signed in)
      }
      
      // Sign in - will now show account picker
      const userInfo = await GoogleSignin.signIn();
      console.log("[Android Google Sign-In] Sign-in successful, userInfo:", userInfo.user?.email);
      
      // Get the ID token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      console.log("[Android Google Sign-In] Got tokens, idToken present:", !!idToken);
      
      if (idToken) {
        console.log("[Android Google Sign-In] Calling handleGoogleSignIn with idToken");
        await handleGoogleSignIn(idToken);
      } else {
        console.error("[Android Google Sign-In] No idToken received");
        setSnackbarMessage("Failed to get Google credentials");
        setSnackbarVisible(true);
        setGoogleLoading(false);
      }
    } catch (error: any) {
      setGoogleLoading(false);
      console.error("[Android Google Sign-In] Error:", error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google sign-in cancelled");
        // Don't show error for cancellation
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setSnackbarMessage("Sign-in already in progress");
        setSnackbarVisible(true);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setSnackbarMessage("Google Play Services not available");
        setSnackbarVisible(true);
      } else {
        console.error("Google sign-in error:", error);
        setSnackbarMessage(error?.message || "Google sign-in failed. Please try again.");
        setSnackbarVisible(true);
      }
    }
  };

  /// Custom hook to handle the service call and snackbar visibility---/
  const {
    loading,
    setLoading,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(userService.sendLoginOtp);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get Expo Push Token
  const getExpoPushToken = async (): Promise<string | undefined> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === "granted") {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        return token.data;
      }
    } catch (error) {
      console.log("Error getting push token:", error);
    }
    return undefined;
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async (idToken: string | undefined) => {
    console.log("[handleGoogleSignIn] Called with idToken:", !!idToken);
    
    if (!idToken) {
      console.error("[handleGoogleSignIn] No idToken provided");
      setGoogleLoading(false);
      setSnackbarMessage("Failed to get Google credentials");
      setSnackbarVisible(true);
      return;
    }

    try {
      setGoogleLoading(true);
      console.log("[handleGoogleSignIn] Getting push token...");
      const expoPushToken = await getExpoPushToken();

      console.log("[handleGoogleSignIn] Calling userService.googleSignIn...");
      const response = await userService.googleSignIn({
        idToken,
        expoPushToken,
      });

      console.log("[handleGoogleSignIn] Response received:", response?.success);

      if (response?.success) {
        console.log("[handleGoogleSignIn] Success! Storing user data...");
        await asyncStorageUtils.storeUserInAsyncStorage(response.data);
        
        // Check if user needs onboarding
        if (response.data.onboarding) {
          console.log("[handleGoogleSignIn] User has completed onboarding, redirecting to splash");
          // Go through splash screen for data sync
          router.replace("/secondsplashscreen");
        } else {
          console.log("[handleGoogleSignIn] User needs onboarding, redirecting to Onboarding");
          router.replace("/Onboarding");
        }
      } else {
        console.error("[handleGoogleSignIn] Response failed:", response?.message);
        setSnackbarMessage(response?.message || "Google sign-in failed");
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      console.error("[handleGoogleSignIn] Exception:", error);
      setSnackbarMessage(error?.message || "Google sign-in failed");
      setSnackbarVisible(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Apple Sign-In
  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const expoPushToken = await getExpoPushToken();

      const response = await userService.appleSignIn({
        identityToken: credential.identityToken!,
        userIdentifier: credential.user,
        email: credential.email || undefined,
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName || undefined,
              familyName: credential.fullName.familyName || undefined,
            }
          : undefined,
        expoPushToken,
      });

      if (response?.success) {
        await asyncStorageUtils.storeUserInAsyncStorage(response.data);
        
        // Check if user needs onboarding
        if (response.data.onboarding) {
          // Go through splash screen for data sync
          router.replace("/secondsplashscreen");
        } else {
          router.replace("/Onboarding");
        }
      } else {
        setSnackbarMessage(response?.message || "Apple sign-in failed");
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        // User cancelled the sign-in
        console.log("Apple sign-in cancelled");
      } else {
        setSnackbarMessage(error?.message || "Apple sign-in failed");
        setSnackbarVisible(true);
      }
    } finally {
      setAppleLoading(false);
    }
  };

  /// Function to handle the submission of the login data---/
  async function submitLoginData(email: string, resetForm: any) {
    setLoading(true);
    if (email !== "") {
      let response = await callService(email);

      if (response?.success) {
        await asyncStorageUtils.storeUserInAsyncStorage(response.data);
        router.push("/OtpVerify");
        resetForm({
          values: { email: "" },
          errors: {},
          touched: {},
        });
        setErrorMessage(null);
      }
    } else {
      setErrorMessage("Email is required");
    }
  }

  // Divider Component
  const OrDivider = () => (
    <View style={styles.dividerContainer}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or continue with</Text>
      <View style={styles.dividerLine} />
    </View>
  );

  // Content for both iOS and Android
  const renderContent = () => (
    <>
      {/* Top Content */}
      <View style={{ width: "100%", alignItems: "flex-start", paddingHorizontal: 0 }}>
        <NormalHeader screenName="Welcome" textColor={theme.colors.dark} />

        <Text
          style={{
            fontSize: theme.fontSizes.regular,
            color: theme.colors.text,
            textAlign: "left",
            marginTop: 12,
            marginBottom: theme.spacing.lg,
          }}
        >
          Sign in to continue your fitness journey
        </Text>

        <Formik
          innerRef={formikRef}
          initialValues={{ email: "" }}
          onSubmit={(values, { resetForm }) => {
            submitLoginData(values.email, resetForm);
          }}
        >
          {({
            handleChange,
            handleBlur,
            values,
          }) => (
            <>
              {/* Email Input */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.colors.background,
                  borderRadius: 12,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 6,
                  width: "100%",
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  marginBottom: theme.spacing.sm,
                  alignSelf: "stretch",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 48,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    backgroundColor: theme.colors.background,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={theme.colors.textMuted}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    placeholder="Enter email"
                    placeholderTextColor={theme.colors.textMuted}
                    value={values.email}
                    underlineColorAndroid="transparent"
                    onChangeText={(text) => {
                      const lowerText = text.toLowerCase();
                      handleChange("email")(lowerText);
                      setEmailValue(lowerText);
                    }}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    importantForAutofill="yes"
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      fontSize: theme.fontSizes.regular,
                      color: theme.colors.dark,
                      backgroundColor: "transparent",
                      borderWidth: 0,
                      paddingVertical: 0,
                      includeFontPadding: false,
                      textAlignVertical: "center",
                    }}
                  />
                </View>
              </View>

              {/* Error */}
              {errorMessage && (
                <Text
                  style={{
                    color: theme.colors.error,
                    fontSize: theme.fontSizes.small,
                    alignSelf: "center",
                    textAlign: "center",
                    marginBottom: theme.spacing.md,
                    marginLeft: 4,
                  }}
                >
                  {errorMessage}
                </Text>
              )}
            </>
          )}
        </Formik>

        {/* Or Divider */}
        <OrDivider />

        {/* Social Sign-In Buttons - Horizontal */}
        <View style={styles.socialButtonsContainer}>
          {/* Google Sign-In */}
          <TouchableOpacity
            onPress={() => {
              if (!isChecked) {
                setSnackbarMessage("Please accept the Privacy Policy first");
                setSnackbarVisible(true);
                return;
              }
              
              if (Platform.OS === "android") {
                // Use native Google Sign-In for Android
                handleAndroidGoogleSignIn();
              } else {
                // Use expo-auth-session for iOS
                setGoogleLoading(true);
                promptAsync();
              }
            }}
            disabled={Platform.OS === "ios" ? (!request || googleLoading) : googleLoading}
            style={[styles.googleButton, (Platform.OS === "ios" ? (!request || googleLoading) : googleLoading) && styles.socialButtonDisabled]}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#EA4335" />
            ) : (
              <Ionicons name="logo-google" size={22} color="#EA4335" />
            )}
          </TouchableOpacity>

          {/* Apple Sign-In (iOS only) */}
          {Platform.OS === "ios" && isAppleAuthAvailable && (
            <TouchableOpacity
              onPress={() => {
                if (!isChecked) {
                  setSnackbarMessage("Please accept the Privacy Policy first");
                  setSnackbarVisible(true);
                  return;
                }
                handleAppleSignIn();
              }}
              disabled={appleLoading}
              style={[styles.appleButton, appleLoading && styles.socialButtonDisabled]}
              activeOpacity={0.8}
            >
              {appleLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  // Bottom section with checkbox and Send OTP
  const renderBottomSection = () => (
    <View style={{ width: "100%" }}>
      {/* Privacy Policy Checkbox */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          justifyContent: "center",
        }}
      >
        <Checkbox
          value={isChecked}
          onValueChange={setIsChecked}
          color={isChecked ? theme.colors.success : undefined}
          style={{
            borderRadius: 4,
            width: 18,
            height: 18,
          }}
        />
        <Text
          style={{
            fontSize: theme.fontSizes.regularSmall,
            color: theme.colors.text,
            marginLeft: 10,
            fontFamily: theme.fonts.regular,
          }}
        >
          I accept the{" "}
          <Text
            style={{
              color: theme.colors.secondPrimary,
              fontFamily: theme.fonts.medium,
              textDecorationLine: "underline",
            }}
            onPress={() => setPolicyVisible(true)}
          >
            Privacy Policy & Terms
          </Text>
        </Text>
      </View>

      {/* Send OTP Button */}
      <View
        style={{
          opacity: !isChecked || !emailValue.trim() ? 0.5 : 1,
        }}
      >
        <AnimatedSubmitButton
          loading={loading}
          onPress={() => {
            if (isChecked && emailValue.trim()) {
              formikRef.current?.handleSubmit();
            }
          }}
          height={56}
          title="Send OTP"
        />
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
        <ImageBackground
          source={require("../assets/images/onboardingBackground.jpg")}
          style={{ flex: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{ flex: 1 }}
            enabled={true}
          >
            {Platform.OS === "android" ? (
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: theme.spacing.lg,
                }}
              >
                <ScrollView
                  contentContainerStyle={{
                    paddingTop: "5%",
                    paddingHorizontal: 0,
                    flexGrow: 1,
                  }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {renderContent()}
                </ScrollView>

                {/* Fixed Bottom Section */}
                <View
                  style={{
                    paddingBottom: "10%",
                    width: "100%",
                    paddingHorizontal: 0,
                  }}
                >
                  {renderBottomSection()}
                </View>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "12%",
                  paddingBottom: "10%",
                  paddingHorizontal: theme.spacing.lg,
                }}
              >
                {renderContent()}
                {renderBottomSection()}
              </View>
            )}
          </KeyboardAvoidingView>

          {/* Snackbar for displaying messages */}
          <CustomSnackbar
            visible={snackbarVisible}
            message={snackbarMessage}
            bgColor={theme.colors.primary}
            onDismiss={() => setSnackbarVisible(false)}
          />
        </ImageBackground>
        <PrivacyPolicyModal
          visible={policyVisible}
          onClose={() => setPolicyVisible(false)}
          onAccept={() => setIsChecked(true)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  socialButtonDisabled: {
    opacity: 0.5,
  },
  // Google Button - Icon only, white circle
  googleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  // Apple Button - Icon only, black circle
  appleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default Login;
