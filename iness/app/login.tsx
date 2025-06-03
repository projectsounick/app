import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Formik } from "formik";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import theme from "./Theme/globalTheme";
import { validationSchemaForLogin } from "./validation/formikValidations";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { userService } from "./services/user.service";
import AnimatedSubmitButton from "./modules/AnimatedSubmitButton";
import CustomSnackbar from "./modules/Snackbar";
import { useNavigation } from "@react-navigation/native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import NormalHeader from "./modules/NormalHeader";

//// Main functional component for the Login screen ///// -----------------------------------/
const Login = () => {
  const formikRef = React.useRef<any>(null);
  const navigation = useNavigation<any>();

  const [countryCode, setCountryCode] = useState<CountryCode>("IN");
  const [country, setCountry] = useState<Country | null>(null);

  /// Custom hook to handle the service call and snackbar visibility---/
  const {
    loading,
    data,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
  } = useServiceWithSnackbar(userService.sendLoginOtp);

  /// Function to handle the country selection---/
  const onSelect = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
  };
  /// Function to handle the submission of the login data---/
  async function submitLoginData(phoneNumber: string) {
    const formattedPhoneNumber = `+${
      country?.callingCode?.[0] || "91"
    }${phoneNumber}`;
    let response = await callService(formattedPhoneNumber);

    if (response?.success) {
      /// Store the screen name in AsyncStorage---/

      await asyncStorageUtils.storeUserInAsyncStorage(response.data);

      navigation.navigate("OtpVerify");
    }
  }

  return (
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
            paddingTop: "20%",
            paddingBottom: "10%",
          }}
        >
          {/* Top Content */}
          <View>
            <NormalHeader screenName="Your Contact Number" />

            <Text
              style={{
                fontSize: theme.fontSizes.regular,
                color: theme.colors.normal,
                textAlign: "center",
                marginBottom: theme.spacing.lg,
              }}
            >
              please provide your phone number. Your privacy is our priority.
            </Text>

            <Formik
              innerRef={formikRef}
              initialValues={{ phoneNumber: "" }}
              validationSchema={validationSchemaForLogin}
              onSubmit={(values) => {
                submitLoginData(values.phoneNumber);
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
                    <CountryPicker
                      countryCode={countryCode}
                      withFilter
                      withFlag
                      withCallingCode
                      onSelect={onSelect}
                      containerButtonStyle={{ marginRight: theme.spacing.sm }}
                    />
                    <Text style={{ marginRight: 8, fontSize: 16 }}>
                      +{country?.callingCode?.[0] || "91"}
                    </Text>
                    <TextInput
                      placeholder="Enter phone number"
                      keyboardType="numeric"
                      maxLength={10}
                      value={values.phoneNumber}
                      onChangeText={handleChange("phoneNumber")}
                      onBlur={handleBlur("phoneNumber")}
                      style={{
                        flex: 1,
                        fontSize: 16,
                        color: theme.colors.dark,
                      }}
                    />
                  </View>

                  {/* Error */}
                  {errors.phoneNumber && touched.phoneNumber && (
                    <Text
                      style={{
                        color: "red",
                        fontSize: theme.fontSizes.small,
                        alignSelf: "flex-start",
                        marginBottom: theme.spacing.md,
                        marginLeft: 4,
                      }}
                    >
                      {errors.phoneNumber}
                    </Text>
                  )}
                </>
              )}
            </Formik>
          </View>

          <AnimatedSubmitButton
            loading={loading}
            onPress={() => formikRef.current?.handleSubmit()}
            title="Send OTP"
          />
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
  );
};

export default Login;
