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
  ScrollView,
  Modal,
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

import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import NormalHeader from "./modules/NormalHeader";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { error } from "console";
import Checkbox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
//// Main functional component for the Login screen ///// -----------------------------------/
const Login = () => {
  const formikRef = React.useRef<any>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);

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
                            underlineColorAndroid="transparent" // 👈 Add this line
                            onChangeText={(text) =>
                              handleChange("email")(text.toLowerCase())
                            }
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

              <View style={{ marginTop: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 16,
                    justifyContent: "center",
                  }}
                >
                  <Checkbox
                    value={isChecked}
                    onValueChange={setIsChecked}
                    color={isChecked ? "#000" : undefined}
                  />
                  <Text style={{ marginLeft: 8, fontSize: 14 }}>
                    I accept the{" "}
                    <Text
                      style={{
                        color: theme.colors.dark,
                        textDecorationLine: "underline",
                      }}
                      onPress={() => setPolicyVisible(true)}
                    >
                      Privacy Policy & Terms
                    </Text>
                  </Text>
                </View>
                <View style={{ opacity: !isChecked ? 0.5 : 1 }}>
                  <AnimatedSubmitButton
                    loading={loading}
                    onPress={() => {
                      if (isChecked) formikRef.current?.handleSubmit();
                    }}
                    height={50}
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
        <Modal
          visible={policyVisible}
          animationType="slide"
          onRequestClose={() => setPolicyVisible(false)}
          transparent={true}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                height: "85%",
                backgroundColor: "#fff",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 20,
                overflow: "hidden",
              }}
            >
              <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                    Privacy Policy
                  </Text>
                  <TouchableOpacity onPress={() => setPolicyVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                  style={{ paddingHorizontal: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>
                    Last updated: 11-06-2025{"\n\n"}
                    We collect personal data including your name, email, phone
                    number, gender, age, address, fitness goals, health-related
                    data, and payment information. We may also collect data
                    about your usage of the app and device-related information
                    to improve your experience.
                    {"\n\n"}2. Permissions We Request{"\n"}- Camera Access: Used
                    to upload profile pictures.{"\n"}- Notifications: For
                    workout reminders, updates.{"\n\n"}
                    3. How We Use Your Information{"\n"}- Provide personalized
                    experiences{"\n"}- Offer support, process payments, improve
                    app performance{"\n\n"}
                    4. Data Security{"\n"}- We use encryption and industry
                    protocols, but no system is 100% secure.{"\n\n"}
                    5. Sharing Your Information{"\n"}- Only with your consent or
                    legal compliance. Never sold.{"\n\n"}
                    6. Your Rights{"\n"}- Update or delete data. Revoke
                    permissions anytime.{"\n\n"}
                    7. Changes to This Policy{"\n"}- Updated here and via email.
                    {"\n\n"}Additional:{"\n"}- Data is shared only with trusted
                    vendors under confidentiality.{"\n"}- You can opt-out of
                    promotional messages anytime.{"\n"}- Contact:
                    founder@iness.fitness{"\n\n"}
                    Cancellation Policy:{"\n"}- Must be requested within 24
                    hours of purchase.{"\n"}- No refund once a plan has started
                    or content has been accessed.{"\n"}- Refunds only for
                    eligible cases with proof.
                    {"\n"}- Refund requests: founder@iness.fitness{"\n\n"}
                    Refunds are NOT applicable on: - Online Training Programs -
                    Custom Diet/Workout Plans - Live/Recorded Classes - Active
                    Memberships
                    {"\n\n"}
                    8. User Conduct & Content Policy{"\n"}- By using this app,
                    you agree to our Terms of Service (EULA).{"\n"}- There is
                    zero tolerance for objectionable content or abusive users.
                    {"\n"}- Any violation of these terms may result in account
                    suspension or termination without notice.
                    {"\n\n"}
                    Thank you for trusting Iness Fitness.
                  </Text>

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setPolicyVisible(false)}
                    style={{
                      marginTop: 30,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: theme.colors.primary,
                      alignItems: "center",
                      marginBottom: 40,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
