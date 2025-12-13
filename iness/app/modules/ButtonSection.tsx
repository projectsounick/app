import React, { memo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, router } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function FloatingOptions() {
  const navigation = useNavigation();
  
  // Calculate to show partial view of last item
  // Each item: 80px width + 16px margin = 96px
  // Show ~3.5 items initially (3 full + 0.5 peek)
  const itemTotalWidth = 80 + 16; // width + marginRight
  const visibleItems = 3.5;
  const containerPadding = 16;

  const options = [
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
      icon: <MaterialIcons name="fitness-center" size={32} color="#fff" />,
      label: "Weight Train",
      bg: ["#67C694", "#4CAF50"],
    },
    {
      icon: <FontAwesome5 name="chalkboard-teacher" size={30} color="#fff" />,
      label: "Offline Class",
      bg: ["#4FC3F7", "#29B6F6"],
    },
    {
      icon: <Ionicons name="videocam" size={32} color="#fff" />,
      label: "Online Class",
      bg: ["#9747FF", "#7B2CBF"],
    },
    {
      icon: <Entypo name="chat" size={32} color="#fff" />,
      label: "Consult",
      bg: ["#67C694", "#4CAF50"],
    },
  ];

  // 🔒 Auth check before navigating
  const handleOptionPress = async (label: string) => {
    try {
      // Meditation goes to meditation page
      if (label === "Meditate") {
        router.push("/dashboard/meditation");
        return;
      }
      
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
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F5F5F5",
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
              backgroundColor: "#9747FF",
              borderRadius: 2,
              marginRight: 10,
            }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: "#1A1A1A",
              letterSpacing: 0.3,
            }}
          >
            Quick Access
          </Text>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: "#888",
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
          paddingLeft: containerPadding,
          paddingRight: SCREEN_WIDTH - (visibleItems * itemTotalWidth) - containerPadding,
        }}
      >
        {options.map((item: any, i) => {
          const scaleAnim = useRef(new Animated.Value(1)).current;
          
          const handlePressIn = () => {
            Animated.spring(scaleAnim, {
              toValue: 0.9,
              useNativeDriver: true,
              tension: 300,
              friction: 10,
            }).start();
          };
          
          const handlePressOut = () => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 300,
              friction: 10,
            }).start();
          };
          
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={1}
              onPress={() => handleOptionPress(item.label)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <View
                style={{
                  alignItems: "center",
                  marginRight: 16,
                  width: 80,
                }}
              >
                <Animated.View
                  style={{
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
                    fontSize: 12,
                    color: "#333",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default memo(FloatingOptions);
