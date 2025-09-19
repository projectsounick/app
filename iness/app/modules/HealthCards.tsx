import React, { memo, useState } from "react";
import {
  View,
  Text,
  Platform,
  Modal,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import * as Progress from "react-native-progress";
import {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
} from "@expo/vector-icons";
import theme from "../Theme/globalTheme";

function HealthDashboard() {
  const [steps, setSteps] = useState(2000);
  const stepsGoal = 10000;

  const [sleep, setSleep] = useState(6);
  const sleepGoal = 8;

  const [water, setWater] = useState(1.5);
  const waterGoal = 3;

  const [modalVisible, setModalVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const openModal = (type: any) => {
    setActiveCard(type);
    setInputValue("");
    setModalVisible(true);
  };

  const saveValue = () => {
    if (activeCard === "steps") setSteps(Number(inputValue));
    if (activeCard === "sleep") setSleep(Number(inputValue));
    if (activeCard === "water") setWater(Number(inputValue));
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, marginBottom: 16 }}>
      {/* Section Title */}

      {/* Row with Steps & Sleep */}
      <View
        style={{
          flexDirection: "row",

          justifyContent: "space-between",
        }}
      >
        {/* Steps Card */}

        <View
          style={{
            flex: 1,

            borderRadius: 12,
            padding: 16,
            marginRight: 8,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
            backgroundColor: "#fff",
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons name="walk" size={20} color="#140A21" />
              <Text
                style={{
                  marginLeft: 6,
                  fontFamily: theme.fonts.bold,
                  fontSize: theme.fonts.regular,
                }}
              >
                Steps
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openModal("steps")}
              style={{ padding: 6 }}
            >
              <AntDesign name="pluscircle" size={24} color="#67c694" />
            </TouchableOpacity>
          </View>

          <Progress.Bar
            progress={steps / stepsGoal}
            width={null}
            color="#7771de"
            unfilledColor="#E0E0E0"
            borderWidth={0}
            height={8}
            borderRadius={4}
          />
          <Text
            style={{
              marginTop: 8,
              fontWeight: "500",
              fontFamily: theme.fonts.regular,
            }}
          >
            {steps}/{stepsGoal}
          </Text>

          {/* Sync row */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {Platform.OS === "ios" ? (
                <Ionicons name="logo-apple" size={18} color="#7771de" />
              ) : (
                <MaterialCommunityIcons
                  name="google-fit"
                  size={18}
                  color="#7771de"
                />
              )}
              <Text
                style={{
                  marginLeft: 6,
                  color: "#7771de",
                  fontFamily: theme.fonts.medium,
                  fontWeight: "500",
                }}
              >
                Sync your steps
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={18}
              color="#7771de"
            />
          </TouchableOpacity>
        </View>

        {/* Sleep Card */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginLeft: 8,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={20}
                color="#140A21"
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontWeight: "600",
                  fontFamily: theme.fonts.bold,
                }}
              >
                Sleep
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openModal("sleep")}
              style={{ padding: 6 }}
            >
              <AntDesign name="pluscircle" size={24} color="#67c694" />
            </TouchableOpacity>
          </View>

          <Progress.Bar
            progress={sleep / sleepGoal}
            width={null}
            color="#7771de"
            unfilledColor="#E0E0E0"
            borderWidth={0}
            height={8}
            borderRadius={4}
          />
          <Text
            style={{
              marginTop: 8,
              fontWeight: "500",
              fontFamily: theme.fonts.regular,
            }}
          >
            {sleep}/{sleepGoal} hrs
          </Text>

          {/* Sync row */}
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {Platform.OS === "ios" ? (
                <Ionicons name="logo-apple" size={18} color="#7771de" />
              ) : (
                <MaterialCommunityIcons
                  name="google-fit"
                  size={18}
                  color="#7771de"
                />
              )}
              <Text
                style={{
                  marginLeft: 6,
                  color: "#7771de",
                  fontWeight: "500",
                  fontFamily: theme.fonts.medium,
                }}
              >
                Sync your sleep
              </Text>
            </View>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={18}
              color="#7771de"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Card */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: "#fff",
          borderRadius: 12,

          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="cup-water"
              size={20}
              color="#140A21"
            />
            <Text
              style={{
                marginLeft: 6,
                fontWeight: "600",
                fontFamily: theme.fonts.bold,
              }}
            >
              Water
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => openModal("water")}
            style={{ padding: 6 }}
          >
            <AntDesign name="pluscircle" size={24} color="#67c694" />
          </TouchableOpacity>
        </View>

        <Progress.Bar
          progress={water / waterGoal}
          width={null}
          color="#7771de"
          unfilledColor="#E0E0E0"
          borderWidth={0}
          height={8}
          borderRadius={4}
        />
        <Text
          style={{
            marginTop: 8,
            fontWeight: "500",
            fontFamily: theme.fonts.regular,
          }}
        >
          {water}/{waterGoal} L
        </Text>
      </View>

      {/* BottomSheet Modal */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 20,
                minHeight: Dimensions.get("window").height * 0.3,
                paddingBottom: 24,
              }}
            >
              <ScrollView keyboardShouldPersistTaps="handled">
                {/* Dash */}
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: "#ccc",
                    borderRadius: 2,
                    alignSelf: "center",
                    marginBottom: 16,
                  }}
                />

                {/* Header Row */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {activeCard === "steps" && (
                      <MaterialCommunityIcons
                        name="walk"
                        size={22}
                        color="#7771de"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    {activeCard === "sleep" && (
                      <MaterialCommunityIcons
                        name="moon-waning-crescent"
                        size={22}
                        color="#7771de"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    {activeCard === "water" && (
                      <MaterialCommunityIcons
                        name="cup-water"
                        size={22}
                        color="#7771de"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Add {activeCard}
                    </Text>
                  </View>

                  {/* Close button */}
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      backgroundColor: "#eee",
                      borderRadius: 20,
                      width: 34,
                      height: 34,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="close" size={20} color="#000" />
                  </TouchableOpacity>
                </View>

                {/* Input with icon */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    marginBottom: 20,
                  }}
                >
                  {activeCard === "steps" && (
                    <MaterialCommunityIcons
                      name="shoe-print"
                      size={18}
                      color="#888"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  {activeCard === "sleep" && (
                    <Ionicons
                      name="bed-outline"
                      size={18}
                      color="#888"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  {activeCard === "water" && (
                    <Ionicons
                      name="water-outline"
                      size={18}
                      color="#888"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <TextInput
                    style={{ flex: 1, paddingVertical: 10 }}
                    keyboardType="numeric"
                    placeholder="Enter value"
                    value={inputValue}
                    onChangeText={setInputValue}
                  />
                </View>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={saveValue}
                  style={{
                    backgroundColor: "#67c694",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 14,
                    borderRadius: 30,
                  }}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default memo(HealthDashboard);
