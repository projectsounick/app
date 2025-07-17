import React, { memo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadToAzureFromExpo } from "@/utils/azureUtils"; // Adjust paths accordingly
import { userService } from "../services/user.service";
import { transformatiomImageService } from "../services/transofmationImage.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
interface FloatingCameraButtonProps {}

const ImagePickerButton: React.FC<FloatingCameraButtonProps> = ({}) => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;

  const [menuOpen, setMenuOpen] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.parallel([
        Animated.timing(animation1, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animation2, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.parallel([
        Animated.timing(animation1, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animation2, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const pickImage = async (mode: "camera" | "gallery") => {
    setImageUploadLoader(true);

    try {
      // Step 1: Request permission
      const permissionResult =
        mode === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setSnackbarVisible(true);
        setSnackbarMessage(
          mode === "camera"
            ? "Camera permission is required."
            : "Gallery permission is required."
        );
        return;
      }

      let result: ImagePicker.ImagePickerResult;

      // Step 2: Launch based on mode
      if (mode === "camera") {
        const mediaType = await new Promise<"image" | "video">(
          (resolve, reject) => {
            Alert.alert(
              "Select Capture Type",
              "Choose what you want to capture",
              [
                { text: "Photo", onPress: () => resolve("image") },
                { text: "Video", onPress: () => resolve("video") },
                {
                  text: "Cancel",
                  onPress: () => reject("cancel"),
                  style: "cancel",
                },
              ]
            );
          }
        );

        result = await ImagePicker.launchCameraAsync({
          mediaTypes:
            mediaType === "image"
              ? ImagePicker.MediaTypeOptions.Images
              : ImagePicker.MediaTypeOptions.Videos,
          quality: 0.8,
          videoMaxDuration: 60,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const fileUri = asset.uri;
      const type = asset.type; // 'image' or 'video'

      // Step 3: Get Azure credentials
      const storageDetails = await userService.getStorageAccountDetails();
      if (!storageDetails.success) {
        setSnackbarVisible(true);
        setSnackbarMessage("Server error, try again.");
        return;
      }

      const { storageAccountName, sasToken } = storageDetails.data;

      // Step 4: Get user
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userData.exists) {
        setSnackbarVisible(true);
        setSnackbarMessage("User not found.");
        return;
      }

      setMenuOpen(false);

      const userId = userData.data._id;

      // Step 5: Generate file name
      const fileExtension =
        fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const originalFileName =
        fileUri.split("/").pop() || `file-${Date.now()}.${fileExtension}`;
      const fileName = `${userId}_${originalFileName}`;

      // Step 6: Upload to Azure
      const uploadedUrl = await uploadToAzureFromExpo(
        fileUri,
        fileName,
        sasToken,
        storageAccountName,
        "admin-data",
        "transformationImages"
      );

      // Step 7: Save to DB
      const uploadData = [{ url: uploadedUrl }];
      const uploadRes =
        await transformatiomImageService.addTransformationImages(uploadData);

      if (uploadRes?.data) {
        setSnackbarVisible(true);
        setSnackbarMessage(
          type === "video"
            ? "Video uploaded successfully!"
            : "Image uploaded successfully!"
        );
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage("Failed to save file.");
      }
    } catch (err) {
      if (err !== "cancel") {
        console.error(err);
        setSnackbarVisible(true);
        setSnackbarMessage("Upload failed.");
      }
    } finally {
      setImageUploadLoader(false);
    }
  };

  return (
    <>
      {menuOpen && (
        <Animated.View
          style={[
            styles.subButton,
            {
              transform: [
                {
                  translateY: animation1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -80],
                  }),
                },
                {
                  translateX: animation1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => pickImage("gallery")}
            style={styles.iconButton}
          >
            <Ionicons name="document" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {menuOpen && (
        <Animated.View
          style={[
            styles.subButton,
            {
              transform: [
                {
                  translateY: animation2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -90],
                  }),
                },
                {
                  translateX: animation2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => pickImage("camera")}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.floatingButton}
        activeOpacity={0.8}
      >
        {imageUploadLoader ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons
            name={menuOpen ? "close" : "camera"}
            size={30}
            color="#fff"
          />
        )}
      </TouchableOpacity>
    </>
  );
};

export default memo(ImagePickerButton);

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 10,
    right: 20,
    backgroundColor: "#19002E",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 100,
  },
  subButton: {
    position: "absolute",
    bottom: 1,
    right: 5,
    zIndex: 99,
  },
  iconButton: {
    backgroundColor: "#19002E",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
