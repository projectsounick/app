import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DashboardLayout() {
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
          paddingBottom: 6,
          paddingTop: 6,
          borderTopWidth: 0,
          height: 70,
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
        name="store"
        options={{
          tabBarLabel: "Store",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="kettlebell" size={28} color={color} />
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
