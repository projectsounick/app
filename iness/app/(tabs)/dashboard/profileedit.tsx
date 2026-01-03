import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { UserData } from "@/app/interfaces/UserInterface";
import NormalHeader from "@/app/modules/NormalHeader";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { SafeAreaView } from "react-native-safe-area-context";
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height

const backgroundImage = require("../../../assets/images/basicBackground.jpg");

// Option imports
import {
  onboardingCommitmentOptions,
  onboardingPreferredWorkoutTimeOptions,
  workoutPreferenceOptions,
  goalOptionsOnboarding,
  activityLevelOptions,
} from "../../../utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

// Custom dropdown modal
const DropdownModal = ({
  visible,
  onClose,
  options,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (option: string) => void;
}) => {
  const theme = useGlobalTheme();
  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: theme.colors.overlay,
          justifyContent: "flex-end",
        }}
        activeOpacity={1}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "50%",
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.colors.border,
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                style={{
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    color: theme.colors.text,
                    fontWeight: theme.fontWeights.medium as "500",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

//// Main functional component for the user data update screen ---------------------------/
export default function EditOnboardingScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [editFields, setEditFields] = useState<{ [key: string]: boolean }>({});
  const [formValues, setFormValues] = useState<any>({});
  const [originalValues, setOriginalValues] = useState<Partial<UserData>>({});
  const [dropdownVisible, setDropdownVisible] = useState<keyof UserData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [dobPickerVisible, setDobPickerVisible] = useState(false);

  //// Function for fetching the user data from the asyncstroage ---------------------------/
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (storedUser.exists) {
        setFormValues(storedUser.data);
        setOriginalValues(storedUser.data); // save original for diff
      }
    };
    fetchUserData();
  }, []);

  const toggleEdit = (field: keyof UserData) => {
    setEditFields((prev) => {
      const isNowEditing = !prev[field];

      // If it's a select-type field and it's becoming editable, show the dropdown immediately
      const selectFields: (keyof UserData)[] = [
        "sex",
        "goal",
        "timeCommitment",
        "preferredWorkoutTime",
        "workoutPreferences",
        "activityLevel",
      ];

      if (isNowEditing && selectFields.includes(field)) {
        setDropdownVisible(field);
      }

      return { ...prev, [field]: isNowEditing };
    });
  };

  const handleChange = (field: keyof UserData, value: string) => {
    setFormValues((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleUpdate = async () => {
    try {
      setLoading(true);

      // Get only the fields that have changed
      const updatedFields: any = {};
      for (const key in formValues) {
        const field = key as keyof UserData;
        if (formValues[field] !== originalValues[field]) {
          updatedFields[field] = formValues[field];
        }
      }

      if (Object.keys(updatedFields).length === 0) {
        setSnackbarMessage("No changes to update.");
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }

      // Update the user via your service
      let response = await userService.updateUser(updatedFields);
      if (response.success) {
        /// update the data in the async stroage --------/
        await asyncStorageUtils.updateUserDataInAsyncStorage(response.user);
        setSnackbarMessage("Profile updated successfully.");
        setSnackbarVisible(true);
        setOriginalValues({ ...formValues }); // update original to match changes
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage("Unable to update your data, try again");
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      setSnackbarMessage("Failed to update profile. Please try again.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const renderEditableField = (label: string, field: keyof UserData) => {
    const isTextInput = field === "name";

    const getOptions = () => {
      switch (field) {
        case "sex":
          return ["Male", "Female", "Other"];
        case "goal":
          return goalOptionsOnboarding.map((o: any) => o.label);
        case "timeCommitment":
          return onboardingCommitmentOptions.map((o: any) => o.label);
        case "preferredWorkoutTime":
          return onboardingPreferredWorkoutTimeOptions.map((o: any) => o.label);
        case "workoutPreferences":
          return workoutPreferenceOptions.map((o: any) => o.label);
        case "activityLevel":
          return activityLevelOptions.map((o: any) => o.label);
        default:
          return [];
      }
    };
    if (field === "weight") {
      const weightValue = formValues.weight?.replace(/[^0-9.]/g, "") || ""; // Extract number
      const weightUnit = formValues.weight?.includes("lbs") ? "lbs" : "kg"; // Default to kg if not present

      return (
        <View
          key={field}
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.regular,
                fontWeight: theme.fontWeights.medium as "500",
              }}
            >
              {label}
            </Text>
            <TouchableOpacity
              onPress={() => toggleEdit(field)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.lightGrey,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={editFields[field] ? "checkmark" : "pencil"}
                size={18}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          {editFields[field] ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TextInput
                value={weightValue}
                onChangeText={(text) =>
                  handleChange("weight", `${text}${weightUnit}`)
                }
                keyboardType="numeric"
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.darkGrey,
                  borderRadius: 12,
                  padding: 14,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  fontSize: theme.fontSizes.regular,
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  const newUnit = weightUnit === "kg" ? "lbs" : "kg";
                  const numberOnly =
                    formValues.weight?.replace(/[^0-9.]/g, "") || "";
                  handleChange("weight", `${numberOnly}${newUnit}`);
                }}
                style={{
                  backgroundColor: theme.colors.success,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  minWidth: 60,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontWeight: theme.fontWeights.medium as "500",
                    fontSize: theme.fontSizes.regularSmall,
                  }}
                >
                  {weightUnit}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.regular,
                lineHeight: 22,
              }}
            >
              {formValues.weight || "--"}
            </Text>
          )}
        </View>
      );
    }
    if (field === "dob") {
      return (
        <View
          key={field}
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.regular,
                fontWeight: theme.fontWeights.medium as "500",
              }}
            >
              {label}
            </Text>
            <TouchableOpacity
              onPress={() => toggleEdit(field)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.lightGrey,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={editFields[field] ? "checkmark" : "pencil"}
                size={18}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          {editFields[field] ? (
            <>
              <TouchableOpacity
                onPress={() => setDobPickerVisible(true)}
                style={{
                  backgroundColor: theme.colors.darkGrey,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: formValues.dob ? theme.colors.text : theme.colors.textMuted,
                    fontSize: theme.fontSizes.regular,
                  }}
                >
                  {formValues.dob
                    ? new Date(formValues.dob).toLocaleDateString()
                    : "Select Date of Birth"}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={dobPickerVisible}
                mode="date"
                date={
                  formValues.dob
                    ? new Date(formValues.dob)
                    : new Date("2000-01-01")
                }
                maximumDate={new Date()} // restrict future DOBs
                onConfirm={(date) => {
                  const isoDate = date.toISOString().split("T")[0]; // format YYYY-MM-DD
                  handleChange("dob", isoDate);
                  setDobPickerVisible(false);
                }}
                onCancel={() => setDobPickerVisible(false)}
              />
            </>
          ) : (
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.regular,
                lineHeight: 22,
              }}
            >
              {formValues.dob
                ? new Date(formValues.dob).toLocaleDateString()
                : "--"}
            </Text>
          )}
        </View>
      );
    }

    if (field === "height") {
      return (
        <View
          key={field}
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: theme.fontSizes.regular,
                fontWeight: theme.fontWeights.medium as "500",
              }}
            >
              {label}
            </Text>
            <TouchableOpacity
              onPress={() => toggleEdit(field)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.lightGrey,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={editFields[field] ? "checkmark" : "pencil"}
                size={18}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          </View>
          {editFields[field] ? (
            <TextInput
              value={formValues[field] || ""}
              onChangeText={(text) => handleChange(field, text)}
              placeholder="e.g. 170cm or 5'6"
              placeholderTextColor={theme.colors.textMuted}
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                padding: 14,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                fontSize: theme.fontSizes.regular,
              }}
            />
          ) : (
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.regular,
                lineHeight: 22,
              }}
            >
              {formValues[field] || "--"}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View
        key={field}
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.regular,
              fontWeight: theme.fontWeights.medium as "500",
            }}
          >
            {label === "Sex" ? "Gender" : label}
          </Text>
          <TouchableOpacity
            onPress={() => toggleEdit(field)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={editFields[field] ? "checkmark" : "pencil"}
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        {editFields[field] ? (
          isTextInput ? (
            <TextInput
              value={formValues[field] || ""}
              onChangeText={(text) => handleChange(field, text)}
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 12,
                padding: 14,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                fontSize: theme.fontSizes.regular,
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setDropdownVisible(field)}
                style={{
                  backgroundColor: theme.colors.darkGrey,
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: formValues[field] ? theme.colors.text : theme.colors.textMuted,
                    fontSize: theme.fontSizes.regular,
                  }}
                >
                  {formValues[field] || "Select an option"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
              </TouchableOpacity>

              <DropdownModal
                visible={dropdownVisible === field}
                onClose={() => setDropdownVisible(null)}
                options={getOptions()}
                onSelect={(option) => handleChange(field, option)}
              />
            </>
          )
        ) : (
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.regular,
              lineHeight: 22,
            }}
          >
            {formValues[field] || "--"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ImageBackground
        source={backgroundImage}
        style={{ flex: 1 }}
        resizeMode="cover"
        imageStyle={{ opacity: isDark ? 0.3 : 1 }}
      >
        {isDark && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.background,
              opacity: 0.9,
            }}
          />
        )}
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Profile Details" />
          </View>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 40,
            }}
          >
            {renderEditableField("Name", "name")}
            {renderEditableField("Sex", "sex")}
            {renderEditableField("Weight", "weight")}
            {renderEditableField("Height", "height")}
            {renderEditableField("Date of Birth", "dob")}

            {renderEditableField("Primary Goal", "goal")}
            {renderEditableField("Time Commitment", "timeCommitment")}
            {renderEditableField(
              "Preferred Workout Time",
              "preferredWorkoutTime"
            )}
            {renderEditableField("Workout Preferences", "workoutPreferences")}
            {renderEditableField("Activity Level", "activityLevel")}

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={loading}
              style={{
                backgroundColor: theme.colors.success,
                borderRadius: 30,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.bold as "700",
                  }}
                >
                  Update Profile
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          <CustomSnackbar
            onDismiss={() => setSnackbarVisible(false)}
            visible={snackbarVisible}
            message={snackbarMessage}
            bgColor={theme.colors.success}
          />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
