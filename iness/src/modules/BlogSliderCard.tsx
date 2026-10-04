import { safeRouter } from "@/src/utils/safeRouter";
import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useGlobalTheme } from "../Theme/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Blog } from "../interfaces/blogInterface";
import CachedRemoteImage from "@/src/Components/Home/CachedRemoteImage";

function BlogSliderCard() {
  const theme = useGlobalTheme();
  const blogs = useSelector((state: RootState) => state.blog.blogs);
  const { width, height: screenHeight } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width * 0.78, 220), Math.max(width - 48, 220), 520);
  const dashboardBlogs = useMemo(() => blogs.slice(0, 8), [blogs]);

  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 12,
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
          marginBottom: 10,
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
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={16}
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
      <FlatList
        data={dashboardBlogs}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 12, paddingTop: 6, paddingBottom: 6 }}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={3}
        keyExtractor={(item, index) => item._id || `blog-${index}`}
        renderItem={({ item, index }: { item: Blog; index: number }) => (
          <TouchableOpacity
            onPress={() =>
              safeRouter.navigate({
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
              width: cardWidth,
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
            accessibilityRole="button"
            accessibilityLabel={`Read ${item.title}`}
            accessibilityHint="Opens the full blog article"
          >
            {/* Image Section */}
            <View
              style={{
                width: "100%",
                height: 160,
                backgroundColor: theme.colors.backgroundSecondary,
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CachedRemoteImage
                uri={item.coverImage}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                contentFit="contain"
                accessibilityLabel={`${item.title} cover image`}
                recyclingKey={item._id}
              />
            </View>

            {/* Content Section */}
            <View
              style={{
                padding: 12,
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Left Section - Title */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.bold as "700",
                    color: theme.colors.text,
                    marginBottom: 6,
                    lineHeight: screenHeight < 700 ? 18 : screenHeight < 900 ? 19 : 20,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  {item.title}
                </Text>
              </View>

              {/* Right Section - Button */}
              <View
                style={{
                  backgroundColor: theme.colors.success,
                  paddingVertical: screenHeight < 700 ? 6 : screenHeight < 900 ? 7 : 8,
                  paddingHorizontal: screenHeight < 700 ? 12 : screenHeight < 900 ? 14 : 16,
                  borderRadius: 10,
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
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default memo(BlogSliderCard);
