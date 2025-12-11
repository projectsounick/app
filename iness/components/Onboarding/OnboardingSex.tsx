import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
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
import theme from "@/app/Theme/globalTheme";

const { width: screenWidth } = Dimensions.get("window");

const genderOptions = [
  {
    value: "Male",
    icon: "gender-male",
    color: "#4A90D9",
    bgColor: "#E8F4FD",
    description: "I identify as male",
  },
  {
    value: "Female",
    icon: "gender-female",
    color: "#E91E8C",
    bgColor: "#FCE4F0",
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <OnboardingHeading
          icon="gender-male-female"
          subtitle="This helps us personalize your workout and nutrition plans"
        >
          What is your{"\n"}gender?
        </OnboardingHeading>

        {/* Gender Cards */}
        <View style={styles.cardsContainer}>
          {genderOptions.map((option, index) => (
            <GenderCard
              key={option.value}
              option={option}
              isSelected={sex === option.value}
              onSelect={() => setSex(option.value)}
              index={index}
            />
          ))}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-check"
            size={18}
            color="#67C694"
          />
          <Text style={styles.infoText}>
            Your information is private and secure. We use this to calculate
            accurate calorie needs and workout intensity.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!sex}
          style={[
            styles.nextButton,
            {
              backgroundColor: sex ? "#67C694" : "#E0E0E0",
            },
          ]}
        >
          <Text
            style={[styles.nextButtonText, { color: sex ? "#FFFFFF" : "#999" }]}
          >
            Continue
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={sex ? "#FFFFFF" : "#999"}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      <CustomSnackbar
        visible={snackbarVisible}
        bgColor="#FF6B6B"
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );
};

// Gender Card Component
const GenderCard = ({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: (typeof genderOptions)[0];
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale: scaleAnim }],
        opacity,
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.genderCard,
          {
            borderColor: isSelected ? option.color : "#F0F0F0",
            borderWidth: isSelected ? 2 : 1,
            backgroundColor: isSelected ? option.bgColor : "#FFFFFF",
          },
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.genderIconContainer,
            {
              backgroundColor: isSelected ? option.color + "20" : "#F8F8F8",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={option.icon}
            size={40}
            color={isSelected ? option.color : "#888"}
          />
        </View>

        {/* Text */}
        <Text
          style={[
            styles.genderLabel,
            { color: isSelected ? option.color : "#333" },
          ]}
        >
          {option.value}
        </Text>
        <Text style={styles.genderDescription}>{option.description}</Text>

        {/* Selection Circle */}
        <View
          style={[
            styles.selectionCircle,
            {
              backgroundColor: isSelected ? option.color : "transparent",
              borderColor: isSelected ? option.color : "#DDD",
            },
          ]}
        >
          {isSelected && (
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  cardsContainer: {
    marginTop: 10,
  },
  genderCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  genderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  genderDescription: {
    fontSize: 14,
    color: "#888",
    fontFamily: theme.fonts.regular,
  },
  selectionCircle: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    marginLeft: 10,
    lineHeight: 20,
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
    fontSize: 17,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
});

export default OnboardingSex;
