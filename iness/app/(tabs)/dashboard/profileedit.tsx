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

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserData } from "@/app/interfaces/UserInterface";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
import DateTimePickerModal from "react-native-modal-datetime-picker";
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height

const backgroundImage = require("../../../assets/images/basicBackground.jpg");
const labelStyle = {
  color: theme.colors.dark,
  marginBottom: 4,
  fontSize: theme.fontSizes.medium,
};

const inputStyle = {
  backgroundColor: "#fff",
  borderRadius: 6,
  padding: 10,
  color: theme.colors.dark,
  borderWidth: 1,
  borderColor: theme.colors.secondPrimary,
  flex: 1,
};
const commonFieldStyle: any = {
  backgroundColor: theme.colors.cardLight,
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: theme.colors.secondPrimary,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};

// Option imports
import {
  onboardingCommitmentOptions,
  onboardingPreferredWorkoutTimeOptions,
  workoutPreferenceOptions,
  goalOptionsOnboarding,
  activityLevelOptions,
} from "../../../utils/onboardingStaticValues";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import CustomSnackbar from "@/app/modules/Snackbar";
import { SafeAreaView } from "react-native-safe-area-context";

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
}) => (
  <Modal transparent visible={visible} animationType="slide">
    <TouchableOpacity
      onPress={onClose}
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
      }}
      activeOpacity={1}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 16,
          maxHeight: "50%",
        }}
      >
        <ScrollView>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 16 }}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

//// Main functional component for the user data update screen ---------------------------/
export default function EditOnboardingScreen() {
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
          return onboardingCommitmentOptions;
        case "preferredWorkoutTime":
          return onboardingPreferredWorkoutTimeOptions;
        case "workoutPreferences":
          return workoutPreferenceOptions.map((o: any) => o.label);
        case "activityLevel":
          return activityLevelOptions.map((o: any) => o.label);
        default:
          return [];
      }
    };
    if (field === "weight" && editFields[field]) {
      const weightValue = formValues.weight?.replace(/[^0-9.]/g, "") || ""; // Extract number
      const weightUnit = formValues.weight?.includes("lbs") ? "lbs" : "kg"; // Default to kg if not present

      return (
        <View key={field} style={commonFieldStyle}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>{label}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                value={weightValue}
                onChangeText={(text) =>
                  handleChange("weight", `${text}${weightUnit}`)
                }
                keyboardType="numeric"
                style={inputStyle}
              />
              <TouchableOpacity
                onPress={() => {
                  const newUnit = weightUnit === "kg" ? "lbs" : "kg";
                  const numberOnly =
                    formValues.weight?.replace(/[^0-9.]/g, "") || "";
                  handleChange("weight", `${numberOnly}${newUnit}`);
                }}
                style={{
                  marginLeft: 10,
                  backgroundColor: theme.colors.cardLight,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.secondPrimary,
                }}
              >
                <Text>{weightUnit}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => toggleEdit(field)}
            style={{ marginLeft: 10 }}
          >
            <MaterialCommunityIcons
              name="square-edit-outline"
              size={20}
              color={theme.colors.dark}
            />
          </TouchableOpacity>
        </View>
      );
    }
    if (field === "dob") {
      return (
        <View key={field} style={commonFieldStyle}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>{label}</Text>

            <TouchableOpacity
              onPress={() => setDobPickerVisible(true)}
              style={{
                ...inputStyle,
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.colors.dark }}>
                {formValues.dob
                  ? new Date(formValues.dob).toLocaleDateString()
                  : "Select Date of Birth"}
              </Text>
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
          </View>

          <TouchableOpacity
            onPress={() => toggleEdit(field)}
            style={{ marginLeft: 10 }}
          >
            <MaterialCommunityIcons
              name="square-edit-outline"
              size={20}
              color={theme.colors.dark}
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (field === "height" && editFields[field]) {
      return (
        <View key={field} style={commonFieldStyle}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>{label}</Text>
            <TextInput
              value={formValues[field] || ""}
              onChangeText={(text) => handleChange(field, text)}
              placeholder="e.g. 170cm or 5'6"
              style={inputStyle}
            />
          </View>
          <TouchableOpacity
            onPress={() => toggleEdit(field)}
            style={{ marginLeft: 10 }}
          >
            <MaterialCommunityIcons
              name="square-edit-outline"
              size={20}
              color={theme.colors.dark}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        key={field}
        style={{
          backgroundColor: theme.colors.cardLight,
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: theme.colors.secondPrimary,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.dark,
              marginBottom: 4,
              fontSize: theme.fontSizes.medium,
            }}
          >
            {label === "Sex" ? "Gender" : label}
          </Text>
          {editFields[field] ? (
            isTextInput ? (
              <TextInput
                value={formValues[field] || ""}
                onChangeText={(text) => handleChange(field, text)}
                style={{
                  backgroundColor: "#fff", // white or light background for form feel
                  borderRadius: 6,
                  padding: 10,
                  color: theme.colors.dark,
                  borderWidth: 1,
                  borderColor: theme.colors.secondPrimary, // consistent with your app theme
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => setDropdownVisible(field)}
                  style={{
                    backgroundColor: theme.colors.cardLight,
                    borderRadius: 6,
                    padding: 10,
                  }}
                >
                  <Text style={{ color: theme.colors.dark }}>
                    {formValues[field] || "Select an option"}
                  </Text>
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
                color: theme.colors.dark,
                fontSize: 16,
                fontFamily: theme.fonts.medium,
              }}
            >
              {formValues[field] || "--"}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => toggleEdit(field)}
          style={{ marginLeft: 10 }}
        >
          <MaterialCommunityIcons
            name="square-edit-outline"
            size={20}
            color={theme.colors.dark}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
        <View
          style={{
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Profile Details" />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
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

          <View style={{ marginTop: 30, alignItems: "center" }}>
            <AnimatedSubmitButton
              loading={loading}
              onPress={handleUpdate}
              title="Update"
              height={50}
            />
          </View>
        </ScrollView>
        <CustomSnackbar
          onDismiss={() => setSnackbarVisible(false)}
          visible={snackbarVisible}
          message={snackbarMessage}
          bgColor={theme.colors.primary}
        />
      </ImageBackground>
    </View>
  );
}
