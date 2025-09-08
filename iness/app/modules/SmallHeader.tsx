import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import eventBus from "@/event";
import { getStoredNotifications } from "@/utils/notificationUtils";

const { height } = Dimensions.get("window");
const topPadding = height * 0.03;
export default function SmallHeader({
  title,
  weightShow = true,
  bottomComponent,
}: {
  title?: string;
  weightShow?: boolean;
  bottomComponent?: React.ReactNode;
}) {
  /// Getting the stored cart data for the ------------------/
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [weight, setWeight] = useState(null);
  const [notificationResponseLength, setNotificationResponseLength] =
    useState(0);
  useEffect(() => {
    const isMounted = { current: true };

    async function getLoggedUser() {
      const user =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (user.exists && isMounted.current) {
        setProfilePic(user.data.profilePic);
        setWeight(user.data.weight);
      }
    }

    async function handleNotificationReceived() {
      const notificationResponse = await getStoredNotifications();
      if (isMounted.current) {
        setNotificationResponseLength(notificationResponse?.length ?? 0);
        await getLoggedUser(); // update user state too
      }
    }

    function handleClearNotifications() {
      if (isMounted.current) {
        setNotificationResponseLength(0);
      }
    }

    // Initial fetch on mount
    getLoggedUser();

    // Subscribe to events
    eventBus.on("notification-received", handleNotificationReceived);
    eventBus.on("clear-notifications", handleClearNotifications);

    return () => {
      isMounted.current = false;
      eventBus.off("notification-received", handleNotificationReceived);
      eventBus.off("clear-notifications", handleClearNotifications);
    };
  }, []);

  return (
    <LinearGradient
      colors={["#140A21", "#522987"]}
      start={{ x: 0, y: 0 }}
      style={{
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: Platform.OS === "ios" ? topPadding : 0,
        }}
      >
        {/* Left: Profile & Info */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "33%",
          }}
        >
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
            {profilePic ? (
              <Image
                source={{ uri: profilePic }}
                style={{ width: 30, height: 30, borderRadius: 20 }}
              />
            ) : (
              <Ionicons name="person" size={25} color={theme.colors.text} />
            )}
          </TouchableOpacity>
          {weightShow ? (
            <View style={{ marginLeft: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <Feather name="arrow-up-right" size={14} color="lightgreen" />
                <Text
                  style={{ color: "white", fontSize: 14, marginHorizontal: 4 }}
                >
                  {weight ? weight : null}
                  {""}kgs
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Center Title */}
        <View style={{ width: "33%" }}>
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: theme.fontSizes.regularSmall,
              textAlign: "center",
            }}
          >
            {title ?? "Iness TV"}
          </Text>
        </View>

        {/* Right Icons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            width: "33%",
            justifyContent: "flex-end",
          }}
        >
          {/* Cart */}
          <TouchableOpacity
            style={{
              backgroundColor: "#411D6E",
              borderRadius: 20,
              padding: 8,
              position: "relative",
            }}
            onPress={() => router.push("/dashboard/cart")}
          >
            <Feather name="shopping-cart" size={16} color="white" />
            {cartItems && cartItems.length > 0 ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "red",
                  position: "absolute",
                  top: 6,
                  right: 6,
                }}
              />
            ) : null}
          </TouchableOpacity>

          {/* Bell */}
          <TouchableOpacity
            style={{
              backgroundColor: "#411D6E",
              borderRadius: 20,
              padding: 8,
              position: "relative",
            }}
            onPress={() => router.push("/dashboard/notification")}
          >
            <Feather name="bell" size={16} color="#FFFA67" />
            {notificationResponseLength > 0 ? (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "red",
                  position: "absolute",
                  top: 6,
                  right: 6,
                }}
              />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional Bottom Component */}
      {bottomComponent && (
        <View style={{ marginTop: 8 }}>{bottomComponent}</View>
      )}
    </LinearGradient>
  );
}
