import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground, Dimensions, Image } from "react-native";
import theme from "./Theme/globalTheme";
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
          backgroundColor: "#fff",
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../assets/images/getstartedBackground.jpg")}
        style={{
          flex: 1,
          paddingHorizontal: theme.spacing.md,
          justifyContent: "space-between", // ✅ push logo to top, button section to bottom
        }}
      >
        {/* Logo section */}
        <View
          style={{
            alignItems: "center",
            marginTop: height * 0.2, // ✅ 20% from top
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
              color: theme.colors.text,
              fontSize: theme.fontSizes.large,
              fontFamily: theme.fonts.heading,
              fontWeight: theme.fontWeights.medium as any,
              marginTop: 4,
            }}
          >
            INESS
          </Text>
        </View>

        {/* Bottom section */}
        <View
          style={{
            alignItems: "center",
            marginBottom: height * 0.15, // ✅ 30% from bottom
          }}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 40,
              fontWeight: theme.fontWeights.bold as any,
              color: theme.colors.text,
              fontFamily: theme.fonts.bold,
              textAlign: "center",
            }}
          >
            TRANSFORMING LIVES
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              fontSize: 25,
              fontWeight: "400",
              marginTop: "2%",
              color: theme.colors.text,
              fontFamily: theme.fonts.regular,
            }}
          >
            Since 2015
          </Text>

          <Text
            allowFontScaling={false}
            style={{
              fontSize: 12,
              color: theme.colors.mutedText,
              fontFamily: theme.fonts.regular,
              textAlign: "center",
              marginTop: 33,
            }}
          >
            Personal Coaching | Sustainable Diet Plans | FitTube | Fitness
            shopping
          </Text>

          <AnimatedSubmitButton
            loading={false}
            onPress={handlePress}
            title="Login"
            height={60}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default HomeScreen;
