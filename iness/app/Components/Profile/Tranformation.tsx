import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { useState } from "react";
import TransformationImageModal from "@/app/Modals/TransformationModal";
import { router } from "expo-router";
import useGetDataHook from "@/hooks/useFetchHook";
import { transformatiomImageService } from "@/app/services/transofmationImage.service";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";

export default function TransformationCard() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [tranformationImageModalVisible, setTransformationImageModalVisible] =
    useState(false);
  const closeTransformationImageModal = () => {
    setTransformationImageModalVisible(false);
  };

  const {
    data,
    loading,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setData,
  } = useGetDataHook(transformatiomImageService.getTransformationImages);

  const totalImages = data
    ? data.flatMap((group: any) => group.images).length
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/dashboard/transformationImage")}
      activeOpacity={0.8}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="image-multiple"
              size={20}
              color={theme.colors.secondPrimary}
            />
          </View>
          <Text style={styles.title}>Daily Progress Photos</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
      </View>

      {/* Images Row */}
      {(loading || (data && data.length > 0)) && (
        <View style={styles.imagesSection}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={theme.colors.secondPrimary} size="small" />
            </View>
          ) : (
            <View style={styles.imagesRow}>
              {data
                .flatMap((group: any) => group.images)
                .slice(0, 5)
                .map((item: any, i: number) => {
                  const isVideo = item.url.endsWith(".mp4");

                  return (
                    <View key={i} style={styles.imageWrapper}>
                      {isVideo ? (
                        <View style={styles.videoPlaceholder}>
                          <Ionicons
                            name="play-circle"
                            size={20}
                            color={theme.colors.textWhite}
                          />
                        </View>
                      ) : (
                        <Image
                          source={{ uri: item.url }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  );
                })}
              {/* Show count if more than 5 */}
              {totalImages > 5 && (
                <View style={styles.moreCount}>
                  <Text style={styles.moreCountText}>+{totalImages - 5}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {tranformationImageModalVisible && (
        <TransformationImageModal
          onClose={closeTransformationImageModal}
          visible={tranformationImageModalVisible}
        />
      )}
      {snackbarVisible && (
        <CustomSnackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
          bgColor={theme.colors.primary}
        />
      )}
    </TouchableOpacity>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.secondPrimary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    }),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  imagesSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  loaderContainer: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  imagesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.border,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  moreCount: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  moreCountText: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
  },
});
