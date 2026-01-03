import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { height } = Dimensions.get("window");

const measurementFields = [
  { key: "chest", label: "Chest", icon: "human-male" },
  { key: "waist", label: "Waist", icon: "circle-outline" },
  { key: "thigh", label: "Thigh", icon: "human-handsdown" },
  { key: "armSizeLeft", label: "Left Arm", icon: "arm-flex" },
  { key: "armSizeRight", label: "Right Arm", icon: "arm-flex-outline" },
];

export default function MeasurementDashboard({ userId }: { userId: string }) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
            <ActivityIndicator color={theme.colors.secondPrimary} size="large" />
          </View>
        ) : (
          <>
            {measurements.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons
                    name="tape-measure"
                    size={40}
                    color={theme.colors.secondPrimary}
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
                      colors={isDark ? [theme.colors.backgroundCard, theme.colors.backgroundSecondary] : ["#9747FF", "#844ACF"]}
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
                  <Ionicons name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconWrapper}>
                  <LinearGradient
                    colors={isDark ? [theme.colors.backgroundCard, theme.colors.backgroundSecondary] : ["#9747FF", "#844ACF"]}
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
                      placeholderTextColor={theme.colors.textMuted}
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
                    colors={isDark ? [theme.colors.backgroundCard, theme.colors.backgroundSecondary] : ["#9747FF", "#844ACF"]}
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
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...(isDark ? {} : {
      shadowColor: theme.colors.secondPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: theme.fonts.regular,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    ...(isDark ? {} : {
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  emptyButtonText: {
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.medium,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 28,
    width: 60,
    height: 60,
    ...(isDark ? {} : {
      shadowColor: theme.colors.secondPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    }),
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.border,
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
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: theme.fonts.bold,
  },
  formContainer: {
    maxHeight: 300,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.text,
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
    color: theme.colors.textWhite,
    fontWeight: theme.fontWeights.bold as "700",
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.bold,
  },
});
