import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Formik } from "formik";
import { useRouter } from "expo-router";
import theme from "./Theme/globalTheme";

import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { userService } from "./services/user.service";
import AnimatedSubmitButton from "./modules/AnimatedSubmitButton";
import CustomSnackbar from "./modules/Snackbar";
import PrivacyPolicyModal from "./modules/PrivacyPolicyModal";

import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import NormalHeader from "./modules/NormalHeader";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import Checkbox from "expo-checkbox";

//// Main functional component for the Login screen ///// -----------------------------------/
const Login = () => {
  const formikRef = React.useRef<any>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [emailValue, setEmailValue] = useState("");

  const router = useRouter();
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
  } = useServiceWithSnackbar(userService.sendLoginOtp);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /// Function to handle the submission of the login data---/
  async function submitLoginData(email: string, resetForm: any) {
    // const formattedPhoneNumber = `+${
    //   country?.callingCode?.[0] || "91"
    // }${phoneNumber}`;
    setLoading(true);
    if (email !== "") {
      let response = await callService(email);

      if (response?.success) {
        /// Store the screen name in AsyncStorage---/

        await asyncStorageUtils.storeUserInAsyncStorage(response.data);

        router.push("/OtpVerify"); // ✅ replace with Expo Router path
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


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
        <ImageBackground
          source={require("../assets/images/onboardingBackground.jpg")}
          style={{ flex: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{
              flex: 1,
              justifyContent: "center",
              paddingHorizontal: theme.spacing.lg,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <View
              style={{
                flex: 1, // Ensures the View takes up the full available space
                justifyContent: "space-between", // Adds space between top content and the button
                alignItems: "center",
                paddingTop: "15%",
                paddingBottom: "10%",
              }}
            >
              {/* Top Content */}
              <View>
                <NormalHeader screenName="Your Email" />

                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    color: theme.colors.normal,
                    textAlign: "center",
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  please provide your Email. Your privacy is our priority.
                </Text>

                <Formik
                  innerRef={formikRef}
                  initialValues={{ email: "" }}
                  onSubmit={(values, { resetForm }) => {
                    submitLoginData(values.email, resetForm);
                    // ✅ Reset the form after submission
                  }}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  }) => (
                    <>
                      {/* Phone Input + Country Picker */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#fff",
                          borderRadius: 8,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: 6,
                          width: "100%",
                          elevation: 2,
                          marginBottom: theme.spacing.sm,
                        }}
                      >
                        {/* <CountryPicker
                      countryCode={countryCode}
                      withFilter
                      withFlag
                      withCallingCode
                      onSelect={onSelect}
                      containerButtonStyle={{ marginRight: theme.spacing.sm }}
                    />
                    <Text style={{ marginRight: 8, fontSize: 16 }}>
                      +{country?.callingCode?.[0] || "91"}
                    </Text> */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            height: 48,
                            borderColor: "#ccc",
                            borderWidth: Platform.OS === "android" ? 0 : 1, // remove border on Android
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            backgroundColor: "#fff",
                            width: "100%",
                          }}
                        >
                          <MaterialCommunityIcons
                            name="email-outline"
                            size={20}
                            color="#888"
                            style={{ marginRight: 8 }}
                          />
                          <TextInput
                            placeholder="Enter email"
                            placeholderTextColor="#888"
                            value={values.email}
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => {
                              const lowerText = text.toLowerCase();
                              handleChange("email")(lowerText);
                              setEmailValue(lowerText);
                            }}
                            onBlur={handleBlur("email")}
                            keyboardType="email-address"
                            textContentType="emailAddress" // 🔐 Helps iOS recognize input type
                            autoComplete="email" // ✅ For Android autofill
                            importantForAutofill="yes" // ✅ Explicitly request autofill
                            autoCapitalize="none"
                            style={{
                              flex: 1,
                              fontSize: 16,
                              color: "#000", // replace with theme.colors.dark if needed
                              backgroundColor: "transparent",
                              borderWidth: 0,
                              borderBottomWidth: 0,
                              paddingVertical: 0,
                              includeFontPadding: false,
                              textAlignVertical: "center", // important for Android alignment
                            }}
                          />
                        </View>
                      </View>

                      {/* Error */}
                      {errorMessage && (
                        <Text
                          style={{
                            color: "red",
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
              </View>

              <View style={{ marginTop: 24, width: "100%" }}>
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
                    color={isChecked ? "#67C694" : undefined}
                    style={{
                      borderRadius: 4,
                      width: 18,
                      height: 18,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#000",
                      marginLeft: 10,
                      fontFamily: theme.fonts.regular,
                    }}
                  >
                    I accept the{" "}
                    <Text
                      style={{
                        color: "#9747FF",
                        fontFamily: theme.fonts.medium,
                        textDecorationLine: "underline",
                      }}
                      onPress={() => setPolicyVisible(true)}
                    >
                      Privacy Policy & Terms
                    </Text>
                  </Text>
                </View>

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
            </View>
          </KeyboardAvoidingView>

          {/* // Snackbar for displaying messages */}
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

export default Login;
