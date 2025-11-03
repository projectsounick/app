import React from "react";
import { Alert } from "react-native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";

/**
 * HOC to protect a button with async storage user check.
 * It wraps your button and ensures user login before allowing press.
 */
export function withAuthGuard<P extends { onPress?: () => void }>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithAuth = (props: P) => {
    const handlePress = async () => {
      try {
        const response =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (response.exists) {
          // User exists — proceed with the original press
          props.onPress?.();
        } else {
          // User not found — show alert
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
        }
      } catch (error) {
        console.error("AuthGuard check failed:", error);
      }
    };

    // Pass all props but override onPress
    return <WrappedComponent {...props} onPress={handlePress} />;
  };

  return ComponentWithAuth;
}
