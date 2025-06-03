import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import theme from "./Theme/globalTheme";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { checkAndNavigateToStoredScreen } from "@/utils/checkScreenRedirection";
import AnimatedSubmitButton from "./modules/AnimatedSubmitButton";
import LottieView from "lottie-react-native";
// Define the navigation types
type RootStackParamList = {
  Home: undefined;
  login: undefined;
  Onboarding: undefined; // Add any other screens here as needed
  OtpVerify: undefined;
};
const { width, height } = Dimensions.get("window");
type NavigationProp = StackNavigationProp<RootStackParamList, "Home">;
///// Main functional component for the Home screen ///// -----------------------------------/
const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      checkAndNavigateToStoredScreen<RootStackParamList>(navigation);
    }, 3000); // Match your splash animation duration

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 0,
          margin: 0,
        }}
      >
        <LottieView
          source={require("../assets/splash.json")}
          autoPlay
          loop={false}
          resizeMode="cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
          }}
        />
      </View>
    );
  }

  //// Function to handle the button press---/
  const handlePress = () => {
    navigation.navigate("login");
  };
  return (
    <ImageBackground
      source={require("../assets/images/getstartedBackground.jpg")}
      style={{
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
      }}
    >
      {/* Centered "INESS" */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          allowFontScaling={false}
          style={{
            color: theme.colors.text,
            fontSize: theme.fontSizes.large,
            fontFamily: theme.fonts.heading,
            fontWeight: theme.fontWeights.medium as any,
          }}
        >
          INESS
        </Text>
      </View>

      {/* Bottom section */}
      <View
        style={{
          alignItems: "center",
          marginBottom: theme.spacing.lg,
        }}
      >
        {/* Title */}
        <Text
          allowFontScaling={false}
          style={{
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.bold as any,
            color: theme.colors.text,
            fontFamily: theme.fonts.heading,
          }}
        >
          MAKING
        </Text>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.bold as any,
            color: theme.colors.text,
            fontFamily: theme.fonts.heading,
          }}
        >
          PEOPLE FIT.
        </Text>

        {/* Subtitle */}
        <Text
          allowFontScaling={false}
          style={{
            fontSize: theme.fontSizes.regular,
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            marginTop: theme.spacing.sm,
          }}
        >
          No Matter The Lifestyle
        </Text>

        {/* Footer text */}
        <Text
          allowFontScaling={false}
          style={{
            fontSize: theme.fontSizes.small,
            color: theme.colors.mutedText,
            fontFamily: theme.fonts.body,
            textAlign: "center",
            marginTop: theme.spacing.md,
          }}
        >
          Personal Coaching | Programs | Fitness Store | Tracking
        </Text>

        {/* Button */}
        {/* Next Button */}
        <AnimatedSubmitButton
          loading={false}
          onPress={handlePress}
          title="Login"
        />
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;
