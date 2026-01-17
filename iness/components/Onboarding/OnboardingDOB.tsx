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
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const OnboardingDOB = ({ onNext }: { onNext: () => void }) => {
  const theme = useGlobalTheme();
  const [dob, setDob] = useState(new Date(1990, 0, 1));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeading
          icon="calendar-heart"
          subtitle="We use your age to customize workout intensity and nutrition plans"
        >
          When were you{"\n"}born?
        </OnboardingHeading>

        {/* Age Display Card */}
        <View style={styles.displayCard}>
          <MaterialCommunityIcons
            name="cake-variant"
            size={20}
            color={theme.colors.success}
          />
          <Text style={styles.displayAge}>{age}</Text>
          <Text style={styles.displayLabel}>Years Old</Text>
        </View>

        {/* Date Picker Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>Date of Birth</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
            <View style={styles.dateIconContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={theme.colors.success}
              />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.dateHint}>Tap to change</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={theme.colors.success}
            />
          </TouchableOpacity>
        </View>

        {/* Age-based tip */}
        <View style={styles.tipCard}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.tipText}>
            {age < 25
              ? "At your age, your metabolism is at its peak! Great time to build healthy habits."
              : age < 35
                ? "Your body recovers well from workouts. Focus on building strength and endurance."
                : age < 45
                  ? "Consistency is key! Regular exercise helps maintain muscle mass."
                  : "It's never too late! Exercise helps maintain mobility and energy."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          style={styles.nextButton}
          activeOpacity={0.8}
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
        bgColor={theme.colors.error}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
  },
  displayCard: {
    backgroundColor: theme.colors.greenLight,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  displayAge: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginLeft: 12,
  },
  displayLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginLeft: 8,
    fontFamily: theme.fonts.regular,
  },
  dateCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    fontFamily: theme.fonts.medium,
    marginLeft: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.greenLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: theme.colors.success,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${theme.colors.success}20`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  dateHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.greenLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
    marginLeft: 12,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: theme.colors.success,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
  },
});

export default OnboardingDOB;
