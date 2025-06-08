////// Main functional component for the profile screen --------------------------------------/
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";

import TransformationCard from "@/app/Components/Profile/Tranformation";
import SettingsList from "@/app/Components/Profile/SettingsList";
import ProfileCard from "@/app/Components/Profile/DescriptionCard";

import { ImageBackground } from "react-native";
import NormalHeader from "@/app/modules/NormalHeader";

import { SafeAreaView } from "react-native-safe-area-context";

//// Main funcitonal component for the Profile screen -------------------------/
export default function ProfileScreen() {
  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f2f2f2" }}
        edges={["top", "left", "right"]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 20, // <-- ensures enough space for last card
          }}
        >
          {/* Header */}
          <NormalHeader screenName="Profile" />
          <ProfileCard />

          {/* Transformation Image Upload Card */}
          <TransformationCard />

          {/* Settings Options */}
          <SettingsList />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
