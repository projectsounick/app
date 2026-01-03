import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTheme, useGlobalTheme } from "./Theme/ThemeContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import AnimatedSubmitButton from "./modules/AnimatedSubmitButton";
import LottieView from "lottie-react-native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { useRouter } from "expo-router";

type RootStackParamList = {
  Home: undefined;
  login: undefined;
  Onboarding: undefined;
  OtpVerify: undefined;
};

const { width, height } = Dimensions.get("window");
type NavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      if (userData?.exists && userData.data?.onboarding === true) {
        router.push("/secondsplashscreen");
      } else {
        setShowSplash(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
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
    navigation.navigate("login");
  };

  const handleSkip = () => {
    router.push("/secondsplashscreen"); // ✅ skip to main app flow
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {isDark ? (
        // Dark mode: Use solid dark background
        <View
          style={{
            flex: 1,
            paddingHorizontal: theme.spacing.md,
            justifyContent: "space-between",
            backgroundColor: theme.colors.background,
          }}
        >
        {/* ✅ Skip Button (Top Right) - Smaller and less prominent */}
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            backgroundColor: theme.colors.backgroundSecondary,
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 16,
            zIndex: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontWeight: "500",
              fontSize: theme.fontSizes.small,
              letterSpacing: 0.2,
            }}
          >
            Skip Now
          </Text>
        </TouchableOpacity>

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
        </View>
      ) : (
        // Light mode: Use image background
        <ImageBackground
          source={require("../assets/images/getstartedBackground.jpg")}
          style={{
            flex: 1,
            paddingHorizontal: theme.spacing.md,
            justifyContent: "space-between",
          }}
        >
          {/* ✅ Skip Button (Top Right) - Smaller and less prominent */}
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              backgroundColor: "rgba(0,0,0,0.2)",
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: 16,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontWeight: "500",
                fontSize: theme.fontSizes.small,
                letterSpacing: 0.2,
              }}
            >
              Skip Now
            </Text>
          </TouchableOpacity>

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
      )}
    </View>
  );
};

export default HomeScreen;
