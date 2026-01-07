import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import NormalHeader from "@/app/modules/NormalHeader";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import useGetDataHook from "@/hooks/useFetchHook";
import { transformatiomImageService } from "@/app/services/transofmationImage.service";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";
import { userService } from "@/app/services/user.service";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { SafeAreaView } from "react-native-safe-area-context";
import ImageViewerModal from "@/app/Modals/ImageViewerModal";
import VideoViewerModal from "@/app/Modals/VideoViewerModal";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ProgressShimmer from "@/app/modules/Shimmer/ProgressShimmer";
const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

// Format date like "06 Jul 2025"
const formatDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TransformationImage() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const {
    data,
    loading,
    fetchData,
    snackbarVisible,
    setSnackbarVisible,
    snackbarMessage,
    setSnackbarMessage,
  } = useGetDataHook(transformatiomImageService.getTransformationImages);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const imageSize = (screenWidth - 64) / 3;

  const openModal = (url: string, type: "image" | "video") => {
    setSelectedMedia({ url, type });
    setModalVisible(true);
  };

  const normalizeData = (raw: any[]) => {
    return raw.map((group) => ({
      title: group.date,
      data: group.images,
    }));
  };

  const pickImage = async (mode: "camera" | "gallery") => {
    try {
      setImageUploadLoader(true);
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
      if (!storageDetails.success) {
        setSnackbarVisible(true);
        setSnackbarMessage("Server error, try again.");
        return;
      }

      const { storageAccountName, sasToken } = storageDetails.data;

      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userData.exists) {
        setSnackbarVisible(true);
        setSnackbarMessage("User not found.");
        return;
      }

      const userId = userData.data._id;

      const ext =
        fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
      const fileName = `${userId}_${Date.now()}.${ext}`;

      const uploadedUrl = await uploadToAzureFromExpo(
        fileUri,
        fileName,
        sasToken,
        storageAccountName,
        "admin-data",
        "transformationImages"
      );

      const uploadData = [{ url: uploadedUrl }];

      const uploadRes =
        await transformatiomImageService.addTransformationImages(uploadData);

      if (uploadRes && uploadRes.data) {
        setSnackbarVisible(true);
        setSnackbarMessage("Upload successful!");
        fetchData();
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage("Failed to save media.");
      }
    } catch (err) {
      console.error(err);
      setSnackbarVisible(true);
      setSnackbarMessage("Upload failed.");
    } finally {
      setImageUploadLoader(false);
    }
  };

  // Count total media
  const totalMedia = data?.reduce(
    (acc: number, group: any) => acc + (group.images?.length || 0),
    0
  ) || 0;

  const styles = getStyles(theme, isDark);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={[ "left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
          <NormalHeader screenName="Photos" />
        </View>

        <View style={styles.contentContainer}>
          {loading ? (
            <ProgressShimmer />
          ) : (
            <SectionList
              sections={normalizeData(data || [])}
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={styles.listContainer}
              ListHeaderComponent={
                <>
                  {/* Info Card */}
                  <View style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons
                        name="image-multiple"
                        size={22}
                        color={theme.colors.secondPrimary}
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoTitle}>
                        Your Transformation Journey
                      </Text>
                      <Text style={styles.infoSubtitle}>
                        Track your progress by uploading photos & videos regularly
                      </Text>
                    </View>
                  </View>

                  {/* Stats Row */}
                  {totalMedia > 0 && (
                    <View style={styles.statsCard}>
                      <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                          <MaterialCommunityIcons
                            name="folder-image"
                            size={18}
                            color={theme.colors.secondPrimary}
                          />
                        </View>
                        <Text style={styles.statValue}>{totalMedia}</Text>
                        <Text style={styles.statLabel}>Total Media</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                          <MaterialCommunityIcons
                            name="calendar-check"
                            size={18}
                            color={theme.colors.secondPrimary}
                          />
                        </View>
                        <Text style={styles.statValue}>{data?.length || 0}</Text>
                        <Text style={styles.statLabel}>Days Tracked</Text>
                      </View>
                    </View>
                  )}
                </>
              }
              ListEmptyComponent={
                <View style={styles.emptyStateCard}>
                  <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons
                      name="camera-plus-outline"
                      size={40}
                      color={theme.colors.secondPrimary}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No Photos Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Start capturing your transformation journey by uploading your
                    first photo or video
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => pickImage("gallery")}
                  >
                    <MaterialCommunityIcons
                      name="upload"
                      size={18}
                      color={theme.colors.textWhite}
                    />
                    <Text style={styles.emptyButtonText}>Upload Now</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={() => null}
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <View style={styles.dateContainer}>
                    <View style={styles.dateIconContainer}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={14}
                        color={theme.colors.secondPrimary}
                      />
                    </View>
                    <Text style={styles.dateText}>
                      {formatDateDisplay(section.title)}
                    </Text>
                  </View>
                  <View style={styles.dateLine} />
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{section.data.length}</Text>
                  </View>
                </View>
              )}
              renderSectionFooter={({ section }) => (
                <View style={styles.mediaContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.mediaScrollContainer}
                  >
                    {section.data.map((item: any, index: number) => {
                      const isVideo = item.url.endsWith(".mp4");
                      return (
                        <TouchableOpacity
                          key={`img-${index}`}
                          onPress={() =>
                            openModal(item.url, isVideo ? "video" : "image")
                          }
                          style={[styles.mediaCard, { width: imageSize }]}
                          activeOpacity={0.8}
                        >
                          {isVideo ? (
                            <View
                              style={[
                                styles.videoPlaceholder,
                                { height: imageSize },
                              ]}
                            >
                              <View style={styles.playButtonContainer}>
                                <Ionicons
                                  name="play"
                                  size={24}
                                  color={theme.colors.textWhite}
                                />
                              </View>
                              <View style={styles.videoBadge}>
                                <MaterialCommunityIcons
                                  name="video"
                                  size={10}
                                  color={theme.colors.textWhite}
                                />
                                <Text style={styles.videoBadgeText}>Video</Text>
                              </View>
                            </View>
                          ) : (
                            <View style={{ position: "relative" }}>
                              <Image
                                source={{ uri: item.url }}
                                style={[styles.mediaImage, { height: imageSize }]}
                              />
                              <View style={styles.imageBadge}>
                                <MaterialCommunityIcons
                                  name="image"
                                  size={10}
                                  color={theme.colors.textWhite}
                                />
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            />
          )}
        </View>

        {/* White Bottom Sheet with Upload Button */}
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => pickImage("gallery")}
            disabled={imageUploadLoader}
            activeOpacity={0.8}
          >
            {imageUploadLoader ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={22}
                  color="#fff"
                />
                <Text style={styles.uploadButtonText}>Upload Media</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Media viewer modals */}
        {selectedMedia?.type === "image" && (
          <ImageViewerModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            imageUrl={selectedMedia.url}
          />
        )}

        {selectedMedia?.type === "video" && (
          <VideoViewerModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            videoUrl={selectedMedia.url}
          />
        )}

        <CustomSnackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
          bgColor={theme.colors.success}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  headerContainer: {
    paddingTop: 20,
    paddingLeft: 20,
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  // Info Card
  infoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    lineHeight: 18,
  },
  // Stats Card
  statsCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  statLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  // Empty State
  emptyStateCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: theme.colors.success,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    ...(isDark ? {} : {
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  emptyButtonText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    marginLeft: 8,
  },
  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    }),
  },
  dateIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  dateText: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: 12,
  },
  countBadge: {
    backgroundColor: theme.colors.backgroundCardLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countText: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
  },
  // Media Container
  mediaContainer: {
    marginBottom: 16,
  },
  mediaScrollContainer: {
    paddingRight: 16,
  },
  mediaCard: {
    marginRight: 12,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: theme.colors.background,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  mediaImage: {
    width: "100%",
    borderRadius: 14,
  },
  imageBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 6,
  },
  videoPlaceholder: {
    width: "100%",
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(151, 71, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(151, 71, 255, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  videoBadgeText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.small,
    fontWeight: "600",
    marginLeft: 4,
  },
  // White Bottom Sheet
  bottomSheet: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  uploadButton: {
    backgroundColor: theme.colors.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 30,
    ...(isDark ? {} : {
      shadowColor: theme.colors.success,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  uploadButtonText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
    fontFamily: theme.fonts.bold,
    marginLeft: 10,
  },
});
