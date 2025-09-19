import React, { memo } from "react";
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

function BlogSliderCard() {
  const blogs = useSelector((state: RootState) => state.blog.blogs);

  return (
    <View
      style={{
        height: 210,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: "#fff",
        marginBottom: 16,
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
              color="#7771de"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: theme.fontSizes.regular,
                fontFamily: theme.fonts.bold,
                color: theme.colors.dark,
              }}
            >
              Read our Blogs
            </Text>
          </View>
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
              backgroundColor: "#7771de", // dark background
              borderRadius: 12,
              marginRight: 12,
              width: 330,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#7771de",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
              padding: 8,
            }}
          >
            <View
              style={{
                width: "95%",
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
                <Text
                  numberOfLines={3}
                  style={{
                    fontFamily: theme.fonts.bold,
                    fontSize: 12,
                    marginBottom: 6,
                    color: "#fff", // light text
                    flexShrink: 1,
                  }}
                >
                  {item.title}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#67c694",
                    paddingHorizontal: 30,
                    paddingVertical: 6,
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
                      color: "#fff",
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
    </View>
  );
}

export default memo(BlogSliderCard);
