import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "../Theme/globalTheme";

export function withAuthGuard<P extends { onPress?: () => void }>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithAuth = (props: P) => {
    const [showModal, setShowModal] = useState(false);

    const handlePress = async () => {
      try {
        const hasSession =
          await asyncStorageUtils.hasAuthenticatedUserSession();

        if (hasSession) {
          // ✅ User is logged in
          props.onPress?.();
        } else {
          // ❌ User not logged in — show modal
          setShowModal(true);
        }
      } catch (error) {
        console.error("AuthGuard check failed:", error);
      }
    };

    const handleLogin = () => {
      setShowModal(false);
      // ✅ Safely navigate after a brief delay
      requestAnimationFrame(() => {
        setTimeout(() => router.replace("/"), 150);
      });
    };

    const handleCancel = () => setShowModal(false);

    return (
      <>
        <WrappedComponent {...props} onPress={handlePress} />

        {/* Custom Modal for Login Prompt */}
        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={handleCancel}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={48}
                color="#6D28D9"
                style={{ marginBottom: 10 }}
              />
              <Text style={styles.title}>Login Required</Text>
              <Text style={styles.message}>
                You need to log in to access this feature.
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.loginButton]}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  return ComponentWithAuth;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 6,
  },
  message: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#67c694",
    borderRadius: 20,
  },
  loginText: {
    color: "#fff",
    fontWeight: "600",
  },
});
