import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import {
  Ionicons,

} from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const TrackerModal = ({
  visible,
  onClose,
  type,
  onSubmit,
  dataLoading,
}: {
  visible: boolean;
  onClose: () => void;
  type: "sleep" | "steps" | "water";
  onSubmit: any;
  dataLoading: boolean;
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [values, setValues] = useState({ water: "0", sleep: "", steps: "" });

  const increment = () => {
    setValues((prev) => ({
      ...prev,
      water: (parseInt(prev.water || "0") + 1).toString(),
    }));
  };

  const decrement = () => {
    setValues((prev) => ({
      ...prev,
      water: Math.max(0, parseInt(prev.water || "0") - 1).toString(),
    }));
  };

  const handleChange = (text: string) => {
    setValues((prev) => ({ ...prev, [type]: text }));
  };

  const handleAdd = (type: "sleep" | "steps" | "water") => {
    const val = values[type];
    if (val !== "" && val !== null && val !== undefined) {
      // Close modal FIRST to prevent UI blocking
      onClose();
      // Then submit data in next tick to ensure modal is closed
      setTimeout(() => {
        onSubmit(type, Number(val));
      }, 0);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "sleep":
        return (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? theme.colors.backgroundCard : "#E8F5E9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="moon-outline" size={40} color={theme.colors.success} />
          </View>
        );
      case "steps":
        return (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? theme.colors.backgroundCard : "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="walk-outline" size={40} color={theme.colors.secondPrimary} />
          </View>
        );
      case "water":
        return (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark ? theme.colors.backgroundCard : "#E3F2FD",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="water-outline" size={40} color={isDark ? theme.colors.text : "#4FC3F7"} />
          </View>
        );
      default:
        return null;
    }
  };

  const getPlaceholder = (): string => {
    switch (type) {
      case "sleep":
        return "Enter hours of sleep";
      case "steps":
        return "Enter step count";
      default:
        return "";
    }
  };

  const getTitle = (): string => {
    switch (type) {
      case "sleep":
        return "Add Sleep";
      case "steps":
        return "Add Steps";
      case "water":
        return "Add Water";
      default:
        return "";
    }
  };

  // Hide navigation bar when modal opens
  useEffect(() => {
    if (visible && Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    } else if (!visible && Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: theme.colors.overlay,
        }}
        pointerEvents="box-none"
      >
        <View
          style={{
            height: type === "water" ? 400 : 370,
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Platform.OS === "android" ? 20 : 40,
            overflow: "hidden",
          }}
          pointerEvents="auto"
        >
          {/* Handle Bar */}
          <View
            style={{
              width: 50,
              height: 5,
              backgroundColor: theme.colors.border,
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 20,
              backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
              borderRadius: 16,
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Content */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            {getIcon()}
            <Text
              style={{
                fontSize: theme.fontSizes.large,
                fontWeight: theme.fontWeights.bold as "700",
                color: theme.colors.text,
                marginTop: 16,
              }}
            >
              {getTitle()}
            </Text>

            {type === "water" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 30,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.success,
                    borderRadius: 30,
                    width: 50,
                    height: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 20,
                  }}
                  onPress={decrement}
                >
                  <Text
                    style={{
                      color: theme.colors.textWhite,
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                    }}
                  >
                    -
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    minWidth: 120,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.text,
                    }}
                  >
                    {values.water || "0"}
                  </Text>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.regularSmall,
                      fontWeight: theme.fontWeights.medium as "500",
                      color: theme.colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    Glasses
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.success,
                    borderRadius: 30,
                    width: 50,
                    height: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 20,
                  }}
                  onPress={increment}
                >
                  <Text
                    style={{
                      color: theme.colors.textWhite,
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                    }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                keyboardType="numeric"
                placeholder={getPlaceholder()}
                placeholderTextColor={theme.colors.textMuted}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 16,
                  padding: 16,
                  marginVertical: 30,
                  fontSize: theme.fontSizes.regular,
                  color: theme.colors.text,
                  backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
                }}
                value={values[type] || ""}
                onChangeText={handleChange}
              />
            )}

            {dataLoading ? (
              <ActivityIndicator color={theme.colors.success} size="large" style={{ marginTop: 10, marginBottom: 0 }} />
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.success,
                  paddingVertical: 16,
                  borderRadius: 30,
                  width: "100%",
                  marginTop: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => handleAdd(type)}
              >
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontWeight: theme.fontWeights.bold as "700",
                    textAlign: "center",
                    fontSize: theme.fontSizes.regular,
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TrackerModal;
