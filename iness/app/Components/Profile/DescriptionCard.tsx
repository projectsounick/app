import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import theme from "@/app/Theme/globalTheme";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";

import { UserData } from "@/app/interfaces/UserInterface";
import { ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";

//// Main function for the profile card ----------------------------------------------------/

export default function ProfileCard() {
  const [userDetails, setUserDetails] = useState<UserData | null>(null);
  const [imageUploadLoader, setimageUploadLoader] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  /////Async funciton for updating the userdata with the asyncstroage user data -------------/
  useEffect(() => {
    fetchLocalUser();
    async function fetchLocalUser() {
      const userResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userResponse.exists) {
        setUserDetails(userResponse.data);
      }
    }
  });

  const pickImage = async () => {
    try {
      setimageUploadLoader(true);
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

        const fileUri = result.assets[0].uri;
        // ✅ Assign userId to the fileName
        const originalFileName =
          fileUri.split("/").pop() || `image-${Date.now()}.jpg`;
        const fileName = `${userDetails?._id}_${originalFileName}`; // e.g., "61234abc_image.jpg"

        // ✅ Upload to Azure
        const uploadedUrl = await uploadToAzureFromExpo(
          fileUri,
          fileName,
          sasToken,
          storageAccountName,
          "admin-data", // Container name
          "MEDIA" // Folder name
        );

        const currentDateTime = new Date().toLocaleString();

        const data = [
          {
            url: uploadedUrl,
            date: currentDateTime,
          },
        ];

        // ✅ Send to backend
        let updatedUserDataResponse = await userService.updateUser({
          profilePic: uploadedUrl,
        });
        if (updatedUserDataResponse.success) {
          //// Profile pic has been updated now we have to update the asyncstroage with that
          /// and we will upload this local state also
          await asyncStorageUtils.updateUserDataInAsyncStorage(
            updatedUserDataResponse.user
          );

          setUserDetails(updatedUserDataResponse.user);

          setSnackbarVisible(true);
          setSnackbarMessage("Image uploaded successfully!");
        } else {
          setSnackbarVisible(true);
          setSnackbarMessage("Some error has happened , try again");
        }

        // Your Azure upload logic can be placed here if needed
      } catch (err) {
        setSnackbarVisible(true);
        setSnackbarMessage("Some error has happened , try again");
      }
    } catch (err) {
      setSnackbarVisible(true);
      setSnackbarMessage("Some error has happend,try again");
    } finally {
      setimageUploadLoader(false);
    }
  };

  const handleEditUserPage = () => {
    console.log("called");

    router.push("/dashboard/profileedit");
  };
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.secondPrimary,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
      }}
      onPress={handleEditUserPage}
    >
      {/* Top Row: Image + Arrow */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: theme.colors.cardLight,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {imageUploadLoader ? (
            <View>
              <ActivityIndicator />
            </View>
          ) : (
            <>
              {userDetails?.profilePic ? (
                <Image
                  source={{ uri: userDetails.profilePic }}
                  style={{ height: 70, width: 70, borderRadius: 35 }}
                />
              ) : (
                <Ionicons name="person" size={40} color={theme.colors.text} />
              )}
            </>
          )}

          <TouchableOpacity
            onPress={pickImage}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              backgroundColor: theme.colors.dark,
              borderRadius: 12,
              padding: 2,
            }}
          >
            <Feather name="edit-3" size={14} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.dark} />
      </View>

      {/* Info Section */}
      <View style={{ marginTop: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {userDetails?.name}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 14 }}>
            {userDetails?.phoneNumber}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: theme.colors.text, fontSize: 14 }}>
            Age: 28
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 14 }}>
            Sex: {userDetails?.sex}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
