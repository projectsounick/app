import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
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

function calculateAge(dob: string | Date) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export default function ProfileCard() {
  const [userDetails, setUserDetails] = useState<UserData | null>(null);
  const [imageUploadLoader, setimageUploadLoader] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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
        const storageAccountDetailsResponse =
          await userService.getStorageAccountDetails("MEDIA");

        if (!storageAccountDetailsResponse.success) {
          setSnackbarVisible(true);
          setSnackbarMessage("Server error, try again.");
          return;
        }

        const { storageAccountName, sasToken } =
          storageAccountDetailsResponse.data;

        const fileUri = result.assets[0].uri;
        const originalFileName =
          fileUri.split("/").pop() || `image-${Date.now()}.jpg`;
        const fileName = `${userDetails?._id}_${originalFileName}`;

        const uploadedUrl = await uploadToAzureFromExpo(
          fileUri,
          fileName,
          sasToken,
          storageAccountName,
          "admin-data",
          "MEDIA"
        );

        let updatedUserDataResponse = await userService.updateUser({
          profilePic: uploadedUrl,
        });
        if (updatedUserDataResponse.success) {
          await asyncStorageUtils.updateUserDataInAsyncStorage(
            updatedUserDataResponse.user
          );
          setUserDetails(updatedUserDataResponse.user);
          setSnackbarVisible(true);
          setSnackbarMessage("Image uploaded successfully!");
        } else {
          setSnackbarVisible(true);
          setSnackbarMessage("Some error has happened, try again");
        }
      } catch (err) {
        setSnackbarVisible(true);
        setSnackbarMessage("Some error has happened, try again");
      }
    } catch (err) {
      setSnackbarVisible(true);
      setSnackbarMessage("Some error has happened, try again");
    } finally {
      setimageUploadLoader(false);
    }
  };

  const handleEditUserPage = () => {
    router.push("/dashboard/profileedit");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleEditUserPage}
      activeOpacity={0.8}
    >
      {/* Top Section: Avatar + Info */}
      <View style={styles.topSection}>
        {/* Profile Image */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {imageUploadLoader ? (
            <ActivityIndicator color="#9747FF" />
          ) : (
            <>
              {userDetails?.profilePic ? (
                <Image
                  source={{ uri: userDetails.profilePic }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color="#9747FF" />
                </View>
              )}
            </>
          )}
          {/* Edit Badge */}
          <View style={styles.editBadge}>
            <Feather name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Name, Email & Details */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {userDetails?.name || "Your Name"}
          </Text>
          <Text style={styles.emailText} numberOfLines={1}>
            {userDetails?.email || "email@example.com"}
          </Text>
          {/* Age & Gender Row */}
          <View style={styles.detailsRow}>
            {userDetails?.dob && (
              <Text style={styles.detailText}>
                Age: {calculateAge(userDetails.dob)}
              </Text>
            )}
            {userDetails?.dob && userDetails?.sex && (
              <Text style={styles.separator}>•</Text>
            )}
            {userDetails?.sex && (
              <Text style={styles.detailText}>{userDetails.sex}</Text>
            )}
          </View>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color="#1A1A1A" />
      </View>
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3EDFF",
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 65,
    height: 65,
    borderRadius: 32,
    position: "relative",
  },
  avatarImage: {
    width: 65,
    height: 65,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#F3EDFF",
  },
  avatarPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#E8E0F5",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#9747FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  nameText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  emailText: {
    fontSize: 13,
    color: "#666",
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#888",
    fontFamily: theme.fonts.regular,
  },
  separator: {
    fontSize: 13,
    color: "#CCC",
    marginHorizontal: 8,
  },
});
