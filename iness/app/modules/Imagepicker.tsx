import React, { memo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadToAzureFromExpo } from "@/utils/azureUtils"; // Adjust paths accordingly
import { userService } from "../services/user.service";
import { transformatiomImageService } from "../services/transofmationImage.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import DietPlanBottomSheet from "./PdfBottomSheet";
import SessionCalendarSheet from "./SessionCalendarSheet";
import FeedbackModal from "../Components/ActivePlans.tsx/SessionFeedbackModal";
import { sessionService } from "../services/sessionService";

interface FloatingCameraButtonProps {}

const ImagePickerButton: React.FC<FloatingCameraButtonProps> = ({}) => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);
  const onClose = () => {
    setVisible(false);
  };
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [sessionSheetVisible, setSessionSheetVisible] = useState(false);
  const onCloseSessionSheet = () => {
    setSessionSheetVisible(false);
  };

  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const openDietPlanModal = () => {
    setVisible(true);
    setMenuOpen(false);
  };
  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(animation1, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(animation1, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };
  const cameraStyle = {
    transform: [
      {
        translateY: animation1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -70],
        }),
      },
    ],
    opacity: animation1,
  };
  const dietPlanStyle = {
    transform: [
      {
        translateY: animation1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -190],
        }),
      },
    ],
    opacity: animation1,
  };
  const sessionSheetStyle = {
    transform: [
      {
        translateY: animation1.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -130],
        }),
      },
    ],
    opacity: animation1,
  };
  const pickImage = async (mode: "camera" | "gallery") => {
    setImageUploadLoader(true);

    try {
      // First show alert to choose image or video
      const mediaType = await new Promise<"image" | "video">(
        (resolve, reject) => {
          Alert.alert("Capture Type", "Choose what you want to capture", [
            { text: "Photo", onPress: () => resolve("image") },
            { text: "Video", onPress: () => resolve("video") },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => reject("cancel"),
            },
          ]);
        }
      );

      // Ask for camera permissions
      // ✅ Request permissions only on Android
      if (Platform.OS === "android") {
        if (mode === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Required",
              "Camera access is needed to take a photo or video."
            );
            return;
          }
        } else {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Permission Required",
              "Gallery access is needed to pick media."
            );
            return;
          }
        }
      }
      let result: ImagePicker.ImagePickerResult;

      // Step 2: Handle camera or gallery
      if (mode === "camera") {
        const mediaType = await new Promise<"image" | "video">(
          (resolve, reject) => {
            Alert.alert("Capture Type", "Choose what you want to capture", [
              { text: "Photo", onPress: () => resolve("image") },
              { text: "Video", onPress: () => resolve("video") },
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => reject("cancel"),
              },
            ]);
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

      // Step 3: Cancel check
      if (result.canceled || !result.assets || result.assets.length === 0)
        return;

      const asset = result.assets[0];
      const fileUri = asset.uri;
      const type = asset.type ?? "image"; // fallback to image

      // Step 4: Get storage credentials
      const storageDetails = await userService.getStorageAccountDetails(
        "transformationImages"
      );

      const { storageAccountName, sasToken } = storageDetails.data;

      // Step 5: Get user
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      setMenuOpen(false);
      const userId = userData.data._id;

      // Step 6: Generate filename
      const fileExtension =
        fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const originalFileName =
        fileUri.split("/").pop() ?? `file-${Date.now()}.${fileExtension}`;
      const fileName = `${userId}_${originalFileName}`;

      // Step 7: Upload to Azure
      const uploadedUrl = await uploadToAzureFromExpo(
        fileUri,
        fileName,
        sasToken,
        storageAccountName,
        "admin-data",
        "transformationImages"
      );

      // Step 8: Save to DB
      const uploadRes =
        await transformatiomImageService.addTransformationImages([
          { url: uploadedUrl },
        ]);

      if (uploadRes?.data) {
      } else {
      }
    } catch (err: any) {
      console.log(err.message);

      if (err !== "cancel") {
        console.error(err);
      }
    } finally {
      setImageUploadLoader(false);
    }
  };
  const submitFeedback = async (feedback: string) => {
    if (!currentSession) return;
    try {
      setFeedbackLoading(true);
      const params = {
        sessionId: currentSession._id,
        data: { sessionFeedback: feedback },
      };
      const response = await sessionService.updateSession(params);
      if (response.success) {
        setCurrentSession({ ...currentSession, sessionFeedback: feedback });
        setShowFeedbackModal(false);
      } else {
        alert("Failed to submit feedback");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setFeedbackLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* Diet Plan Button */}
      {menuOpen && (
        <Animated.View style={[styles.subButton, dietPlanStyle]}>
          <TouchableOpacity
            onPress={() => {
              console.log("called");

              openDietPlanModal();
            }}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {menuOpen && (
        <Animated.View style={[styles.subButton, sessionSheetStyle]}>
          <TouchableOpacity
            onPress={() => setSessionSheetVisible(true)}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
      {/* Camera Button */}
      {menuOpen && (
        <Animated.View style={[styles.subButton, cameraStyle]}>
          <TouchableOpacity
            onPress={() => pickImage("gallery")}
            style={styles.iconButton}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main Floating Button */}
      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.floatingButton}
        activeOpacity={0.8}
      >
        {imageUploadLoader ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons
            name={menuOpen ? "close" : "flash-outline"}
            size={30}
            color="#fff"
          />
        )}
      </TouchableOpacity>
      {visible ? (
        <DietPlanBottomSheet visible={visible} onClose={onClose} />
      ) : null}
      {sessionSheetVisible ? (
        <SessionCalendarSheet
          isVisible={sessionSheetVisible}
          onClose={onCloseSessionSheet}
          setCurrentSession={setCurrentSession}
          currentSession={currentSession}
          setShowFeedbackModal={setShowFeedbackModal}
        />
      ) : null}
      {showFeedbackModal ? (
        <FeedbackModal
          visible={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={submitFeedback}
        />
      ) : null}
    </View>
  );
};

export default memo(ImagePickerButton);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    right: 10,
    alignItems: "center",
  },
  floatingButton: {
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
    bottom: 0,
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
