import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  Dimensions,
  ImageBackground,
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
import { formatDateTime } from "@/utils/otherUtils";
import ImageViewerModal from "@/app/modules/ImageModel";

///// Main functional component for uploading the User transformation images -------/
export default function TransformationImage() {
  ///// Custom hook for fetching the images ----------/
  const {
    data,
    loading,
    error,
    fetchData,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
    setData,
  } = useGetDataHook(transformatiomImageService.getTransformationImages);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUploadLoader, setImageUploadLoader] = useState(false);

  //// Funciton for upload the image --------------------------------------/
  const pickImage = async () => {
    setImageUploadLoader(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      // ✅ Get Azure SAS token and account details
      const storageAccountDetailsResponse =
        await userService.getStorageAccountDetails();

      if (!storageAccountDetailsResponse.success) {
        setSnackbarVisible(true);
        setSnackbarMessage("Server error, try again.");
        return;
      }

      const { storageAccountName, sasToken } =
        storageAccountDetailsResponse.data;
      const userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
        "user"
      );
      if (userData.exists) {
        let userId = userData.data._id;
        // ✅ Prepare image file
        const fileUri = result.assets[0].uri;
        // ✅ Assign userId to the fileName
        const originalFileName =
          fileUri.split("/").pop() || `image-${Date.now()}.jpg`;
        const fileName = `${userId}_${originalFileName}`; // e.g., "61234abc_image.jpg"

        // ✅ Upload to Azure
        const uploadedUrl = await uploadToAzureFromExpo(
          fileUri,
          fileName,
          sasToken,
          storageAccountName,
          "admin-data", // Container name
          "transformationImages" // Folder name
        );

        const currentDateTime = new Date().toLocaleString();

        const data = [
          {
            url: uploadedUrl,
            date: currentDateTime,
          },
        ];

        // ✅ Send to backend
        let imageUploadInDbResponse =
          await transformatiomImageService.addTransformationImages(data);
        if (imageUploadInDbResponse && imageUploadInDbResponse.data) {
          const newImages = imageUploadInDbResponse.data; // [{ url, date }]

          // 🟩 Update the local state using the response from the server
          setData((prev: any) => [...prev, ...newImages]);

          setSnackbarVisible(true);
          setSnackbarMessage("Image uploaded successfully!");
        } else {
          setSnackbarVisible(true);
          setSnackbarMessage("Some error has happened , try again");
        }
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage("Some error has happened , try again");
      }
    } catch (err) {
      setSnackbarVisible(true);
      setSnackbarMessage("Failed to upload image.");
      console.error(err);
    } finally {
      setImageUploadLoader(false);
    }
  };

  const openModal = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const screenWidth = Dimensions.get("window").width;
  const imageSize = (screenWidth - 48) / 3; // 16 padding + 8 gap * 2

  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpeg")} // ✅ replace with your background
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View
        style={{
          flex: 1,

          justifyContent: "space-between",
        }}
      >
        <View style={{ paddingTop: 20, paddingLeft: 20 }}>
          <NormalHeader screenName="Transformation" />
        </View>
        {loading ? (
          <View
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator color={theme.colors.secondPrimary} />{" "}
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(_, index) => index.toString()}
            numColumns={3}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            columnWrapperStyle={{
              justifyContent: "space-between",
              marginBottom: 12,
            }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.normal,
                  marginTop: 20,
                  fontSize: 16,
                }}
              >
                No images uploaded yet
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => openModal(item.url)}
                style={{ width: imageSize }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.cardLight,
                    borderRadius: 10,
                    padding: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: "100%",
                      height: imageSize - 30,
                      borderRadius: 8,
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: theme.colors.dark,
                      textAlign: "center",
                    }}
                  >
                    {formatDateTime(item.date)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Upload Button */}
        <AnimatedSubmitButton
          loading={imageUploadLoader}
          onPress={pickImage}
          title="Upload Image"
        />

        {/* Full Image Modal */}
        <ImageViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          imageUrl={selectedImage}
        />
      </View>
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
        bgColor={theme.colors.primary}
      />
    </ImageBackground>
  );
}
