import React, { memo, useCallback, useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Text,
  Modal,
  Alert,
  AccessibilityInfo,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { userService } from "../services/user.service";
import { transformatiomImageService } from "../services/transofmationImage.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import DietPlanBottomSheet from "@/src/Modals/PdfBottomSheet";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { useDispatch } from "react-redux";
import { createStreak } from "../services/streaks.service";
import { setStreakData } from "@/Slices/streakSlice";
import { useTheme } from "../Theme/ThemeContext";
import { runSingleAction } from "@/src/utils/safeAction";

type CaptureRequest = {
  resolve: (value: "image" | "video") => void;
  reject: (reason?: unknown) => void;
};

const ImagePickerButton: React.FC = () => {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDark), [theme, isDark]);
  const dispatch = useDispatch();
  const [animation] = useState(() => new Animated.Value(0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);
  const [captureTypeVisible, setCaptureTypeVisible] = useState(false);
  const [captureRequest, setCaptureRequest] = useState<CaptureRequest | null>(null);

  const [visible, setVisible] = useState(false);
  const onClose = () => setVisible(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    animation.stopAnimation();
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    animation.stopAnimation();
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const toggleMenu = useCallback(() => {
    runSingleAction("dashboard-floating-menu", async () => {
      const response =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (response.exists) {
        if (menuOpen) {
          closeMenu();
        } else {
          openMenu();
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
    });
  }, [closeMenu, menuOpen, openMenu]);

  const radius = 120; // distance from center
  const angles = [-90, -135, -45]; // degrees for circular placement

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
    closeMenu();
    setVisible(true);
  };

  const resolveCaptureType = useCallback((mediaType: "image" | "video") => {
    const resolve = captureRequest?.resolve;
    setCaptureRequest(null);
    setCaptureTypeVisible(false);
    resolve?.(mediaType);
  }, [captureRequest]);

  const cancelCaptureType = useCallback(() => {
    const reject = captureRequest?.reject;
    setCaptureRequest(null);
    setCaptureTypeVisible(false);
    reject?.("cancel");
  }, [captureRequest]);

  const pickImage = async (mode: "camera" | "gallery") => {
    closeMenu();
    setImageUploadLoader(true);
    try {
      const mediaType = await new Promise<"image" | "video">((resolve, reject) => {
        setCaptureRequest({ resolve, reject });
        setCaptureTypeVisible(true);
      });

      if (Platform.OS === "android") {
        if (mode === "camera") {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert(
              "Camera permission required",
              "Allow camera access to capture transformation photos or videos."
            );
            return;
          }
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
              mediaTypes:
                mediaType === "image"
                  ? ImagePicker.MediaTypeOptions.Images
                  : ImagePicker.MediaTypeOptions.Videos,
              quality: 0.8,
            });

      if (result.canceled || !result.assets || result.assets.length === 0)
        return;
      const asset = result.assets[0];
      const fileUri = asset.uri;
      const type = asset.type ?? "image";

      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userData.exists || !userData.data?._id) {
        throw new Error("User not found");
      }
      const userId = userData.data._id;

      const fileExtension =
        fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const originalFileName =
        fileUri.split("/").pop() ?? `file-${Date.now()}.${fileExtension}`;
      const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const fileName = `${userId}_${Date.now()}_${safeFileName}`;
      const storageDetails = await userService.getStorageAccountDetails(
        "transformationImages",
        fileName
      );
      if (
        !storageDetails?.success ||
        !storageDetails?.data?.storageAccountName ||
        !storageDetails?.data?.sasToken
      ) {
        throw new Error("Unable to prepare the media upload");
      }
      const { storageAccountName, sasToken } = storageDetails.data;

      const uploadedUrl = await uploadToAzureFromExpo(
        fileUri,
        fileName,
        sasToken,
        storageAccountName,
        "admin-data",
        "transformationImages"
      );

      const uploadResponse =
        await transformatiomImageService.addTransformationImages([
        { url: uploadedUrl },
      ]);
      if (!uploadResponse?.success) {
        throw new Error(uploadResponse?.message || "Unable to save the media");
      }
      AccessibilityInfo.announceForAccessibility("Transformation media uploaded successfully");
      let responseStreak = await createStreak();
      if (responseStreak.success) {
        dispatch(setStreakData(responseStreak.data));
      }
    } catch (err: any) {
      if (err !== "cancel") {
        console.error(err);
        Alert.alert(
          "Upload failed",
          err?.message || "Unable to upload the media. Please try again."
        );
      }
    } finally {
      setImageUploadLoader(false);
    }
  };

  const subButtons = [
    { key: "media", icon: "images", label: "Add transformation media", action: () => pickImage("gallery") },
    {
      key: "calendar",
      icon: "calendar",
      label: "Open session calendar",
      action: () => {
        closeMenu();
        dispatch(setCalendarSheetOpen(true));
      },
    },
    { key: "diet-plan", icon: "document-text", label: "Open diet plan", action: openDietPlanModal },
  ];

  return (
    <View style={styles.container}>
      {subButtons.map((btn: any, idx) => {
        const { x, y, scale } = interpolatePosition(angles[idx]);
        return (
          <Animated.View
            key={btn.key}
            style={[
              styles.subButton,
              { transform: [{ translateX: x }, { translateY: y }, { scale }] },
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                runSingleAction("dashboard-shortcut", async () => {
                  await btn.action();
                })
              }
              style={styles.iconButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={btn.label}
            >
              <Ionicons name={btn.icon} size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={toggleMenu}
        disabled={imageUploadLoader}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={menuOpen ? "Close dashboard shortcuts" : "Open dashboard shortcuts"}
        accessibilityHint="Shows transformation media, session calendar, and diet plan actions"
        accessibilityState={{ disabled: imageUploadLoader, expanded: menuOpen, busy: imageUploadLoader }}
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

      <Modal
        visible={captureTypeVisible}
        transparent
        animationType="slide"
        onRequestClose={cancelCaptureType}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.captureBackdrop}
          onPress={cancelCaptureType}
        >
          <View style={styles.captureSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.captureAccent} />
            <View style={styles.captureHeader}>
              <Ionicons name="camera" size={18} color={theme.colors.text} />
              <Text style={styles.captureHeaderTitle}>Capture Type</Text>
            </View>
            <Text style={styles.captureSubtitle}>
              Choose what you want to capture
            </Text>

            <View style={styles.captureButtons}>
              <TouchableOpacity
                style={styles.capturePrimary}
                activeOpacity={0.85}
                onPress={() => resolveCaptureType("image")}
                accessibilityRole="button"
                accessibilityLabel="Choose photo"
              >
                <Ionicons name="image" size={18} color={theme.colors.textWhite} />
                <Text style={styles.capturePrimaryText}>Photo</Text>
                <View style={styles.capturePrimaryLabel}>
                  <Ionicons name="sparkles" size={14} color={theme.colors.textWhite} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureSecondary}
                activeOpacity={0.85}
                onPress={() => resolveCaptureType("video")}
                accessibilityRole="button"
                accessibilityLabel="Choose video"
              >
                <Ionicons name="videocam" size={18} color={theme.colors.text} />
                <Text style={styles.captureSecondaryText}>Video</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.captureCancel}
              activeOpacity={0.85}
              onPress={cancelCaptureType}
              accessibilityRole="button"
              accessibilityLabel="Cancel media selection"
            >
              <Ionicons name="close" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.captureCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default memo(ImagePickerButton);

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    justifyContent: "flex-end", // bottom center
    alignItems: "center",
    paddingBottom: 0, // distance from bottom
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.success,
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
    backgroundColor: theme.colors.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  captureBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  captureSheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark
      ? {}
      : {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 12,
        }),
  },
  captureAccent: {
    height: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.secondPrimary,
    marginBottom: 14,
  },
  captureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8 as any,
  },
  captureHeaderTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
  },
  captureSubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  captureButtons: {
    gap: 10 as any,
  },
  capturePrimary: {
    backgroundColor: theme.colors.success,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
  },
  capturePrimaryText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
    marginLeft: 8,
    flex: 1,
  },
  capturePrimaryLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  captureSecondary: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  captureSecondaryText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    marginLeft: 8,
  },
  captureCancel: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  captureCancelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    marginLeft: 6,
  },
});
