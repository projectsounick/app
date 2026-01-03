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
  ScrollView,
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
      <View style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
        <ImageBackground
          source={require("../assets/images/onboardingBackground.jpg")}
          style={{ flex: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{
              flex: 1,
            }}
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
                  {/* Top Content */}
                  <View style={{ width: "100%", alignItems: "flex-start", paddingHorizontal: 0 }}>
                    <NormalHeader screenName="Your Email" textColor={theme.colors.dark} />

                    <Text
                      style={{
                        fontSize: theme.fontSizes.regular,
                        color: theme.colors.text,
                        textAlign: "center",
                        marginTop: 12,
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
                              backgroundColor: theme.colors.background,
                              borderRadius: 8,
                              paddingHorizontal: theme.spacing.md,
                              paddingVertical: 6,
                              width: "100%",
                              elevation: 2,
                              marginBottom: theme.spacing.sm,
                              alignSelf: "stretch",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                height: 48,
                                borderColor: theme.colors.border,
                                borderWidth: 0,
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
                                  borderBottomWidth: 0,
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
                  </View>
                </ScrollView>

                {/* Fixed Bottom Section */}
                <View
                  style={{
                    paddingBottom: "10%",
                    width: "100%",
                    paddingHorizontal: 0,
                  }}
                >
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
              {/* Top Content */}
              <View style={{ width: "100%" }}>
                <NormalHeader screenName="Your Email" textColor={theme.colors.dark} />

                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    color: theme.colors.text,
                    textAlign: "center",
                    marginTop: 12,
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
                          backgroundColor: theme.colors.background,
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
                    <Text style={{ marginRight: 8, fontSize: theme.fontSizes.regular }}>
                      +{country?.callingCode?.[0] || "91"}
                    </Text> */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            height: 48,
                            borderColor: theme.colors.border,
                            borderWidth: Platform.OS === "android" ? 0 : 1, // remove border on Android
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            backgroundColor: theme.colors.background,
                            width: "100%",
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
                            textContentType="emailAddress" // 🔐 Helps iOS recognize input type
                            autoComplete="email" // ✅ For Android autofill
                            importantForAutofill="yes" // ✅ Explicitly request autofill
                            autoCapitalize="none"
                            style={{
                              flex: 1,
                              fontSize: theme.fontSizes.regular,
                              color: theme.colors.dark,
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
            )}
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
