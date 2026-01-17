import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import OnboardingHeading from "@/app/modules/OnboardingHeading";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

const genderOptions = [
  {
    value: "Male",
    icon: "gender-male",
    description: "I identify as male",
  },
  {
    value: "Female",
    icon: "gender-female",
    description: "I identify as female",
  },
];

const OnboardingSex = ({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const theme = useGlobalTheme();
  const [sex, setSex] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "sex",
    setter: setSex,
  });

  const handleNext = () => {
    try {
      if (sex) {
        asyncStorageUtils.updateUserDataInAsyncStorage({ sex });
        onNext();
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    }
  };

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeading
          icon="gender-male-female"
          subtitle="This helps us personalize your workout and nutrition plans"
        >
          What is your{"\n"}gender?
        </OnboardingHeading>

        <View style={styles.cardsContainer}>
          {genderOptions.map((option, index) => (
            <GenderCard
              key={option.value}
              option={option}
              isSelected={sex === option.value}
              onSelect={() => setSex(option.value)}
              index={index}
              theme={theme}
            />
          ))}
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-check"
            size={18}
            color={theme.colors.success}
          />
          <Text style={styles.infoText}>
            Your information is private and secure. We use this to calculate
            accurate calorie needs and workout intensity.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!sex}
          style={[
            styles.nextButton,
            { backgroundColor: sex ? theme.colors.success : theme.colors.lightGrey },
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, { color: sex ? "#FFFFFF" : theme.colors.textMuted }]}>
            Continue
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={sex ? "#FFFFFF" : theme.colors.textMuted}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      <CustomSnackbar
        visible={snackbarVisible}
        bgColor={theme.colors.error}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

const GenderCard = ({
  option,
  isSelected,
  onSelect,
  index,
  theme,
}: {
  option: (typeof genderOptions)[0];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  theme: any;
}) => {
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const cardStyles = getCardStyles(theme, isSelected);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale: scaleAnim }],
        opacity,
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={cardStyles.card}
      >
        <View style={cardStyles.iconContainer}>
          <MaterialCommunityIcons
            name={option.icon}
            size={24}
            color={isSelected ? theme.colors.success : theme.colors.textSecondary}
          />
        </View>

        <View style={cardStyles.textContainer}>
          <Text style={cardStyles.label}>{option.value}</Text>
          <Text style={cardStyles.description}>{option.description}</Text>
        </View>

        <View style={cardStyles.checkContainer}>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  cardsContainer: {
    marginTop: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.greenLight,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
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
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
  },
});

const getCardStyles = (theme: any, isSelected: boolean) => StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isSelected ? theme.colors.greenLight : theme.colors.background,
    borderWidth: 2,
    borderColor: isSelected ? theme.colors.success : theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: isSelected ? `${theme.colors.success}20` : theme.colors.backgroundSecondary,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginLeft: 12,
    backgroundColor: isSelected ? theme.colors.success : "transparent",
    borderColor: isSelected ? theme.colors.success : theme.colors.border,
  },
});

export default OnboardingSex;
