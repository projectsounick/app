import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { activityLevelOptions } from "@/utils/onboardingStaticValues";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import theme from "@/app/Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");

//// Main functional component for the activityLevel Level screen--------------------/
const ActivityLevel = ({
  onNext,
  onBack,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) => {
  const [activityLevel, setactivityLevel] = useState<string>("");

  /// Custom hook to load data from AsyncStorage-----------------------/
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "activityLevel",
    setter: setactivityLevel,
  });

  const handleNext = () => {
    if (activityLevel.length > 0) {
      asyncStorageUtils.updateUserDataInAsyncStorage({
        activityLevel,
      });
      onNext();
    }
  };
  const updateState = (value: string) => {
    setactivityLevel(value);
  };

  const isValid = activityLevel.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OnboardingHeading
          icon="shoe-sneaker"
          subtitle="This helps us understand your current fitness baseline"
        >
          Typical day{"\n"}for you?
        </OnboardingHeading>

        {/* Activity Cards */}
        <View style={styles.cardsContainer}>
          {activityLevelOptions.map(
            ({ label, icon, description }: any, index) => (
              <OnboardingCard
                key={label}
                index={index}
                option={label}
                state={activityLevel}
                icon={icon}
                description={description}
                updateState={updateState}
                fontSize={Math.max(screenWidth * 0.038, 14)}
                height={Math.min(screenWidth * 0.2, 75)}
              />
            )
          )}
        </View>

        {/* Motivation Box */}
        <View style={styles.motivationBox}>
          <MaterialCommunityIcons
            name="trending-up"
            size={24}
            color="#9747FF"
          />
          <View style={styles.motivationTextContainer}>
            <Text style={styles.motivationTitle}>Start where you are! 🚀</Text>
            <Text style={styles.motivationText}>
              We'll create a plan that matches your current lifestyle and grows with you.
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
            {loading ? <DotLoader /> : "Continue"}
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

export default ActivityLevel;

const DotLoader = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

    createAnimation(dot1, 0);
    createAnimation(dot2, 150);
    createAnimation(dot3, 300);
  }, [dot1, dot2, dot3]);

  const dotStyle = (anim: Animated.Value) => ({
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: "#FFFFFF",
    opacity: anim,
  });

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Animated.View style={dotStyle(dot1)} />
      <Animated.View style={dotStyle(dot2)} />
      <Animated.View style={dotStyle(dot3)} />
    </View>
  );
};
