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
      source={require("../../../assets/images/basicBackground.jpeg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {/* Header */}
          <NormalHeader screenName="Profile" />
          <ProfileCard />

          {/* Transformation Image Upload Card */}
          <TransformationCard />

          {/* Settings Options */}
          <SettingsList />
        </ScrollView>

        {/* Version Text */}
        <View
          style={{
            position: "absolute",
            bottom: 10,
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color={theme.colors.dark}
            style={{ marginRight: 4 }}
          />
          <Text
            style={{
              color: theme.colors.dark,
              fontSize: theme.fontWeights.regularSmall,
            }}
          >
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}
