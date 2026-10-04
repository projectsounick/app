import { safeRouter } from "@/src/utils/safeRouter";
import React, { memo, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import eventBus from "@/event";
import { useGlobalTheme } from "../Theme/ThemeContext";
import { useDashboardActivity } from "@/src/Components/Home/DashboardActivityContext";

function QuickAccessOption({
  item,
  onPress,
  theme,
  itemWidth,
  reduceMotion,
}: {
  item: any;
  onPress: () => void;
  theme: any;
  itemWidth: number;
  reduceMotion: boolean;
}) {
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const animateTo = (toValue: number) => {
    if (reduceMotion) {
      scaleAnim.setValue(toValue === 1 ? 1 : 0.98);
      return;
    }
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => animateTo(0.9)}
      onPressOut={() => animateTo(1)}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityHint="Opens this quick access option"
    >
      <View style={{ alignItems: "center", marginRight: 12, width: itemWidth }}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={item.bg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 6,
              shadowColor: item.bg[0],
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
              borderWidth: 2,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            {item.icon}
          </LinearGradient>
        </Animated.View>
        <Text
          style={{
            fontSize: theme.fontSizes.small,
            color: theme.colors.text,
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FloatingOptions() {
  const theme = useGlobalTheme();
  const { reduceMotion } = useDashboardActivity();
  const { width } = useWindowDimensions();
  const itemWidth = width >= 768 ? 104 : Math.min(Math.max(width / 4.6, 72), 88);

  const options = useMemo(() => [
    {
      icon: <MaterialIcons name="self-improvement" size={32} color="#fff" />,
      label: "Meditate",
      bg: ["#4FC3F7", "#29B6F6"],
    },
    {
      icon: <Ionicons name="fitness" size={32} color="#fff" />,
      label: "Do Yoga",
      bg: ["#9747FF", "#7B2CBF"],
    },
   
    {
      icon: <FontAwesome5 name="chalkboard-teacher" size={30} color="#fff" />,
      label: "Offline Class",
      bg: ["#67C694", "#4CAF50"],
    
    },
    {
      icon: <Ionicons name="videocam" size={32} color="#fff" />,
      label: "Online Class",
      bg: ["#9747FF", "#7B2CBF"],
    },
    {
      icon: <MaterialIcons name="fitness-center" size={32} color="#fff" />,
      label: "Weight Train",
      bg: ["#4FC3F7", "#29B6F6"],
    },
    {
      icon: <Entypo name="chat" size={32} color="#fff" />,
      label: "Consult",
      bg: ["#67C694", "#4CAF50"],
    },
  ], []);

  // Map button labels to plan types and service filters
  const getPlanTypeForLabel = (label: string): string | null => {
    const mapping: Record<string, string> = {
      "Do Yoga": "Yoga",
      "Weight Train": "Weight Training",
    };
    return mapping[label] || null;
  };

  
  

  // 🔒 Auth check before navigating
  const handleOptionPress = async (label: string) => {
    try {
      // Meditation goes to meditation page
      if (label === "Meditate") {
        safeRouter.navigate("/dashboard/meditation");
        return;
      }
      
      // Only "Consult" needs login check
      if (label === "Consult") {
        const response =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (response.exists) {
          safeRouter.navigate("/dashboard/supportchat");
        } else {
          Alert.alert(
            "Login Required",
            "You need to log in to access this content.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Login",
                onPress: () => userService.logout(),
              },
            ]
          );
        }
        return;
      }

      // Handle Yoga and Weight Train - navigate to train and let it check after data loads
      const planType = getPlanTypeForLabel(label);
      if (planType) {
        // Navigate to train screen first
        const navigationStarted = safeRouter.navigate(
          "/(tabs)/dashboard/tabs/train"
        );
        if (!navigationStarted) return;
        // Wait longer to ensure train screen is mounted and data fetch has started
        setTimeout(() => {
          eventBus.emit("check-and-navigate", {
            type: "plan-or-service",
            planType: planType,
            action: "yoga-or-weight-train",
          });
        }, 800);
        return;
      }

      // Handle Online Class and Offline Class - navigate to train and let it check after data loads
      if (label === "Online Class" || label === "Offline Class") {
        const isOnline = label === "Online Class";
        // Navigate to train screen first
        const navigationStarted = safeRouter.navigate(
          "/(tabs)/dashboard/tabs/train"
        );
        if (!navigationStarted) return;
        // Wait longer to ensure train screen is mounted and data fetch has started
        setTimeout(() => {
          eventBus.emit("check-and-navigate", {
            type: "service",
            serviceType: isOnline ? "online" : "offline",
            action: "online-or-offline-class",
          });
        }, 800);
        return;
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingVertical: 16,
        marginBottom: 16,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      {/* Header Section */}
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <View
            style={{
              width: 4,
              height: 20,
              backgroundColor: theme.colors.secondPrimary,
              borderRadius: 2,
              marginRight: 10,
            }}
          />
          <Text
            style={{
              fontSize: theme.fontSizes.large,
              fontWeight: theme.fontWeights.bold as "700",
              color: theme.colors.text,
              letterSpacing: 0.3,
            }}
          >
            Quick Access
          </Text>
        </View>
        <Text
          style={{
            fontSize: theme.fontSizes.regularSmall,
            color: theme.colors.textMuted,
            fontWeight: "400",
            marginLeft: 14,
            letterSpacing: 0.2,
          }}
        >
          Tap to explore your fitness options
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
        }}
      >
        {options.map((item: any) => (
          <QuickAccessOption
            key={item.label}
            item={item}
            theme={theme}
            itemWidth={itemWidth}
            reduceMotion={reduceMotion}
            onPress={() => handleOptionPress(item.label)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(FloatingOptions);
