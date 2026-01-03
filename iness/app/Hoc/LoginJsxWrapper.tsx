import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { userService } from "../services/user.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import theme from "../Theme/globalTheme";

interface LoginJsxWrapperProps {
  children: React.ReactNode;
  loginButton?: boolean;
  backButton?: boolean;
}

const LoginJsxWrapper: React.FC<LoginJsxWrapperProps> = ({
  children,
  loginButton = false,
  backButton = false,
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const router = useRouter();

  // ✅ Check if user exists in AsyncStorage
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        setUserExists(response.exists);
      } catch (error) {
        console.error("Error checking user:", error);
        setUserExists(false);
      }
    };

    checkUser();
  }, []);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handlePress = () => {
    Alert.alert(
      "Login Required",
      "You need to log in to access this content.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Login",
          onPress: () => userService.logout(),
        },
      ]
    );
  };

  const handleBackPress = () => router.back();

  // 🚫 If user exists, don't render overlay (just render children)
  if (userExists === true) {
    return <>{children}</>;
  }

  // 🕓 Show nothing while checking AsyncStorage
  if (userExists === null) {
    return null;
  }

  // 🚷 Show overlay when user does NOT exist
  return (
    <View
      style={{
        position: "relative",
        width: "100%",
        marginVertical: 8,
      }}
      onLayout={handleLayout}
    >
      {/* Actual child content */}
      {children}

      {/* Overlay covering child fully */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: layout.width || "100%",
          height: layout.height || "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <Ionicons name="lock-closed" size={45} color="#fff" />
          <Text
            style={{
              color: theme.colors.textWhite,
              fontSize: theme.fontSizes.regular,
              marginTop: 10,
              textAlign: "center",
              fontWeight: theme.fontWeights.medium as "500",
            }}
          >
            You need to log in to access this content.
          </Text>

          {loginButton && (
            <>
              <Text
                style={{
                  color: theme.colors.textMuted,
                  fontSize: theme.fontSizes.regularSmall,
                  marginTop: 12,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                You don't have any account created with us.{"\n"}You need to
                create one to access this page.
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={{
                  backgroundColor: theme.colors.success,
                  paddingVertical: 8,
                  paddingHorizontal: 30,
                  borderRadius: 25,
                  marginTop: 15,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontWeight: theme.fontWeights.medium as "500",
                    fontSize: theme.fontSizes.regular,
                  }}
                >
                  Login
                </Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>

        {backButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={{
              position: "absolute",
              top: 15,
              left: 15,
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 6,
              elevation: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LoginJsxWrapper;
