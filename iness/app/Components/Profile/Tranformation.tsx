import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import theme from "@/app/Theme/globalTheme";
import { useState } from "react";
import TransformationImageModal from "./TransformationModal";
import { router } from "expo-router";
import useGetDataHook from "@/hooks/useFetchHook";
import { transformatiomImageService } from "@/app/services/transofmationImage.service";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";

export default function TransformationCard() {
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
              color="#9747FF"
            />
          </View>
          <Text style={styles.title}>Daily Progress Photos</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
      </View>

      {/* Images Row */}
      {(loading || (data && data.length > 0)) && (
        <View style={styles.imagesSection}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color="#9747FF" size="small" />
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
                            color="#FFFFFF"
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3EDFF",
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
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  imagesSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
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
    backgroundColor: "#F5F5F5",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  moreCount: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
  },
  moreCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9747FF",
    fontFamily: theme.fonts.bold,
  },
});
