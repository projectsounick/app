import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SectionList,
  Dimensions,
  ImageBackground,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import theme from "@/app/Theme/globalTheme";
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
import ImageViewerModal from "@/app/modules/ImageModel";
import VideoViewerModal from "@/app/modules/VideoViewerModal";
import { Ionicons } from "@expo/vector-icons";

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
  const imageSize = (screenWidth - 48) / 3;

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

  const pickImage = async () => {
    setImageUploadLoader(true);

    // Ask for permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need permission to access your media library to upload images or videos.",
        [{ text: "OK" }]
      );
      setImageUploadLoader(false);
      return;
    }

    // Launch the picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (result.canceled) {
      setImageUploadLoader(false);
      return;
    }

    try {
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
      const asset = result.assets[0];
      const fileUri = asset.uri;
      const type = asset.type;
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ paddingTop: 20, paddingLeft: 20 }}>
          <NormalHeader screenName="Photos" />
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator color={theme.colors.secondPrimary} />
          </View>
        ) : (
          <SectionList
            sections={normalizeData(data || [])}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No images/videos uploaded yet
              </Text>
            }
            renderItem={() => null}
            renderSectionHeader={({ section }) => (
              <View style={{ marginBottom: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: theme.colors.dark,
                      marginRight: 10,
                    }}
                  >
                    {formatDateDisplay(section.title)}
                  </Text>
                  <View
                    style={{ flex: 1, height: 1, backgroundColor: "#ccc" }}
                  />
                </View>
              </View>
            )}
            renderSectionFooter={({ section }) => (
              <View style={{ position: "relative", marginBottom: 16 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 40 }}
                >
                  {section.data.map((item: any, index: number) => {
                    const isVideo = item.url.endsWith(".mp4");
                    return (
                      <TouchableOpacity
                        key={`img-${index}`}
                        onPress={() =>
                          openModal(item.url, isVideo ? "video" : "image")
                        }
                        style={{
                          width: imageSize,
                          marginRight: 12,
                          backgroundColor: theme.colors.cardLight,
                          padding: 6,
                          borderRadius: 10,
                        }}
                      >
                        {isVideo ? (
                          <View
                            style={{
                              width: "100%",
                              height: imageSize - 20,
                              backgroundColor: "#000",
                              borderRadius: 8,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="play-circle-outline"
                              size={36}
                              color="#fff"
                            />
                          </View>
                        ) : (
                          <Image
                            source={{ uri: item.url }}
                            style={{
                              width: "100%",
                              height: imageSize - 20,
                              borderRadius: 8,
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    width: 40,
                    backgroundColor: "rgba(255,255,255,0)",
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.cardLight,
                      opacity: 0.3,
                    }}
                  />
                </View>

                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={20}
                  color={theme.colors.dark}
                  style={{
                    position: "absolute",
                    right: 6,
                    bottom: 6,
                    opacity: 0.6,
                  }}
                />
              </View>
            )}
          />
        )}

        <AnimatedSubmitButton
          loading={imageUploadLoader}
          onPress={pickImage}
          title="Upload Media"
        />

        {/* ✅ Media viewer modals */}
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
          bgColor={theme.colors.primary}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}
