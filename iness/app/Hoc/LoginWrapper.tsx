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

export interface OverlayLockWrapperProps {
  loginButton?: boolean;
  backButton?: boolean;
}

/**
 * Higher Order Component that wraps another component
 * and overlays a lock screen with login prompt if user is not logged in.
 */
export function LoginWrapper<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithLockOverlay(props: P & OverlayLockWrapperProps) {
    const { loginButton = true, backButton = true, ...rest } = props;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
      const checkUser = async () => {
        try {
          const response =
            await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
          setIsLoggedIn(response.exists);
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

    const handleBackPress = () => router.back();

    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#67C694" />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        {/* Wrapped child screen */}
        <WrappedComponent {...(rest as P)} />

        {/* Lock Overlay (only if not logged in) */}
        {!isLoggedIn && (
          <>
            {/* Back button */}
            {backButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
            )}

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

                    <TouchableOpacity
                      onPress={handlePress}
                      style={styles.loginButton}
                    >
                      <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
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
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 3,
    backgroundColor: "#1a1a1a",
    borderRadius: 24,
    padding: 6,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: "#67C694",
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
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
