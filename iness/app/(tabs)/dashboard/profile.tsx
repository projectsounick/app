////// Main functional component for the profile screen --------------------------------------/
import {
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
} from "react-native";

import TransformationCard from "@/app/Components/Profile/Tranformation";
import SettingsList from "@/app/Components/Profile/SettingsList";
import ProfileCard from "@/app/Components/Profile/DescriptionCard";

import { ImageBackground } from "react-native";
import NormalHeader from "@/app/modules/NormalHeader";

import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons"; // You can also use Entypo, Ionicons etc.
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
const { height } = Dimensions.get("window");
const topPadding = height * 0.05; // 2% of screen height

//// Main funcitonal component for the Profile screen -------------------------/
function ProfileScreen() {
  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          {/* Header */}
          <NormalHeader screenName="Profile" />
        </View>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,

            paddingBottom: 20, // <-- ensures enough space for last card
          }}
        >
          <ProfileCard />

          {/* Transformation Image Upload Card */}
          <TransformationCard />

          {/* Settings Options */}
          <SettingsList />
          {/* Social Icons */}
          <View style={{ alignItems: "center", marginVertical: 10 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                paddingHorizontal: 20,
              }}
            >
              {/* Left dashed line */}
              <View
                style={{
                  flex: 1,
                  height: 1,
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              />

              {/* Social Icons */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 20,
                  marginHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    openURL(
                      "https://www.linkedin.com/company/iness-fitness-community/"
                    )
                  }
                >
                  <FontAwesome
                    name="linkedin-square"
                    size={28}
                    color="#0077B5"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    openURL(
                      "https://www.instagram.com/iness_wellness360_app?igsh=MXNibW5kc3hmN2c3dg%3D%3D&utm_source=qr"
                    )
                  }
                >
                  <FontAwesome name="instagram" size={28} color="#E1306C" />
                </TouchableOpacity>
              </View>

              {/* Right dashed line */}
              <View
                style={{
                  flex: 1,
                  height: 1,
                  borderStyle: "dashed",
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default LoginWrapper(ProfileScreen);
