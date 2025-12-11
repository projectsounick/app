import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ImageBackground,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { measurementunitsService } from "@/app/services/measurement.service";
import NormalHeader from "@/app/modules/NormalHeader";
import useGetDataHook from "@/hooks/useFetchHook";
import MeasurementList from "@/app/Components/MeasureMentList";
import { ActivityIndicator } from "react-native-paper";
import theme from "@/app/Theme/globalTheme";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");

const measurementFields = [
  { key: "chest", label: "Chest", icon: "human-male" },
  { key: "waist", label: "Waist", icon: "circle-outline" },
  { key: "thigh", label: "Thigh", icon: "human-handsdown" },
  { key: "armSizeLeft", label: "Left Arm", icon: "arm-flex" },
  { key: "armSizeRight", label: "Right Arm", icon: "arm-flex-outline" },
];

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
        throw new Error("Some error has happened while adding measurement");
      }
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["left", "right"]}
      >
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: Platform.OS === "ios" ? height * 0.05 : "4%",
          }}
        >
          <NormalHeader screenName="Measurements" />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#9747FF" size="large" />
          </View>
        ) : (
          <>
            {measurements.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons
                    name="tape-measure"
                    size={40}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.emptyTitle}>No measurements yet</Text>
                <Text style={styles.emptySubtitle}>
                  Track your body measurements to monitor your progress
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  style={styles.emptyButton}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Add Measurement</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <MeasurementList measurements={measurements.measurementUnits} />
            )}
          </>
        )}

        {/* FAB */}
        {measurements.length > 0 && (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Add Measurement Modal - Bottom Sheet */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.overlayTouchable} />
            </TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingContainer}
            >
              <View style={styles.modalContent}>
                {/* Dash Handle */}
                <View style={styles.dashHandle} />

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color="#1A1A1A" />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconWrapper}>
                  <View style={styles.modalIconContainer}>
                    <MaterialCommunityIcons
                      name="tape-measure"
                      size={36}
                      color="#9747FF"
                    />
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.modalTitle}>Add Measurements</Text>

                {/* Form */}
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.formContainer}
                  contentContainerStyle={{ paddingBottom: 10 }}
                >
                  {measurementFields.map((field) => (
                    <TextInput
                      key={field.key}
                      placeholder={`${field.label} (cm)`}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      style={styles.input}
                      value={form[field.key as keyof typeof form]}
                      onChangeText={(text) =>
                        setForm((prev) => ({ ...prev, [field.key]: text }))
                      }
                    />
                  ))}
                </ScrollView>

                {/* Save Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save Measurements</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: theme.fonts.regular,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#67C694",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    fontFamily: theme.fonts.medium,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#67C694",
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Bottom Sheet Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: theme.fonts.bold,
  },
  formContainer: {
    maxHeight: 300,
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  saveButton: {
    backgroundColor: "#67C694",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
});
