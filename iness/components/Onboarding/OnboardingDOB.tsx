import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import CustomSnackbar from "@/app/modules/Snackbar";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const OnboardingDOB = ({ onNext }: { onNext: () => void }) => {
  const [dob, setDob] = useState(new Date(1990, 0, 1));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load saved DOB from AsyncStorage
  useEffect(() => {
    const loadSavedDOB = async () => {
      try {
        const userData = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (userData?.exists && userData.data?.dob) {
          const savedDate = new Date(userData.data.dob);
          if (!isNaN(savedDate.getTime())) {
            setDob(savedDate);
          }
        }
      } catch (error) {
        console.log("Error loading DOB:", error);
      }
    };
    loadSavedDOB();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    setDob(date);
    hideDatePicker();
  };

  const handleNext = async () => {
    try {
      setLoading(true);
      await asyncStorageUtils.updateUserDataInAsyncStorage({ dob });
      setLoading(false);
      onNext();
    } catch (error: any) {
      setLoading(false);
      setSnackbarVisible(true);
      setSnackbarMessage(error.message || "Failed to save DOB");
    }
  };

  // Calculate age
  const calculateAge = () => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();
  const formattedDate = dob.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={true}
        >
        {/* Header */}
        <OnboardingHeading
          icon="calendar-heart"
          subtitle="We use your age to customize workout intensity and nutrition plans"
        >
          When were you{"\n"}born?
        </OnboardingHeading>

        {/* Age Display Card */}
        <View style={styles.displayCard}>
          <View style={styles.displayIconContainer}>
            <MaterialCommunityIcons
              name="cake-variant"
              size={20}
              color="#9747FF"
            />
          </View>
          <Text style={styles.displayAge}>{age}</Text>
          <Text style={styles.displayLabel}>Years Old</Text>
        </View>

        {/* Date Picker Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>Date of Birth</Text>
          <TouchableOpacity
            onPress={showDatePicker}
            style={styles.dateButton}
          >
            <View style={styles.dateIconContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color="#9747FF"
              />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.dateHint}>Tap to change</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#9747FF"
            />
          </TouchableOpacity>
        </View>

        {/* Age-based tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={20}
              color="#9747FF"
            />
            <Text style={styles.tipTitle}>Did you know?</Text>
          </View>
          <Text style={styles.tipText}>
            {age < 25
              ? "At your age, your metabolism is at its peak! Great time to build healthy habits."
              : age < 35
                ? "Your body recovers well from workouts. Focus on building strength and endurance."
                : age < 45
                  ? "Consistency is key! Regular exercise helps maintain muscle mass and bone density."
                  : "It's never too late to start! Exercise helps maintain mobility and energy levels."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button - Fixed at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          style={[
            styles.nextButton,
            {
              backgroundColor: "#67C694",
            },
          ]}
        >
          <Text style={styles.nextButtonText}>
            {loading ? "Saving..." : "Continue"}
          </Text>
          {!loading && (
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={dob}
        maximumDate={new Date()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <CustomSnackbar
        visible={snackbarVisible}
        bgColor="#FF6B6B"
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
  },
  displayCard: {
    backgroundColor: "#F3EDFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8E0F5",
    flexDirection: "row",
    justifyContent: "center",
  },
  displayIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  displayAge: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  displayLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontFamily: theme.fonts.regular,
  },
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    fontFamily: theme.fonts.medium,
    marginLeft: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: "#9747FF",
  },
  dateIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  dateHint: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  tipCard: {
    backgroundColor: "#F3EDFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8E0F5",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
    fontFamily: theme.fonts.bold,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: "transparent",
  },
  nextButton: {
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
  },
});

export default OnboardingDOB;
