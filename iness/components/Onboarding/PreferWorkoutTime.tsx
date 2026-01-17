import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { onboardingPreferredWorkoutTimeOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const PreferredWorkoutTime = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const theme = useGlobalTheme();
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<string>("");

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "preferredWorkoutTime",
    setter: setPreferredWorkoutTime,
  });

  const handleNext = () => {
    if (preferredWorkoutTime.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({ preferredWorkoutTime });
      onNext();
    }
  };

  const updateState = (value: string) => {
    setPreferredWorkoutTime(value);
  };

  const isValid = preferredWorkoutTime.trim().length > 0;
  const styles = getStyles(theme, isValid);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeading
          icon="clock-time-eight-outline"
          subtitle="Choose the time that works best for your schedule"
        >
          When do you{"\n"}prefer to workout?
        </OnboardingHeading>

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
              height={68}
              fontSize={15}
            />
          ))}
        </View>

        <View style={styles.tipBox}>
          <MaterialCommunityIcons
            name="calendar-check"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.tipText}>
            Working out at the same time daily helps build lasting habits.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!isValid}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={isValid ? "#FFFFFF" : theme.colors.textMuted}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isValid: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
  },
  cardsContainer: {
    marginTop: 8,
  },
  tipBox: {
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
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isValid ? theme.colors.success : theme.colors.lightGrey,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: isValid ? "#FFFFFF" : theme.colors.textMuted,
  },
});

export default PreferredWorkoutTime;
