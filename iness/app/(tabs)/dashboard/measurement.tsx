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
import { LinearGradient } from "expo-linear-gradient";
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
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#9747FF", "#844ACF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
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
                  <LinearGradient
                    colors={["#9747FF", "#844ACF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalIconContainer}
                  >
                    <MaterialCommunityIcons
                      name="tape-measure"
                      size={40}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
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
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#9747FF", "#844ACF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save Measurements</Text>
                  </LinearGradient>
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
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    borderRadius: 28,
    width: 60,
    height: 60,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
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
    maxHeight: "92%",
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#D0D0D0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    fontSize: 15,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
});
