import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import theme from "../Theme/globalTheme";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import { ImageWithLoader } from "./ImageWithLoader";
import { router } from "expo-router";
import { Blog } from "../interfaces/blogInterface";

export default function BlogSliderCard() {
  const blogs = useSelector((state: RootState) => state.blog.blogs);
  console.log(blogs);

  return (
    <LinearGradient
      colors={["#3D0E7B", "#000000"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        height: 190,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 8,
      }}
    >
      {/* Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontWeight: "bold",
              color: theme.colors.text,
            }}
          >
            <MaterialCommunityIcons
              name="run"
              size={18}
              color={theme.colors.primary}
            />{" "}
            Read our Blogs
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.small,
              fontWeight: theme.fontWeights.regular,
              color: theme.colors.text,
              marginTop: 4,
            }}
          >
            Tailored plans for your personalized lifestyles.
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.text}
        />
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 8 }}
      >
        {blogs.map((item: Blog, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#D6B6FF",
              borderRadius: 12,
              marginRight: 12,
              width: 290,
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
                width: "95%",
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
                  height: "90%",
                  width: "60%",
                }}
              >
                {/* Title */}
                {/* Title */}
                <Text
                  style={{
                    fontWeight: theme.fontWeights.bold,
                    fontSize: 12,
                    marginBottom: 6,
                    color: theme.colors.dark,
                    flexShrink: 1, // Ensures text doesn't overflow
                  }}
                >
                  {item.title}
                </Text>
                {/* Know More Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#B4F455",
                    width: 114,
                    height: 28,
                    borderRadius: 16,
                    alignSelf: "flex-start",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/dashboard/blogdetails",
                      params: { id: item._id },
                    })
                  }
                >
                  <Text
                    style={{
                      fontWeight: theme.fontWeights.bold,
                      fontSize: theme.fontSizes.small,
                      textAlign: "center",
                      color: theme.colors.dark,
                    }}
                  >
                    Read
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Right Section - Image */}
              <View
                style={{
                  height: "95%",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "40%",
                }}
              >
                <ImageWithLoader uri={item.coverImage} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}
