import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { router } from "expo-router";
import { userService } from "@/app/services/user.service";
import HealthReportUploader from "@/app/modules/UploadReportPdf";

const handleCoupons = () => router.push("/dashboard/coupon");
const handlePolicy = () => router.push("/dashboard/policy");
const handleSupport = () => router.push("/dashboard/supportchat");
const handleCalculator = () => router.push("/dashboard/calculator");
const handleYourPurchases = () => router.push("/dashboard/purchases");
const handlePreferences = () => router.push("/dashboard/preferences");
const handleMeasurements = () => router.push("/dashboard/measurement");
const handleWeightTrack = () => router.push("/(tabs)/dashboard/trackWeight");
export default function SettingsList() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalVisible, setHealthReportModalVisible] = useState(false);
  const handleLogout = async () => {
    await userService.logout();
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.deleteaccount();
      await userService.logout(); // Replace with actual delete logic
      // You can add a success message or redirect here
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setIsDeleting(false);
      setModalVisible(false);
    }
  };

  const settings = [
    {
      icon: "fitness", // progress icon
      label: "Body Weight Track",
      onPress:
        // navigate to Weight Tracker screen
        handleWeightTrack,
    },
    { icon: "pricetags-outline", label: "Coupons", onPress: handleCoupons },
    {
      icon: "cart-outline",
      label: "Your Purchases",
      onPress: handleYourPurchases,
    },
    {
      icon: "cloud-upload-outline",
      label: "Health Report Upload",
      onPress: () => setHealthReportModalVisible(true), // opens the HealthReportUploader modal
    },
    {
      icon: "chatbox-ellipses-outline",
      label: "Support",
      onPress: handleSupport,
    },
    {
      icon: "calculator-outline",
      label: "Calculator",
      onPress: handleCalculator,
    },
    {
      icon: "scale-outline",
      label: "Measurements",
      onPress: handleMeasurements,
    },
    {
      icon: "settings-outline",
      label: "Preferences",
      onPress: handlePreferences,
    },
    { icon: "document-text-outline", label: "Policy", onPress: handlePolicy },
    { icon: "log-out-outline", label: "Logout", onPress: handleLogout },
    {
      icon: "trash-outline",
      label: "Delete Account",
      onPress: () => setModalVisible(true), // Open modal
      color: "red",
    },
  ];

  return (
    <View>
      {settings.map((item: any, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          style={{
            backgroundColor: theme.colors.cardLight,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={item.icon}
              size={20}
              color={item.color || theme.colors.dark}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: item.color || theme.colors.dark,
                fontFamily: theme.fonts.bold,
              }}
            >
              {item.label}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.dark}
          />
        </TouchableOpacity>
      ))}

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 12,
              width: "85%",
              alignItems: "center",
            }}
          >
            <Ionicons name="warning-outline" size={40} color="red" />
            <Text
              style={{
                fontSize: 18,
                fontFamily: theme.fonts.bold,
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              Are you sure?
            </Text>
            <Text
              style={{
                textAlign: "center",
                color: "#555",
                marginBottom: 20,
                fontFamily: theme.fonts.medium,
              }}
            >
              Your account will be permanently deleted. This action cannot be
              undone.
            </Text>

            {isDeleting ? (
              <ActivityIndicator size="small" color="red" />
            ) : (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    backgroundColor: "#ccc",
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontFamily: theme.fonts.medium }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                    backgroundColor: "red",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontFamily: theme.fonts.medium }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <HealthReportUploader
        modalVisible={modalVisible}
        setModalVisible={setHealthReportModalVisible}
      />
    </View>
  );
}
