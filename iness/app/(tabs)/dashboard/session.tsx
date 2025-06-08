import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BannerCard from "@/app/modules/BannerCard";
import {
  offlineSessionCardData,
  onlineSessionCardData,
} from "@/utils/ModuletaticData";
import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";
import Icon from "react-native-vector-icons/Ionicons"; // for arrow icon
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const BookSessionScreen = () => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(true);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right"]}
    >
      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 30,
          }}
        >
          <ImageBackground
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 25,
              alignItems: "center",
              width: width * 0.8,
            }}
            source={require("../../../assets/images/carrauselBackground.jpg")}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#333",
                marginBottom: 20,
              }}
            >
              Coming Soon!
            </Text>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: "#f0f0f0",
                borderRadius: 10,
              }}
            >
              <Icon
                name="arrow-back"
                size={20}
                color="#333"
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 16, color: "#333" }}>Go Back</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </Modal>

      {/* Header and Content */}
      <SmallHeader title="Sessions" />
      <BackHeader />

      <ScrollView
        contentContainerStyle={{
          padding: 19,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            marginBottom: 6,
            color: "#000",
          }}
        >
          Choose Your Training Mode
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 16,
            lineHeight: 20,
          }}
        >
          Get expert guidance your way{"\n"}online or in person.
        </Text>

        <BannerCard cardData={onlineSessionCardData} />
        <View style={{ height: 16 }} />
        <BannerCard cardData={offlineSessionCardData} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookSessionScreen;
