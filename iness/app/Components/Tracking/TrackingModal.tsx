import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator } from "react-native-paper";
import theme from "@/app/Theme/globalTheme";

const { height } = Dimensions.get("window");

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
      onSubmit(type, Number(val));
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "sleep":
        return (
          <Ionicons
            name="bed-outline"
            size={42}
            color={theme.colors.secondPrimary}
          />
        );
      case "steps":
        return (
          <FontAwesome5
            name="walking"
            size={42}
            color={theme.colors.secondPrimary}
          />
        );
      case "water":
        return (
          <MaterialCommunityIcons
            name="cup-water"
            size={42}
            color={theme.colors.secondPrimary}
          />
        );
      default:
        return null;
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case "sleep":
        return "Enter hours of sleep";
      case "steps":
        return "Enter step count";
      default:
        return "";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <LinearGradient
          colors={["#2C1453", "#1C0E33"]}
          style={{
            height: 340,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            padding: 20,
            overflow: "hidden",
          }}
        >
          {/* Handle Bar */}
          <View
            style={{
              width: 45,
              height: 5,
              backgroundColor: "rgba(255,255,255,0.4)",
              borderRadius: 3,
              alignSelf: "center",
              marginTop: 4,
              marginBottom: 10,
            }}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: 6,
            }}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Content */}
          <View style={{ alignItems: "center", marginTop: 25 }}>
            {getIcon()}
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#fff",
                marginTop: 10,
              }}
            >
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>

            {type === "water" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 25,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#67c694",
                    borderRadius: 25,
                    padding: 12,
                    marginHorizontal: 20,
                  }}
                  onPress={decrement}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 22,
                      fontWeight: "bold",
                    }}
                  >
                    -
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  {values.water} Glasses
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#67c694",
                    borderRadius: 25,
                    padding: 12,
                    marginHorizontal: 20,
                  }}
                  onPress={increment}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 22,
                      fontWeight: "bold",
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
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={{
                  width: "85%",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                  borderRadius: 12,
                  padding: 12,
                  marginVertical: 20,
                  fontSize: 16,
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                value={values[type]}
                onChangeText={handleChange}
              />
            )}

            {dataLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: "#67c694",
                  paddingVertical: 12,
                  borderRadius: 20,
                  width: 180,
                  marginTop: 10,
                }}
                onPress={() => handleAdd(type)}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: theme.fontWeights.bold,
                    textAlign: "center",
                    fontSize: theme.fontSizes.medium,
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TrackerModal;
