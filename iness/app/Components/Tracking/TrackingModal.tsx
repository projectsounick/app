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
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#E8F5E9", // Matches card bgColor
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="moon-outline" size={40} color="#67C694" /> 
          </View>
        );
      case "steps":
        return (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#F3EDFF", // Matches card bgColor
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="walk-outline" size={40} color="#9747FF" /> 
          </View>
        );
      case "water":
        return (
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#E3F2FD", // Matches card bgColor
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="water-outline" size={40} color="#4FC3F7" /> 
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
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            height: type === "water" ? 400 : 370,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Platform.OS === "android" ? 20 : 40,
            overflow: "hidden",
          }}
        >
          {/* Handle Bar */}
          <View
            style={{
              width: 50,
              height: 5,
              backgroundColor: "#ccc",
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
              backgroundColor: "#F0F0F0",
              borderRadius: 16,
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Ionicons name="close" size={20} color="#000" />
          </TouchableOpacity>

          {/* Content */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            {getIcon()}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#000",
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
                    backgroundColor: "#67C694",
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
                      color: "#FFFFFF",
                      fontSize: 24,
                      fontWeight: "700",
                    }}
                  >
                    -
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    backgroundColor: "#F8F8F8",
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    minWidth: 120,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    {values.water || "0"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: "#666",
                      marginTop: 4,
                    }}
                  >
                    Glasses
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#67C694",
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
                      color: "#FFFFFF",
                      fontSize: 24,
                      fontWeight: "700",
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
                placeholderTextColor="#999"
                style={{
                  width: "100%",
                  borderWidth: 1,
                  borderColor: "#E0E0E0",
                  borderRadius: 16,
                  padding: 16,
                  marginVertical: 30,
                  fontSize: 16,
                  color: "#000",
                  backgroundColor: "#F8F8F8",
                }}
                value={values[type] || ""}
                onChangeText={handleChange}
              />
            )}

            {dataLoading ? (
              <ActivityIndicator color="#67C694" size="large" style={{ marginTop: 10, marginBottom: 0 }} />
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: "#67C694",
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
                    color: "#FFFFFF",
                    fontWeight: "700",
                    textAlign: "center",
                    fontSize: 16,
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
