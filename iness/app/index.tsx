import { safeRouter } from "@/src/utils/safeRouter";
import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground, Dimensions, Image } from "react-native";
import { lightColors } from "@/src/Theme/colors";
import { responsiveFontSize, responsiveSpacing } from "@/src/Theme/responsiveFontSize";
import { useNavigation } from "expo-router";
import AnimatedSubmitButton from "@/src/modules/AnimatedSubmitButton";
import LottieView from "lottie-react-native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  // Always use light theme for login screen
  const theme = {
    colors: lightColors,
    fontSizes: {
      small: responsiveFontSize(12),
      regularSmall: responsiveFontSize(14),
      regular: responsiveFontSize(16),
      medium: responsiveFontSize(18),
      large: responsiveFontSize(24),
      xlarge: responsiveFontSize(28),
      xl: responsiveFontSize(32),
      xxl: responsiveFontSize(38),
    },
    fontWeights: {
      regular: "400",
      medium: "500",
      bold: "700",
    },
    spacing: {
      xs: responsiveSpacing(4),
      sm: responsiveSpacing(8),
      md: responsiveSpacing(16),
      lg: responsiveSpacing(24),
      xl: responsiveSpacing(32),
      xxl: responsiveSpacing(48),
    },
    fonts: {
      heading: "SatoshiBold",
      subheading: "SatoshiMedium",
      body: "SatoshiRegular",
      regular: "SatoshiRegular",
      medium: "SatoshiMedium",
      bold: "SatoshiBold",
    },
  };
  const navigation = useNavigation<any>();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const hasSession = await asyncStorageUtils.hasAuthenticatedUserSession();
        const userData =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (!isMounted) return;

        if (hasSession && userData?.exists && userData.data?.onboarding === true) {
          safeRouter.navigate("/secondsplashscreen");
        } else if (hasSession && userData?.exists) {
          safeRouter.navigate("/Onboarding");
        } else {
          setShowSplash(false);
        }
      } catch {
        if (isMounted) setShowSplash(false);
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (showSplash) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
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

  const handlePress = () => {
    safeRouter.navigate("/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Always use light mode: Use image background */}
      <ImageBackground
        source={require("../assets/images/getstartedBackground.jpg")}
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.md,
          justifyContent: "space-between",
        }}
      >
          {/* Logo section */}
          <View
            style={{
              alignItems: "center",
              marginTop: height * 0.2,
            }}
          >
            <Image
              source={require("../assets/images/logowithoutbackground.png")}
              style={{
                width: 100,
                height: 100,
                resizeMode: "contain",
              }}
            />
            <Text
              allowFontScaling={false}
              style={{
                color: theme.colors.textWhite,
                fontSize: theme.fontSizes.large,
                fontFamily: theme.fonts.heading,
                fontWeight: theme.fontWeights.medium as any,
                marginTop: 4,
              }}
            >
              INESS
            </Text>
          </View>

          {/* Bottom section - positioned at absolute bottom */}
          <View
            style={{
              alignItems: "center",
              paddingBottom: 40,
              paddingHorizontal: 16,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontSize: theme.fontSizes.xxl,
                fontWeight: theme.fontWeights.bold as any,
                color: theme.colors.textWhite,
                fontFamily: theme.fonts.bold,
                textAlign: "center",
              }}
            >
              TRANSFORMING LIVES
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontSize: theme.fontSizes.large,
                fontWeight: "400",
                marginTop: 8,
                color: theme.colors.textWhite,
                fontFamily: theme.fonts.regular,
              }}
            >
              Since 2015
            </Text>

            <Text
              allowFontScaling={false}
              style={{
                fontSize: theme.fontSizes.small,
                color: theme.colors.textWhite,
                fontFamily: theme.fonts.regular,
                textAlign: "center",
                marginTop: 24,
                lineHeight: 18,
              }}
            >
              Personal Coaching | Sustainable Diet Plans | FitTube | Fitness
              shopping
            </Text>

            <AnimatedSubmitButton
              loading={false}
              onPress={handlePress}
              title="Login"
              height={50}
            />
          </View>
        </ImageBackground>
    </View>
  );
};

export default HomeScreen;
