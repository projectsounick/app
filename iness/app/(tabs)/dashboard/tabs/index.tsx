import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SliderCard from "@/app/modules/SliderCard";
import BannerCard from "@/app/modules/BannerCard";
import FeatureCarousel from "@/app/modules/FeatureCarousel";
import { bookSessionCardData, trackingCardData } from "@/utils/ModuletaticData";
import { router } from "expo-router";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import theme from "@/app/Theme/globalTheme";

const HEADER_HEIGHT = 180;

//// Main functional component for the Dashboard screen ---------------------------------/
const YourComponent = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -80],
    extrapolate: "clamp",
  });

  ///// Useeffect funciton for fetching
  useEffect(() => {
    async function fetchData() {
      //// Getting data from the async storage -----------/
      const response = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
        "user"
      );
      if (response.exists) {
        const userData = response.data;
        setUserData(userData);
      }
    }
    fetchData();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Animated Header */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          backgroundColor: "#6C1B9B",
          paddingHorizontal: 20,
          paddingTop: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          zIndex: 10,
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        {/* Top Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Profile */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={{
                width: 35,
                height: 35,
                borderRadius: 35,
                backgroundColor: theme.colors.cardLight,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => router.push("/dashboard/profile")}
            >
              {userData?.profilePic ? (
                <Image
                  source={{ uri: userData.profilePic }}
                  style={{ width: 30, height: 30, borderRadius: 20 }}
                />
              ) : (
                <Ionicons name="person" size={25} color={theme.colors.text} />
              )}
            </TouchableOpacity>
            <Text style={{ color: "#fff", marginLeft: 8 }}>↑ 79 kgs</Text>
          </View>

          {/* Icons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => router.push("/dashboard/cart")}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/notification")}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            marginTop: 8,
          }}
        >
          Namaste {userData?.name?.split(" ")[0]}! 🙏
        </Text>
        <Text style={{ color: "white" }}>
          Get ready to crush your fitness goals today.
        </Text>

        {/* Progress Bars
        <View style={{ marginTop: 12 }}>
          {[
            { label: "6h/10h", value: 0.6 },
            { label: "2gls/10gls", value: 0.2 },
            { label: "2k/10k", value: 0.2 },
          ].map((item, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View
                style={{ height: 6, backgroundColor: "#fff3", borderRadius: 4 }}
              >
                <View
                  style={{
                    width: `${item.value * 100}%`,
                    height: 6,
                    backgroundColor: index === 2 ? "#FFDC5E" : "#00D1FF",
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View> */}

        {/* Bottom Button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "4%",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#4A2A75",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              borderColor: "#A4FF55",
              borderWidth: 1,
            }}
            onPress={() => router.push("/dashboard/supportchat")}
          >
            <Text style={{ color: "#A4FF55" }}>💬 Chat with us</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 20, // Reserve space under the header
          paddingBottom: 10,
          paddingHorizontal: 16, // ✅ Add horizontal spacing here
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true, // Required for better performance with transform/opacity
          }
        )}
        scrollEventThrottle={16}
      >
        <SliderCard />
        <BannerCard cardData={bookSessionCardData} />
        <BannerCard cardData={trackingCardData} />
        <FeatureCarousel />
      </Animated.ScrollView>
    </View>
  );
};

export default YourComponent;
