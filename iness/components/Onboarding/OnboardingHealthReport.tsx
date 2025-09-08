import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import theme from "@/app/Theme/globalTheme";
import CustomSnackbar from "@/app/modules/Snackbar";
import { userService } from "@/app/services/user.service";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
const screenHeight = Dimensions.get("window").height;

const OnboardingHealthReport = ({ onNext }: { onNext: () => void }) => {
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const pickAndUploadPDF = async () => {
    try {
      const result: any = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (result.type === "success") {
        setLoading(true);
        setFileName(result.name);

        const storageDetails = await userService.getStorageAccountDetails(
          "transformationImages"
        );
        const { storageAccountName, sasToken } = storageDetails.data;

        const uploaded = await uploadToAzureFromExpo(
          result.uri,
          result.name,
          sasToken,
          storageAccountName,
          "admin-data",
          "transformationImages"
        );

        setUploadedUrl(uploaded);

        const userStr = await AsyncStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.healthReport = uploaded;
          await AsyncStorage.setItem("user", JSON.stringify(user));
        }

        setLoading(false);
        Alert.alert("Success", "Health report uploaded successfully!");
      }
    } catch (err: any) {
      console.log("Upload error:", err);
      setLoading(false);
      setSnackbarMessage("Failed to upload the health report.");
      setSnackbarVisible(true);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: "5%",
        paddingBottom: "5%",
        paddingTop: "10%",
        backgroundColor: "#fff",
      }}
    >
      {/* Heading */}
      <View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#333",
            marginBottom: 20,
          }}
        >
          Upload Your Health Report
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#555",
            marginBottom: 30,
          }}
        >
          Please upload your health report in PDF format to continue.
        </Text>
      </View>

      {/* Upload Button / Loading */}
      <View style={{ alignItems: "center" }}>
        {loading ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
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
              backgroundColor: theme.primary,
              paddingVertical: 14,
              paddingHorizontal: 25,
              borderRadius: 30,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Pick & Upload PDF
            </Text>
          </TouchableOpacity>
        )}

        {/* Optional uploaded URL display */}
        {uploadedUrl && (
          <Text
            style={{
              marginTop: 10,
              color: "green",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Uploaded URL: {uploadedUrl}
          </Text>
        )}
      </View>

      {/* Skip / Next Button */}
      <TouchableOpacity
        onPress={onNext}
        style={{
          backgroundColor: uploadedUrl ? theme.primary : "#aaa",
          paddingVertical: 14,
          borderRadius: 30,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          {uploadedUrl ? "Next" : "Skip"}
        </Text>
      </TouchableOpacity>

      {/* Snackbar */}
      <CustomSnackbar
        visible={snackbarVisible}
        bgColor={theme.colors.red}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

export default OnboardingHealthReport;
