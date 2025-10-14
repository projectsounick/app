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

  return (
    <LinearGradient
      colors={["#140A21", "#522987"]}
      start={{ x: 0, y: 0 }}
      style={{
        height: 210,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 12,
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
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: theme.fontSizes.regular,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              Read our Blogs
            </Text>
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.bold,
              color: theme.colors.text,
              marginTop: 6,
            }}
          >
            Explore expert tips, and practical guides to help you
          </Text>
        </View>
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12 }}
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
              width: 330,
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
                height: "94%",
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
                  numberOfLines={3}
                  style={{
                    fontFamily: theme.fonts.bold,
                    fontSize: 12,
                    marginBottom: 6,
                    color: theme.colors.dark,
                    flexShrink: 1,
                  }}
                >
                  {item.title}
                </Text>

                {/* Know More Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#BDFF84",
                    width: 114,
                    height: 31,
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
                      fontFamily: theme.fonts.bold,
                      fontSize: 14,
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
