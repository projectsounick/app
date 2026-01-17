import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { onboardingCommitmentOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const OnboardingtimeCommitment = ({
  onNext,
  onBack,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) => {
  const theme = useGlobalTheme();
  const [timeCommitment, setTimeCommitment] = useState<string>("");

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "timeCommitment",
    setter: setTimeCommitment,
  });

  const handleNext = () => {
    if (timeCommitment.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({ timeCommitment });
      onNext();
    }
  };

  const updateState = (value: string) => {
    setTimeCommitment(value);
  };

  const isValid = timeCommitment.trim().length > 0;
  const styles = getStyles(theme, isValid, loading);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeading
          icon="clock-time-four-outline"
          subtitle="How much time can you dedicate to working out each day?"
        >
          Daily commitment{"\n"}to fitness?
        </OnboardingHeading>

        <View style={styles.cardsContainer}>
          {onboardingCommitmentOptions.map((item, index) => (
            <OnboardingCard
              key={item.label}
              index={index}
              option={item.label}
              state={timeCommitment}
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
            name="timer-outline"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.tipText}>
            Even short workouts can make a big difference when done consistently.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading || !isValid}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {loading ? "Loading..." : "Continue"}
          </Text>
          {!loading && (
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={isValid ? "#FFFFFF" : theme.colors.textMuted}
              style={{ marginLeft: 8 }}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isValid: boolean, loading: boolean) => StyleSheet.create({
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
    backgroundColor: loading || !isValid ? theme.colors.lightGrey : theme.colors.success,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: loading || !isValid ? theme.colors.textMuted : "#FFFFFF",
  },
});

export default OnboardingtimeCommitment;
