import { safeRouter } from "@/src/utils/safeRouter";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import eventBus from "@/event";
import { getStoredNotifications } from "@/utils/notificationUtils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import { setStreakModalShow } from "@/Slices/streakSlice";
import CachedRemoteImage from "@/src/Components/Home/CachedRemoteImage";

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
  const dispatch = useDispatch();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [notificationResponseLength, setNotificationResponseLength] =
    useState(0);
  
  const insets = useSafeAreaInsets();
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const { width, height } = useWindowDimensions();
  const topPadding = Math.min(Math.max(height * 0.02, 10), 20);
  const buttonSize = width < 360 ? 32 : width < 400 ? 36 : 38;
  const avatarSize = width < 360 ? 34 : width < 400 ? 38 : 40;
  const iconSize = width < 360 ? 14 : width < 400 ? 15 : 16;
  const iconGap = width < 360 ? 5 : width < 400 ? 7 : 8;
  const paddingHoriz = width < 360 ? 12 : width < 400 ? 16 : 18;
  const paddingVert = width < 360 ? 12 : width < 400 ? 14 : 16;
  const hitSlop = { top: 8, bottom: 8, left: 6, right: 6 };

  const readHeaderData = useCallback(async () => {
    const [user, notifications] = await Promise.all([
      asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user"),
      getStoredNotifications(),
    ]);

    return {
      profilePic: user.exists ? user.data?.profilePic ?? null : null,
      weight: user.exists ? user.data?.weight ?? null : null,
      notificationCount: notifications?.length ?? 0,
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      readHeaderData()
        .then((data) => {
          if (!active) return;
          setProfilePic(data.profilePic);
          setWeight(data.weight);
          setNotificationResponseLength(data.notificationCount);
        })
        .catch((error) => {
          if (__DEV__) console.error("Unable to refresh dashboard header", error);
        });

      return () => {
        active = false;
      };
    }, [readHeaderData])
  );

  useEffect(() => {
    let active = true;
    async function refreshHeader() {
      const data = await readHeaderData();
      if (!active) return;
      setProfilePic(data.profilePic);
      setWeight(data.weight);
      setNotificationResponseLength(data.notificationCount);
    }

    function handleClearNotifications() {
      if (active) setNotificationResponseLength(0);
    }

    eventBus.on("notification-received", refreshHeader);
    eventBus.on("clear-notifications", handleClearNotifications);
    eventBus.on("user-updated", refreshHeader);
    eventBus.on("weight-updated", refreshHeader);
    eventBus.on("profile-updated", refreshHeader);

    return () => {
      active = false;
      eventBus.off("notification-received", refreshHeader);
      eventBus.off("clear-notifications", handleClearNotifications);
      eventBus.off("user-updated", refreshHeader);
      eventBus.off("weight-updated", refreshHeader);
      eventBus.off("profile-updated", refreshHeader);
    };
  }, [readHeaderData]);

  return (
    <>
      <StatusBar style="light" />
      <LinearGradient
        colors={isDark ? [theme.colors.background, theme.colors.backgroundSecondary] : ["#140A21", "#522987"]}
        start={{ x: 0, y: 0 }}
        style={{
          paddingTop: Platform.OS === "android" ? Math.max(insets.top, 14) : 14,
          paddingHorizontal: paddingHoriz,
          paddingBottom: paddingVert,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
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
              flex: 1,
              zIndex: 1,
            }}
          >
            <TouchableOpacity
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: theme.colors.cardLight,
                justifyContent: "center",
                alignItems: "center",
              }}
              hitSlop={hitSlop}
              onPress={() => safeRouter.navigate("/dashboard/profile")}
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              accessibilityHint="Shows your profile and account settings"
            >
              {profilePic ? (
                <CachedRemoteImage
                  uri={profilePic}
                  style={{ width: avatarSize - 4, height: avatarSize - 4, borderRadius: (avatarSize - 4) / 2 }}
                  accessibilityLabel="Profile photo"
                />
              ) : (
                <Ionicons name="person" size={iconSize + 6} color={theme.colors.text} />
              )}
            </TouchableOpacity>
            {weightShow && weight && width >= 350 ? (
              <View style={{ marginLeft: 6 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                  onPress={() => safeRouter.navigate("/(tabs)/dashboard/trackWeight")}
                  accessibilityRole="button"
                  accessibilityLabel={`Current weight ${parseFloat(weight.toString()).toFixed(1)} kilograms`}
                  accessibilityHint="Opens weight tracking"
                  hitSlop={hitSlop}
                >
                  <Feather name="arrow-up-right" size={13} color="lightgreen" />
                  <Text
                    style={{
                      color: "white",
                      fontSize: theme.fontSizes.regularSmall,
                      marginHorizontal: 3,
                    }}
                  >
                    {weight ? parseFloat(weight.toString()).toFixed(1) : null}kgs
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Center */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 70,
              right: 70,
              alignItems: "center",
            }}
          >
            <Text
              numberOfLines={1}
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
              gap: iconGap,
              flex: 1,
              justifyContent: "flex-end",
              zIndex: 1,
            }}
          >
            {/* 🔥 Streak Icon */}
            {showStreak ? (
              <TouchableOpacity
                onPress={() => dispatch(setStreakModalShow(true))}
                activeOpacity={0.8}
                hitSlop={hitSlop}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: buttonSize / 2,
                  borderWidth: 1.2,
                  borderColor: "#FF3B3B",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 59, 59, 0.12)",
                  shadowColor: "#FF3B3B",
                  shadowOpacity: 0.35,
                  shadowRadius: 3,
                  elevation: 3,
                  position: "relative",
                }}
                accessibilityRole="button"
                accessibilityLabel={`${streakCount || 0} day streak`}
                accessibilityHint="Opens streak details"
              >
                {/* 🔥 Flame Icon */}
                <Ionicons name="flame" size={iconSize} color="#FF3B3B" />

                {/* 🔢 Streak Count Badge */}
                {streakCount && streakCount !== 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      backgroundColor: theme.colors.error,
                      borderRadius: 6,
                      paddingHorizontal: 3,
                      paddingVertical: 0.5,
                      minWidth: 12,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: theme.fontWeights.bold as "700",
                        color: theme.colors.textWhite,
                      }}
                    >
                      {streakCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}

            {/* Cart */}
            {showCart && (
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? theme.colors.backgroundCardLight : theme.colors.iconBackground,
                  borderRadius: buttonSize / 2,
                  width: buttonSize,
                  height: buttonSize,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
                hitSlop={hitSlop}
                onPress={() => safeRouter.navigate("/dashboard/cart")}
                accessibilityRole="button"
                accessibilityLabel={`Shopping cart, ${cartItems?.length || 0} items`}
                accessibilityHint="Opens your shopping cart"
              >
                <Feather name="shopping-cart" size={iconSize} color="white" />
                {cartItems && cartItems.length > 0 ? (
                  <View
                    style={{
                      minWidth: 15,
                      height: 15,
                      borderRadius: 7.5,
                      backgroundColor: "red",
                      position: "absolute",
                      top: -3,
                      right: -3,
                      paddingHorizontal: 2.5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 8.5, fontWeight: "700" }}>
                      {cartItems.length > 99 ? "99+" : cartItems.length}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            )}

            {/* Bell */}
            {showBell && (
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? theme.colors.backgroundCardLight : theme.colors.iconBackground,
                  borderRadius: buttonSize / 2,
                  width: buttonSize,
                  height: buttonSize,
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
                hitSlop={hitSlop}
                onPress={() => safeRouter.navigate("/dashboard/notification")}
                accessibilityRole="button"
                accessibilityLabel={`Notifications, ${notificationResponseLength} unread`}
                accessibilityHint="Opens notifications"
              >
                <Feather name="bell" size={iconSize} color="#FFFA67" />
                {notificationResponseLength > 0 ? (
                  <View
                    style={{
                      minWidth: 15,
                      height: 15,
                      borderRadius: 7.5,
                      backgroundColor: "red",
                      position: "absolute",
                      top: -3,
                      right: -3,
                      paddingHorizontal: 2.5,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 8.5, fontWeight: "700" }}>
                      {notificationResponseLength > 99 ? "99+" : notificationResponseLength}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            )}

            {showHistory && (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.secondPrimary,
                  borderRadius: buttonSize / 2,
                  width: buttonSize,
                  height: buttonSize,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={hitSlop}
                accessibilityRole="button"
                accessibilityLabel="History"
                accessibilityState={{ disabled: true }}
              >
                <Feather name="clock" size={iconSize} color="white" />
              </TouchableOpacity>
            )}

            {/* Create Post Button */}
            {onCreatePost && (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: buttonSize / 2,
                  width: buttonSize,
                  height: buttonSize,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                hitSlop={hitSlop}
                onPress={onCreatePost}
                accessibilityRole="button"
                accessibilityLabel="Create post"
                accessibilityHint="Opens the new post form"
              >
                <Ionicons name="add" size={iconSize + 4} color="#FFFFFF" />
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
