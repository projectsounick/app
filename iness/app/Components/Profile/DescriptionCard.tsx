import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
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

  const styles = getStyles(theme, isDark);
  
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
            <ActivityIndicator color={theme.colors.secondPrimary} />
          ) : (
            <>
              {userDetails?.profilePic ? (
                <Image
                  source={{ uri: userDetails.profilePic }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color={theme.colors.secondPrimary} />
                </View>
              )}
            </>
          )}
          {/* Edit Badge */}
          <View style={styles.editBadge}>
            <Feather name="camera" size={12} color={theme.colors.textWhite} />
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
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
      </View>
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
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    }),
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
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.textWhite,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  nameText: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  emailText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  detailText: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  separator: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textLight,
    marginHorizontal: 8,
  },
});
