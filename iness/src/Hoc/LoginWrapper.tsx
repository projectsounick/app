import { safeRouter } from "@/src/utils/safeRouter";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils"; // ⬅️ adjust path as needed
import { userService } from "../services/user.service";
import theme from "../Theme/globalTheme";

export interface OverlayLockWrapperProps {
  loginButton?: boolean;
  backButton?: boolean;
}

type LoginWrapperOptions = {
  allowedRoles?: readonly string[];
};

/**
 * Higher Order Component that wraps another component
 * and overlays a lock screen with login prompt if user is not logged in.
 */
export function LoginWrapper<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: LoginWrapperOptions = {}
) {
  return function WithLockOverlay(props: P & OverlayLockWrapperProps) {
    const { loginButton = true, backButton = true, ...rest } = props;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isRoleAllowed, setIsRoleAllowed] = useState(true);

    useEffect(() => {
      const checkUser = async () => {
        try {
          const userResult =
            await asyncStorageUtils.checkIfKeyExistsInAsyncStorage<Record<string, any>>("user");
          const token = userResult.data?.jwtToken || userResult.data?.accessToken;
          const hasSession = Boolean(userResult.exists && token);
          setIsLoggedIn(hasSession);
          setIsRoleAllowed(
            !hasSession ||
              !options.allowedRoles?.length ||
              options.allowedRoles.includes(String(userResult.data?.role || ""))
          );
        } catch (error) {
          console.error("Error checking AsyncStorage:", error);
          setIsLoggedIn(false);
        } finally {
          setLoading(false);
        }
      };

      checkUser();
    }, []);

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

    const handleBackPress = () => safeRouter.back();

    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#67C694" />
        </View>
      );
    }

    if (isLoggedIn && !isRoleAllowed) {
      return (
        <View style={styles.accessDeniedContainer}>
          <Ionicons name="shield-outline" size={54} color="#67C694" />
          <Text style={styles.accessDeniedTitle}>Access restricted</Text>
          <Text style={styles.accessDeniedText}>
            This screen is not available for your account role.
          </Text>
          <TouchableOpacity onPress={handleBackPress} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {/* Wrapped child screen */}
        {isLoggedIn ? <WrappedComponent {...(rest as P)} /> : null}

        {/* Lock Overlay (only if not logged in) */}
        {!isLoggedIn && (
          <>
            <View style={styles.overlay}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                style={styles.overlayContent}
              >
                <Ionicons name="lock-closed" size={50} color="#fff" />

                {loginButton && (
                  <>
                    <Text style={styles.overlayText}>
                      You don’t have any account created with us.{"\n"}You need
                      to create one to access this page.
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",

                        width: "100%",
                      }}
                    >
                      {backButton ? (
                        <TouchableOpacity
                          onPress={handleBackPress}
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: "#E5E7EB",
                            borderRadius: 20,
                            marginTop: 18,
                            paddingVertical: 10,
                            paddingHorizontal: 30,
                          }}
                        >
                          <View
                            style={{
                              // counter-skew to keep text straight
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.textSecondary,
                                fontWeight: theme.fontWeights.medium as "500",
                                fontSize: theme.fontSizes.regularSmall,
                              }}
                            >
                              Cancel
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        onPress={handlePress}
                        style={styles.loginButton}
                      >
                        <Text style={styles.loginButtonText}>Login</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: theme.colors.background,
  },
  accessDeniedTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    marginTop: 14,
  },
  accessDeniedText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.regularSmall,
    textAlign: "center",
    marginTop: 8,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 3,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    padding: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    zIndex: 2,
  },
  overlayContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  overlayText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regularSmall,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 18,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regular,
  },
});
