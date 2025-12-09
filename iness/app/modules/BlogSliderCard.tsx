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
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { router } from "expo-router";
import { Blog } from "../interfaces/blogInterface";

function BlogSliderCard() {
  const blogs = useSelector((state: RootState) => state.blog.blogs);

  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        backgroundColor: "#FFFFFF",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      {/* Fixed Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={16}
              color="#9747FF"
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: theme.fonts.bold,
              color: "#000",
              fontWeight: "700",
            }}
          >
            Read our Blogs
          </Text>
        </View>
      </View>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {blogs.map((item: Blog, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/dashboard/blogdetails",
                params: { id: item._id },
              })
            }
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              marginRight: 16,
              width: 320,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#F5F5F5",
              overflow: "hidden",
            }}
          >
            {/* Image Section */}
            <View
              style={{
                width: "100%",
                height: 180,
                backgroundColor: "#F8F8F8",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri: item.coverImage }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="contain"
              />
            </View>

            {/* Content Section */}
            <View
              style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Left Section - Title */}
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: 12,
                    lineHeight: 22,
                  }}
                >
                  {item.title}
                </Text>
              </View>

              {/* Right Section - Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#67C694",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                  alignSelf: "flex-start",
                  shadowColor: "#67C694",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
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
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#FFFFFF",
                  }}
                >
                  Read
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default memo(BlogSliderCard);
