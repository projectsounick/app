import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../Theme/globalTheme";
import { userService } from "../services/user.service";
import { uploadToAzureFromExpo } from "@/utils/azureUtils"; // your azure upload util
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

const { width, height } = Dimensions.get("window");
export type HealthReportUploaderRef = {
  openModal?: () => void;
};
const HealthReportUploader = forwardRef<HealthReportUploaderRef>((_, ref) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  // Expose function to parent via ref
  useImperativeHandle(ref, () => ({
    openModal: () => setModalVisible(true),
  }));

  useEffect(() => {
    const checkHealthReport = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (!user.healthReport) {
          setTimeout(() => setModalVisible(true), 4000);
        }
      }
    };
    checkHealthReport();
  }, []);
  const checkPermission = async () => {
    // Normally, PDF picking doesn't need permissions
    const granted = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "Permission Required",
        "Storage permission is required to pick a PDF file.",
        [
          { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
          { text: "OK", onPress: () => resolve(true) },
        ],
        { cancelable: false }
      );
    });

    if (!granted) {
      return false;
    }
    return true;
  };

  const pickAndUploadPDF = async () => {
    try {
      console.log("Starting PDF upload...");

      // Check permission
      const permission = await checkPermission();
      if (!permission) return;

      // Pick the PDF document
      const result: any = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      console.log("DocumentPicker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]; // Use the first selected file
        setLoading(true);
        setFileName(file.name);

        // Get storage details
        const storageDetails =
          await userService.getStorageAccountDetails("healthreport");
        const { storageAccountName, sasToken } = storageDetails.data;
        console.log("Storage details:", storageDetails);

        // Upload to Azure
        const uploaded = await uploadToAzureFromExpo(
          file.uri,
          file.name,
          sasToken,
          storageAccountName,
          "admin-data",
          "healthreport"
        );
        console.log("Uploaded URL:", uploaded);

        setUploadedUrl(uploaded);
        setLoading(false);

        // Update user in backend and AsyncStorage
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const response = await userService.updateUser({
            healthReport: uploaded,
          });
          if (response.success) {
            Alert.alert("Success", "Health report uploaded successfully!");
            setModalVisible(false);
            user.healthReport = uploaded;
            await AsyncStorage.setItem("user", JSON.stringify(user));
          } else {
            throw new Error("Failed to update health report on server");
          }
        }
      } else {
        console.log("User canceled PDF selection");
      }
    } catch (err) {
      console.log("Upload error:", err);
      Alert.alert("Error", "Failed to upload the health report.");
      setLoading(false);
    }
  };

  return (
    <Modal animationType="fade" visible={modalVisible} transparent>
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
            width: width * 0.85,
            borderRadius: 20,
            backgroundColor: "#fff",
            overflow: "hidden",
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {/* Header with Close Icon */}
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={{
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              Upload Health Report
            </Text>

            {/* Circular Close Icon */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#fff",
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3,
              }}
            >
              <Ionicons name="close" size={20} color={theme.primary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Body */}
          <View style={{ padding: 25, alignItems: "center" }}>
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                color: "#333",
                marginBottom: 10,
              }}
            >
              We couldn't find your health report.
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#666",
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              Uploading your health report helps us analyze your fitness data
              and provide personalized recommendations. Please select a PDF file
              from your device.
            </Text>

            {loading ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: 15,
                }}
              >
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ marginTop: 10, color: "#333" }}>
                  Uploading {fileName}...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickAndUploadPDF}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.primary,
                  paddingVertical: 14,
                  paddingHorizontal: 25,
                  borderRadius: 35,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#000",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 6,
                }}
              >
                <Ionicons name="cloud-upload" size={24} color="#000" />
                <Text
                  style={{
                    color: "#000",
                    fontWeight: "700",
                    marginLeft: 12,
                    fontSize: 16,
                  }}
                >
                  Upload Report
                </Text>
              </TouchableOpacity>
            )}

            {uploadedUrl && (
              <Text
                style={{
                  marginTop: 15,
                  color: "green",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Uploaded URL: {uploadedUrl}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
});
export default HealthReportUploader;
