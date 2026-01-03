import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Check if we're on the home page (index route)
  const currentRoute = state.routes[state.index];
  const isHomePage = currentRoute?.name === "index";
  
  // Calculate spacing based on whether we're on home page
  let MIDDLE_SPACE = 0;
  let TAB_WIDTH = 0;
  let LEFT_SIDE_WIDTH = 0;
  let RIGHT_SIDE_WIDTH = 0;
  
  if (isHomePage) {
    // On home page: divide screen with middle space for icon
    const PART_WIDTH = SCREEN_WIDTH / 5;
    MIDDLE_SPACE = PART_WIDTH * 0.75; // Middle icon gets 75% of one part
    const REMAINING_SPACE = SCREEN_WIDTH - MIDDLE_SPACE;
    TAB_WIDTH = REMAINING_SPACE / 4; // Each tab gets equal share of remaining space
    LEFT_SIDE_WIDTH = TAB_WIDTH * 2; // 2 tabs on left
    RIGHT_SIDE_WIDTH = TAB_WIDTH * 2; // 2 tabs on right
  } else {
    // Not on home page: divide space equally among 4 tabs (no middle space)
    TAB_WIDTH = SCREEN_WIDTH / 4; // Each tab gets equal space
    LEFT_SIDE_WIDTH = TAB_WIDTH * 2; // 2 tabs on left
    RIGHT_SIDE_WIDTH = TAB_WIDTH * 2; // 2 tabs on right
  }

  const tabs = [
    { name: "index", label: "Home", icon: "home-variant", route: "index" },
    { name: "train", label: "Train", icon: "fire", route: "train" },
    { name: "feed", label: "Feed", icon: "account-group", route: "feed" },
    { name: "store", label: "Store", icon: "store", route: "store" },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
        },
      ]}
    >
      <LinearGradient
        colors={isDark ? [theme.colors.background, theme.colors.backgroundSecondary] : ["#140A21", "#522987"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.tabContainer}>
        {isHomePage ? (
          // Home page layout: Left tabs + Middle space + Right tabs
          <>
            {/* Left side tabs: Home and Train */}
            <View style={[styles.sideContainer, { width: LEFT_SIDE_WIDTH }]}>
              {tabs.slice(0, 2).map((tab) => {
                const routeIndex = state.routes.findIndex((r:any) => r.name === tab.route);
                if (routeIndex === -1) return null;
                
                const route = state.routes[routeIndex];
                const isFocused = state.index === routeIndex;
                const { options } = descriptors[route.key];

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: route.key,
                  });
                };

                return (
                  <TouchableOpacity
                    key={tab.name}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={styles.tabButton}
                  >
                    <MaterialCommunityIcons
                      name={tab.icon as any}
                      size={28}
                      color={isFocused ? "#fff" : "#888"}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: isFocused ? "#fff" : "#888" },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Middle space for floating button */}
            <View style={{ width: MIDDLE_SPACE }} />

            {/* Right side tabs: Feed and Store */}
            <View style={[styles.sideContainer, { width: RIGHT_SIDE_WIDTH }]}>
              {tabs.slice(2, 4).map((tab) => {
                const routeIndex = state.routes.findIndex((r:any) => r.name === tab.route);
                if (routeIndex === -1) return null;
                
                const route = state.routes[routeIndex];
                const isFocused = state.index === routeIndex;
                const { options } = descriptors[route.key];

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: route.key,
                  });
                };

                return (
                  <TouchableOpacity
                    key={tab.name}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={options.tabBarAccessibilityLabel}
                    testID={options.tabBarTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    style={styles.tabButton}
                  >
                    <MaterialCommunityIcons
                      name={tab.icon as any}
                      size={28}
                      color={isFocused ? "#fff" : "#888"}
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: isFocused ? "#fff" : "#888" },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          // Not on home page: All 4 tabs in one row, equally spaced
          <View style={[styles.sideContainer, { width: SCREEN_WIDTH }]}>
            {tabs.map((tab) => {
              const routeIndex = state.routes.findIndex((r:any) => r.name === tab.route);
              if (routeIndex === -1) return null;
              
              const route = state.routes[routeIndex];
              const isFocused = state.index === routeIndex;
              const { options } = descriptors[route.key];

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <TouchableOpacity
                  key={tab.name}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabButton}
                >
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={28}
                    color={isFocused ? "#fff" : "#888"}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isFocused ? "#fff" : "#888" },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    paddingTop: 8,
  },
  sideContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
});

