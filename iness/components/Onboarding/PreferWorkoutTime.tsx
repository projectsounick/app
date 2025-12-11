import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { onboardingPreferredWorkoutTimeOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

//// Main functional component for the PreferredWorkout Time screen--------------------/
const PreferredWorkoutTime = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "preferredWorkoutTime",
    setter: setPreferredWorkoutTime,
  });

  const handleNext = () => {
    if (preferredWorkoutTime.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        preferredWorkoutTime,
      });
      onNext();
    }
  };
  const updateState = (value: string) => {
    setPreferredWorkoutTime(value);
  };

  const isValid = preferredWorkoutTime.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OnboardingHeading
          icon="clock-time-eight-outline"
          subtitle="Choose the time that works best for your schedule"
        >
          When do you{"\n"}prefer to workout?
        </OnboardingHeading>

        {/* Time Cards */}
        <View style={styles.cardsContainer}>
          {onboardingPreferredWorkoutTimeOptions.map((item, index) => (
            <OnboardingCard
              key={item.label}
              index={index}
              option={item.label}
              state={preferredWorkoutTime}
              icon={item.icon}
              description={item.description}
              updateState={updateState}
              height={85}
              fontSize={17}
            />
          ))}
        </View>

        {/* Motivation Box */}
        <View style={styles.motivationBox}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={24}
            color="#9747FF"
          />
          <View style={styles.motivationTextContainer}>
            <Text style={styles.motivationTitle}>Consistency is key! 📅</Text>
            <Text style={styles.motivationText}>
              Working out at the same time daily helps build lasting habits.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Next Button - Always at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!isValid}
          style={[
            styles.nextButton,
            {
              backgroundColor: isValid ? "#67C694" : "#E0E0E0",
            },
          ]}
        >
          <Text
            style={[
              styles.nextButtonText,
              {
                color: isValid ? "#FFFFFF" : "#999",
              },
            ]}
          >
            Continue
          </Text>
          {isValid && (
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  cardsContainer: {
    marginTop: 8,
  },
  motivationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F3EDFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E8E0F5",
  },
  motivationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  motivationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  motivationText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    paddingTop: 16,
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
    fontSize: 16,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
});

export default PreferredWorkoutTime;
