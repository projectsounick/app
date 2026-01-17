import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import OnboardingCard from "@/app/modules/OnboardingCard";
import { activityLevelOptions } from "@/utils/onboardingStaticValues";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const ActivityLevel = ({
  onNext,
  onBack,
  loading,
}: {
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) => {
  const theme = useGlobalTheme();
  const [activityLevel, setactivityLevel] = useState<string>("");

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "activityLevel",
    setter: setactivityLevel,
  });

  const handleNext = () => {
    if (activityLevel.length > 0) {
      asyncStorageUtils.updateUserDataInAsyncStorage({ activityLevel });
      onNext();
    }
  };

  const updateState = (value: string) => {
    setactivityLevel(value);
  };

  const isValid = activityLevel.length > 0;
  const styles = getStyles(theme, isValid, loading);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeading
          icon="shoe-sneaker"
          subtitle="This helps us understand your current fitness baseline"
        >
          Typical day{"\n"}for you?
        </OnboardingHeading>

        <View style={styles.cardsContainer}>
          {activityLevelOptions.map(({ label, icon, description }: any, index) => (
            <OnboardingCard
              key={label}
              index={index}
              option={label}
              state={activityLevel}
              icon={icon}
              description={description}
              updateState={updateState}
              height={68}
              fontSize={15}
            />
          ))}
        </View>

        <View style={styles.tipBox}>
          <MaterialCommunityIcons
            name="trending-up"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.tipText}>
            We'll create a plan that matches your current lifestyle and grows with you.
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
            {loading ? <DotLoader theme={theme} /> : "Complete Setup"}
          </Text>
          {!loading && (
            <MaterialCommunityIcons
              name="check"
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

export default ActivityLevel;

const DotLoader = ({ theme }: { theme: any }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

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
            toValue: 0.3,
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
