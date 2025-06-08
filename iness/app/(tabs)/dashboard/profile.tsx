////// Main functional component for the profile screen --------------------------------------/
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import TransformationCard from "@/app/Components/Profile/Tranformation";
import SettingsList from "@/app/Components/Profile/SettingsList";
import ProfileCard from "@/app/Components/Profile/DescriptionCard";

import { ImageBackground } from "react-native";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
import { useState } from "react";
import TransformationImageModal from "@/app/Components/Profile/TransformationModal";

//// Main funcitonal component for the Profile screen -------------------------/
export default function ProfileScreen() {
  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
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
      </View>
    </ImageBackground>
  );
}
