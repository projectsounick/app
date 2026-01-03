import React, { memo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useGlobalTheme } from "../Theme/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { router } from "expo-router";
import { Blog } from "../interfaces/blogInterface";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85; // Responsive card width - 85% of screen width

function BlogSliderCard() {
  const theme = useGlobalTheme();
  const blogs = useSelector((state: RootState) => state.blog.blogs);
  const screenHeight = height;

  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 20,
        ...(Platform.OS === "ios"
          ? {
              shadowColor: theme.colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            }
          : {
              elevation: 1,
            }),
        backgroundColor: theme.colors.background,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
              borderRadius: 10,
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={20}
              color={theme.colors.secondPrimary}
            />
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontFamily: theme.fonts.bold,
              color: theme.colors.text,
              fontWeight: theme.fontWeights.bold as "700",
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
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
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
              backgroundColor: theme.colors.background,
              borderRadius: 20,
              marginRight: 16,
              marginTop: 4,
              marginBottom: 4,
              width: CARD_WIDTH,
              ...(Platform.OS === "ios"
                ? {
                    shadowColor: theme.colors.dark,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                  }
                : {
                    elevation: 1,
                  }),
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: "hidden",
            }}
          >
            {/* Image Section */}
            <View
              style={{
                width: "100%",
                height: 180,
                backgroundColor: theme.colors.backgroundSecondary,
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
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.bold as "700",
                    color: theme.colors.text,
                    marginBottom: 8,
                    lineHeight: screenHeight < 700 ? 20 : screenHeight < 900 ? 21 : 22,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  {item.title}
                </Text>
              </View>

              {/* Right Section - Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.success,
                  paddingVertical: screenHeight < 700 ? 8 : screenHeight < 900 ? 9 : 10,
                  paddingHorizontal: screenHeight < 700 ? 16 : screenHeight < 900 ? 18 : 20,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  ...(Platform.OS === "ios"
                    ? {
                        shadowColor: theme.colors.success,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                      }
                    : {
                        elevation: 2,
                      }),
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
                    fontSize: theme.fontSizes.regularSmall,
                    fontWeight: theme.fontWeights.bold as "700",
                    color: theme.colors.textWhite,
                    fontFamily: theme.fonts.bold,
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
