import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { measurementunitsService } from "@/app/services/measurement.service";
import NormalHeader from "@/app/modules/NormalHeader";
import useGetDataHook from "@/hooks/useFetchHook";
import { MeasurementEntry } from "@/app/interfaces/otherInterfaces";
import theme from "@/app/Theme/globalTheme";
import MeasurementList from "@/app/Components/MeasureMentList";
import { ActivityIndicator } from "react-native-paper";

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
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ paddingLeft: 20, paddingTop: 20 }}>
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
            backgroundColor: "rgba(189, 255, 132, 1)",
            borderRadius: 30,
            width: 60,
            height: 60,
            justifyContent: "center",
            alignItems: "center",
            elevation: 4,
          }}
        >
          <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Add Measurements
                </Text>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#e0e0e0",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color="#000" />
                </TouchableOpacity>
              </View>

              {["chest", "waist", "thigh", "armSizeLeft", "armSizeRight"].map(
                (field) => (
                  <TextInput
                    key={field}
                    placeholder={`${field.replace("armSize", "Arm Size ")} (cm)`}
                    keyboardType="numeric"
                    style={{
                      backgroundColor: "#f2f2f2",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 10,
                    }}
                    value={form[field as keyof typeof form]}
                    onChangeText={(text) =>
                      setForm((prev) => ({ ...prev, [field]: text }))
                    }
                  />
                )
              )}

              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: "rgba(189, 255, 132, 1)",
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#000" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}
