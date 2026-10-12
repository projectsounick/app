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
import MealLogFlowModal from "@/src/Modals/MealLogFlowModal";
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
  const [mediaActionModalVisible, setMediaActionModalVisible] = useState(false);
  const [mealLogModalVisible, setMealLogModalVisible] = useState(false);

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
    {
      key: "media",
      icon: "camera",
      label: "Log meal or upload media",
      action: () => {
        closeMenu();
        setMediaActionModalVisible(true);
      },
    },
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

      {/* Media Chooser Modal: AI Meal Log vs Transformation Upload */}
      <Modal
        visible={mediaActionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMediaActionModalVisible(false)}
        accessibilityViewIsModal
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.captureBackdrop}
          onPress={() => setMediaActionModalVisible(false)}
        >
          <View style={styles.captureSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.cleanDragHandle} />
            <View style={styles.captureHeader}>
              <Text style={styles.captureHeaderTitle}>Choose Action</Text>
              <TouchableOpacity
                onPress={() => setMediaActionModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.captureButtons}>
              {/* Option 1: AI Meal Log */}
              <TouchableOpacity
                style={styles.cleanOptionCard}
                activeOpacity={0.7}
                onPress={() => {
                  setMediaActionModalVisible(false);
                  setMealLogModalVisible(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Log meal with AI"
              >
                <View
                  style={[
                    styles.cleanOptionIconBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(151,71,255,0.18)"
                        : "rgba(151,71,255,0.1)",
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={20} color="#9747FF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cleanOptionTitle}>Log Meal with AI</Text>
                  <Text style={styles.cleanOptionSub}>
                    Scan plate or label for calories & macros
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              {/* Option 2: Transformation Media */}
              <TouchableOpacity
                style={styles.cleanOptionCard}
                activeOpacity={0.7}
                onPress={() => {
                  setMediaActionModalVisible(false);
                  pickImage("gallery");
                }}
                accessibilityRole="button"
                accessibilityLabel="Upload transformation progress media"
              >
                <View
                  style={[
                    styles.cleanOptionIconBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <Ionicons name="images-outline" size={20} color={theme.colors.text} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cleanOptionTitle}>Transformation Media</Text>
                  <Text style={styles.cleanOptionSub}>
                    Upload physique photos or progress video
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* AI Meal Log Flow Modal */}
      <MealLogFlowModal
        visible={mealLogModalVisible}
        onClose={() => setMealLogModalVisible(false)}
      />

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
            <View style={styles.cleanDragHandle} />
            <View style={styles.captureHeader}>
              <Text style={styles.captureHeaderTitle}>Capture Type</Text>
              <TouchableOpacity
                onPress={cancelCaptureType}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.captureButtons}>
              <TouchableOpacity
                style={styles.cleanOptionCard}
                activeOpacity={0.7}
                onPress={() => resolveCaptureType("image")}
                accessibilityRole="button"
                accessibilityLabel="Choose photo"
              >
                <View
                  style={[
                    styles.cleanOptionIconBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(151,71,255,0.18)"
                        : "rgba(151,71,255,0.1)",
                    },
                  ]}
                >
                  <Ionicons name="image" size={20} color="#9747FF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cleanOptionTitle}>Photo</Text>
                  <Text style={styles.cleanOptionSub}>Take or upload a still picture</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cleanOptionCard}
                activeOpacity={0.7}
                onPress={() => resolveCaptureType("video")}
                accessibilityRole="button"
                accessibilityLabel="Choose video"
              >
                <View
                  style={[
                    styles.cleanOptionIconBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <Ionicons name="videocam-outline" size={20} color={theme.colors.text} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cleanOptionTitle}>Video</Text>
                  <Text style={styles.cleanOptionSub}>Record or upload a short clip</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
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
  cleanDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginBottom: 12,
  },
  captureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  captureHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  captureButtons: {
    gap: 10 as any,
  },
  cleanOptionCard: {
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cleanOptionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cleanOptionTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  cleanOptionSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
