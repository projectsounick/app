import React, { useRef, useEffect, useState, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
function FloatingOptions() {
  const scrollRef: any = useRef(null);
  const [index, setIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  const options = [
    {
      icon: <Ionicons name="fitness" size={28} color="#fff" />,
      label: "Do Yoga",
      bg: ["#8E2DE2", "#4A00E0"],
    },
    {
      icon: <MaterialIcons name="fitness-center" size={28} color="#fff" />,
      label: "Weight Train",
      bg: ["#FF416C", "#FF4B2B"],
    },
    {
      icon: <FontAwesome5 name="chalkboard-teacher" size={26} color="#fff" />,
      label: "Offline Class",
      bg: ["#00C9FF", "#92FE9D"],
    },
    {
      icon: <Ionicons name="videocam" size={28} color="#fff" />,
      label: "Online Class",
      bg: ["#f7971e", "#ffd200"],
    },
    {
      icon: <Entypo name="chat" size={28} color="#fff" />,
      label: "Consult",
      bg: ["#fc5c7d", "#6a82fb"],
    },
    {
      icon: <MaterialIcons name="self-improvement" size={28} color="#fff" />,
      label: "Meditate",
      bg: ["#11998e", "#38ef7d"],
    },
  ];

  const loopedOptions = [...options, ...options]; // for infinite scroll

  // auto-scroll animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = prev + 1;
        const scrollToX = nextIndex * 90;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ x: scrollToX, animated: true });
        }

        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        if (nextIndex >= options.length) {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ x: 0, animated: false });
          }, 400);
          return 0;
        }

        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // 🔒 Auth check before navigating
  const handleOptionPress = async (label: string) => {
    try {
      // Only "Consult" needs login check
      if (label === "Consult") {
        const response =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (response.exists) {
          navigation.navigate("supportchat" as never);
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
      } else {
        // Others go directly to train
        navigation.navigate("train" as never);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {loopedOptions.map((item: any, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => handleOptionPress(item.label)}
          >
            <Animated.View
              style={{
                alignItems: "center",
                marginRight: 16,
                width: 80,
                transform: [{ scale: scaleAnim }],
              }}
            >
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
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                {item.icon}
              </LinearGradient>
              <Text
                style={{
                  fontSize: 12,
                  color: "#333",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(FloatingOptions);
