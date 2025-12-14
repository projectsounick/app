import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { onboardingCommitmentOptions } from "@/utils/onboardingStaticValues";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { UserData } from "@/app/interfaces/UserInterface";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");

//// Main functional component for the Onboarding timeCommitment screen--------------------/
const OnboardingtimeCommitment = ({
  onNext,
  onBack,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) => {
  const [timeCommitment, setTimeCommitment] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "timeCommitment",
    setter: setTimeCommitment,
  });

  const handleNext = () => {
    if (timeCommitment.trim()) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        timeCommitment,
      });
      onNext();
    }
  };
  const updateState = (value: string) => {
    setTimeCommitment(value);
  };

  const isValid = timeCommitment.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OnboardingHeading
          icon="clock-time-four-outline"
          subtitle="How much time can you dedicate to working out each day?"
        >
          Daily commitment{"\n"}to fitness?
        </OnboardingHeading>

        {/* Commitment Cards */}
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
              height={Math.min(screenWidth * 0.2, 75)}
              fontSize={Math.max(screenWidth * 0.04, 15)}
            />
          ))}
        </View>

        {/* Motivation Box */}
        <View style={styles.motivationBox}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={24}
            color="#9747FF"
          />
          <View style={styles.motivationTextContainer}>
            <Text style={styles.motivationTitle}>Every minute counts! ⏱️</Text>
            <Text style={styles.motivationText}>
              Even short workouts can make a big difference when done consistently.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Next Button - Always at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={loading || !isValid}
          style={[
            styles.nextButton,
            {
              backgroundColor: loading || !isValid ? "#E0E0E0" : "#67C694",
            },
          ]}
        >
          <Text
            style={[
              styles.nextButtonText,
              {
                color: loading || !isValid ? "#999" : "#FFFFFF",
              },
            ]}
          >
            {loading ? "Loading..." : "Continue"}
          </Text>
          {!loading && isValid && (
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

export default OnboardingtimeCommitment;
