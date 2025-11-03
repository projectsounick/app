import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { ActivityIndicator } from "react-native-paper";
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

  useEffect(() => {
    if (visible) {
      // Optionally reset values on open
      setValues((prev) => ({ ...prev, [type]: type === "water" ? "0" : "" }));
    }
  }, [visible, type]);

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
    } else {
    }
  };

  const getIcon = () => {
    switch (type) {
      case "sleep":
        return (
          <Ionicons
            name="bed-outline"
            size={32}
            color={theme.colors.secondPrimary}
          />
        );
      case "steps":
        return (
          <FontAwesome5
            name="walking"
            size={32}
            color={theme.colors.secondPrimary}
          />
        );
      case "water":
        return (
          <MaterialCommunityIcons
            name="cup-water"
            size={32}
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
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              position: "absolute",
              top: -25,
              right: -20,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 8,
              elevation: 3,
              zIndex: 10,
            }}
          >
            <Ionicons name="close" size={20} color="#333" />
          </Pressable>

          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              alignItems: "center",
              elevation: 5,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
          >
            {getIcon()}
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginVertical: 12 }}
            >
              Add {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>

            {type === "water" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#00bcd4",
                    borderRadius: 25,
                    padding: 12,
                    marginHorizontal: 20,
                  }}
                  onPress={decrement}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}
                  >
                    -
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#333" }}
                >
                  {values.water} Glasses
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#00bcd4",
                    borderRadius: 25,
                    padding: 12,
                    marginHorizontal: 20,
                  }}
                  onPress={increment}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                keyboardType="numeric"
                placeholder={getPlaceholder()}
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  padding: 10,
                  marginVertical: 12,
                  fontSize: 16,
                }}
                value={values[type]}
                onChangeText={handleChange}
              />
            )}

            {dataLoading ? (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color={theme.colors.secondPrimary} />
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: "#67c694",
                  paddingVertical: 12,
                  paddingHorizontal: 30,
                  borderRadius: 20,
                  width: 200,

                  marginTop: 10,
                }}
                onPress={() => {
                  handleAdd(type);
                }}
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
        </View>
      </View>
    </Modal>
  );
};

export default TrackerModal;
