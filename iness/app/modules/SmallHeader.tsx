import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import eventBus from "@/event";
import { getStoredNotifications } from "@/utils/notificationUtils";

import { setStreakModalShow } from "@/Slices/streakSlice";

const { height } = Dimensions.get("window");
const topPadding = height * 0.03;

export default function SmallHeader({
  setWeightTrackModalShow,
  title,
  weightShow = true,
  bottomComponent,
  showCart = true,
  showBell = true,
  showHistory = false,
  showStreak = false,
  onCreatePost,
}: {
  setWeightTrackModalShow?: any;
  title?: string;
  weightShow?: boolean;
  bottomComponent?: React.ReactNode;
  showCart?: boolean;
  showBell?: boolean;
  showHistory?: boolean;
  showStreak?: boolean;
  onCreatePost?: () => void;
}) {
  /// store data for the streaks ----------------------------------------/
  const streakCount = useSelector(
    (state: RootState) => state.streak.totalStreak
  );

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const router = useRouter();
  const dispatch = useDispatch();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
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
        await getLoggedUser();
      }
    }

    function handleClearNotifications() {
      if (isMounted.current) {
        setNotificationResponseLength(0);
      }
    }

    getLoggedUser();

    eventBus.on("notification-received", handleNotificationReceived);
    eventBus.on("clear-notifications", handleClearNotifications);

    return () => {
      isMounted.current = false;
      eventBus.off("notification-received", handleNotificationReceived);
      eventBus.off("clear-notifications", handleClearNotifications);
    };
  }, []);

  return (
    <>
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
          {/* Left */}
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
            {weightShow && weight ? (
              <View style={{ marginLeft: 8 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                  onPress={() => router.push("/(tabs)/dashboard/trackWeight")}
                >
                  <Feather name="arrow-up-right" size={14} color="lightgreen" />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      marginHorizontal: 4,
                    }}
                  >
                    {weight ? parseFloat(weight.toString()).toFixed(1) : null}kgs
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Center */}
          <View>
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 14,
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
            {/* 🔥 Streak Icon */}
            {}
            <TouchableOpacity
              onPress={() => dispatch(setStreakModalShow(true))}
              activeOpacity={0.8}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1.2,
                borderColor: "#FF3B3B",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 59, 59, 0.12)",
                shadowColor: "#FF3B3B",
                display: showStreak ? "flex" : "none",
                shadowOpacity: 0.35,
                shadowRadius: 3,
                elevation: 3,
                position: "relative",
              }}
            >
              {/* 🔥 Flame Icon */}
              <Ionicons name="flame" size={16} color="#FF3B3B" />

              {/* 🔢 Streak Count Badge */}
              {streakCount && streakCount !== 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: 1,
                    right: 1,
                    backgroundColor: "#FF3B3B",
                    borderRadius: 6,
                    paddingHorizontal: 3,
                    paddingVertical: 0.5,
                    minWidth: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {streakCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>

            {/* Cart */}
            {showCart && (
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
            )}

            {/* Bell */}
            {showBell && (
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
            )}

            {showHistory && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#411D6E",
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <Feather name="clock" size={16} color="white" />
              </TouchableOpacity>
            )}

            {/* Create Post Button */}
            {onCreatePost && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#67C694",
                  borderRadius: 20,
                  padding: 8,
                  width: 36,
                  height: 36,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={onCreatePost}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {bottomComponent && (
          <View style={{ marginTop: 8 }}>{bottomComponent}</View>
        )}
      </LinearGradient>

      {/* Bottom Sheet Modal */}
    </>
  );
}
