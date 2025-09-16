import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { PlanInterface } from "../interfaces/planInterface";
import { ImageWithLoader } from "./ImageWithLoader";
import { router } from "expo-router";

export default function SliderCard() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const plans = useSelector((state: RootState) => state.plan.plans);
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + "..."
      : text;
  };

  return (
    <LinearGradient
      colors={["#9C56F6", "#3A1B63"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        height: 214,
        paddingTop: 13,
        paddingBottom: 19,
        paddingLeft: 14,
        borderRadius: 12,
      }}
    >
      {/* Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",

          width: "95%",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontFamily: theme.fonts.bold,
              color: theme.colors.text,
            }}
          >
            <MaterialCommunityIcons
              name="run"
              size={18}
              color={theme.colors.primary}
            />
            Explore our plans
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.small,
              fontWeight: theme.fontWeights.regular,
              color: theme.colors.text,
              marginTop: 6,
            }}
          >
            Tailored plans for your personalized lifestyles.
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.text}
          onPress={() => router.push("/dashboard/plan")}
        />
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10 }}
      >
        {plans.map((item: PlanInterface, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D6B6FF",
              borderRadius: 14,
              padding: 10,
              marginRight: 7,
              width: 310,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: "95%",
              }}
            >
              {/* Left Section */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  height: "100%",
                  width: "60%",
                }}
              >
                {/* Title */}
                <Text
                  style={{
                    fontFamily: theme.fonts.bold,
                    fontSize: 14,
                    marginBottom: 6,
                    color: theme.colors.dark,
                  }}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>

                {/* Bullet List Section */}

                {/* Know More Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "rgba(189, 255, 132, 1)",
                    width: 114,
                    height: 31,
                    borderRadius: 16,
                    alignSelf: "flex-start",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => router.push("/dashboard/plan")}
                >
                  <Text
                    style={{
                      fontFamily: theme.fonts.bold,
                      fontSize: 14,
                      textAlign: "center",
                      color: theme.colors.dark,
                    }}
                  >
                    Know More
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right Section - Image */}
              <TouchableOpacity
                style={{
                  height: "95%",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "35%",
                  marginLeft: 15,
                }}
                onPress={() => {
                  setSelectedImage(item.imgUrl);
                  setModalVisible(true);
                }}
              >
                <ImageWithLoader uri={item.imgUrl} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.8)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={1}
              style={{ width: "90%", height: "70%" }}
            >
              <Image
                source={{ uri: selectedImage ?? "" }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                  borderRadius: 12,
                }}
              />
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </LinearGradient>
  );
}
