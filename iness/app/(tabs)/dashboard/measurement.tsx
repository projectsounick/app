import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ImageBackground,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { measurementunitsService } from "@/app/services/measurement.service";
import NormalHeader from "@/app/modules/NormalHeader";
import useGetDataHook from "@/hooks/useFetchHook";

import MeasurementList from "@/app/Components/MeasureMentList";
import { ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
const { height, width } = Dimensions.get("window");

export default function MeasurementDashboard({ userId }: { userId: string }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    chest: "",
    waist: "",
    thigh: "",
    armSizeLeft: "",
    armSizeRight: "",
  });

  const {
    data: measurements,
    setData,
    loading,
    setLoading,
    error,
    snackbarVisible,
    setSnackbarMessage,
    setSnackbarVisible,
    snackbarMessage,
    fetchData,
  } = useGetDataHook(measurementunitsService.getMeasurementUnits);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const data = {
        chest: +form.chest || undefined,
        waist: +form.waist || undefined,
        thigh: +form.thigh || undefined,
        armSizeLeft: +form.armSizeLeft || undefined,
        armSizeRight: +form.armSizeRight || undefined,
      };
      const res = await measurementunitsService.createMeasurementUnits(data);
      if (res.success) {
        setModalVisible(false);
        setForm({
          chest: "",
          waist: "",
          thigh: "",
          armSizeLeft: "",
          armSizeRight: "",
        });

        fetchData();
      } else {
        throw new Error("some error has happened while adding measurement");
      }
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: Platform.OS === "ios" ? height * 0.01 : "4%",
        }}
      >
        <NormalHeader screenName="Measurements" />
      </View>
      {loading ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {measurements.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <Text
                style={{ fontSize: 18, color: "#666", textAlign: "center" }}
              >
                No measurements available.
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#888",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Create one to get started.
              </Text>
            </View>
          ) : (
            <MeasurementList measurements={measurements.measurementUnits} />
          )}
        </>
      )}

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 30,
          right: 20,
          backgroundColor: "#67c694",
          borderRadius: 30,
          width: 60,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
          elevation: 4,
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              {/* Bottom sheet with gradient */}
              <LinearGradient
                colors={["#2C1453", "#1C0E33"]} // replace with your theme gradient
                style={{
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 20,
                  paddingBottom: 30,
                }}
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    Add Measurements
                  </Text>

                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Inputs */}
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {[
                    "chest",
                    "waist",
                    "thigh",
                    "armSizeLeft",
                    "armSizeRight",
                  ].map((field) => (
                    <TextInput
                      key={field}
                      placeholder={`${field
                        .replace("armSizeLeft", "Left Arm Size")
                        .replace("armSizeRight", "Right Arm Size")
                        .replace("chest", "Chest")
                        .replace("waist", "Waist")
                        .replace("thigh", "Thigh")} (cm)`}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      keyboardType="numeric"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.15)",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.25)",
                        fontSize: 15,
                        color: "#fff",
                      }}
                      value={form[field as keyof typeof form]}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, [field]: text }))
                      }
                    />
                  ))}
                </ScrollView>

                {/* Save Button */}
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    onPress={handleSubmit}
                    style={{
                      marginTop: 12,
                      backgroundColor: "#67c694",
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      shadowColor: "#67c694",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.4,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
