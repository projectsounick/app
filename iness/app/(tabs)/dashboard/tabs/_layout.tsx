import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DashboardLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },

        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#19002E",
          paddingBottom: 2 + insets.bottom, // add safe area bottom inset here
          paddingTop: 6,
          borderTopWidth: 0,
          height: 60 + insets.bottom, // increase height accordingly
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",

          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="home-variant"
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="train"
        options={{
          tabBarLabel: "Train",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="fire" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarLabel: "Community",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          tabBarLabel: "Store",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="store" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          tabBarLabel: "Media",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="play-circle"
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
