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
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { userService } from "../services/user.service";
import { transformatiomImageService } from "../services/transofmationImage.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import DietPlanBottomSheet from "@/app/Modals/PdfBottomSheet";
import SessionCalendarSheet from "@/app/Modals/SessionCalendarSheet";
import FeedbackModal from "@/app/Modals/SessionFeedbackModal";
import { sessionService } from "../services/sessionService";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { createStreak } from "../services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";

interface FloatingCameraButtonProps {}

const ImagePickerButton: React.FC<FloatingCameraButtonProps> = () => {
  const calendarSheetOpen = useSelector(
    (state: RootState) => state.componentOpen.calendarSheetOpen
  );
  const dispatch = useDispatch();
  const animation = useRef(new Animated.Value(0)).current;
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);

  const [visible, setVisible] = useState(false);
  const onClose = () => setVisible(false);

  const onCloseSessionSheet = () => {
    dispatch(setCalendarSheetOpen(!calendarSheetOpen));
  };

  const [currentSession, setCurrentSession] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const toggleMenu = async () => {
    const response =
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
    if (response.exists) {
      if (menuOpen) {
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setMenuOpen(false));
      } else {
        setMenuOpen(true);
        Animated.timing(animation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    } else {
      Alert.alert(
        "Login Required",
        "You need to log in to access this content.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login",
            onPress: () => userService.logout(),
          },
        ]
      );
    }
  };

  const radius = 120; // distance from center
  const angles = [-90, -135, -45]; // degrees for circular placement
  const subButtons = [
    { icon: "camera", action: () => pickImage("gallery") },
    { icon: "calendar", action: () => dispatch(setCalendarSheetOpen(true)) },
    { icon: "document-text", action: () => openDietPlanModal() },
  ];

  const interpolatePosition = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, radius * Math.cos(angleRad)],
      }),
      y: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, radius * Math.sin(angleRad)],
      }),
      scale: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
  };

  const openDietPlanModal = () => {
    setVisible(true);
    setMenuOpen(false);
  };

  const pickImage = async (mode: "camera" | "gallery") => {
    setImageUploadLoader(true);
    try {
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

      if (Platform.OS === "android") {
        if (mode === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") return;
        } else {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") return;
        }
      }

      const result =
        mode === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes:
                mediaType === "image"
                  ? ImagePicker.MediaTypeOptions.Images
                  : ImagePicker.MediaTypeOptions.Videos,
              quality: 0.8,
              videoMaxDuration: 60,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              quality: 0.8,
            });

      if (result.canceled || !result.assets || result.assets.length === 0)
        return;
      const asset = result.assets[0];
      const fileUri = asset.uri;
      const type = asset.type ?? "image";

      const storageDetails = await userService.getStorageAccountDetails(
        "transformationImages"
      );
      const { storageAccountName, sasToken } = storageDetails.data;

      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      const userId = userData.data._id;

      const fileExtension =
        fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const originalFileName =
        fileUri.split("/").pop() ?? `file-${Date.now()}.${fileExtension}`;
      const fileName = `${userId}_${originalFileName}`;

      const uploadedUrl = await uploadToAzureFromExpo(
        fileUri,
        fileName,
        sasToken,
        storageAccountName,
        "admin-data",
        "transformationImages"
      );

      await transformatiomImageService.addTransformationImages([
        { url: uploadedUrl },
      ]);
      let responseStreak = await createStreak();
      if (responseStreak.success) {
        dispatch(setStreakData(responseStreak.data));
      }
    } catch (err: any) {
      if (err !== "cancel") console.error(err);
    } finally {
      setImageUploadLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      {subButtons.map((btn: any, idx) => {
        const { x, y, scale } = interpolatePosition(angles[idx]);
        return (
          <Animated.View
            key={idx}
            style={[
              styles.subButton,
              { transform: [{ translateX: x }, { translateY: y }, { scale }] },
            ]}
          >
            <TouchableOpacity
              onPress={btn.action}
              style={styles.iconButton}
              activeOpacity={0.8}
            >
              <Ionicons name={btn.icon} size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        {imageUploadLoader ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons
            name={menuOpen ? "close" : "flash-outline"}
            size={26}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      {visible && <DietPlanBottomSheet visible={visible} onClose={onClose} />}
    </View>
  );
};

export default memo(ImagePickerButton);

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end", // bottom center
    alignItems: "center",
    paddingBottom: 0, // distance from bottom
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#67C694",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#67C694",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 100,
  },
  subButton: {
    position: "absolute",
    zIndex: 99,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#67C694",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
