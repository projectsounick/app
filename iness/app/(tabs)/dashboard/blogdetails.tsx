import React, { useEffect, useState } from "react";
import {
  View,
  Text,

  ScrollView,
  ImageBackground,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
const { width, height } = Dimensions.get("window");
const topPadding = height * 0.05;

// Responsive scaling factors
const scale = width / 375; // Base width (iPhone X/11)
const fontScale = width < 375 ? width / 375 : Math.min(width / 375, 0.95); // Scale down for smaller screens, cap lower for larger
const verticalScale = height / 812; // Base height

// Responsive functions - more aggressive scaling
const responsiveFontSize = (size: number) => size * Math.min(fontScale, 0.95);
const responsiveSpacing = (size: number) => size * Math.min(scale, 1.0);
import { SafeAreaView } from "react-native-safe-area-context";
import { Blog } from "@/app/interfaces/blogInterface";
import { blogService } from "@/app/services/blog.Service";
import CustomSnackbar from "@/app/modules/Snackbar";

import NormalHeader from "@/app/modules/NormalHeader";

export default function BlogDetailsScreen() {
  const { id } = useLocalSearchParams();


  const [blogData, setBlogData] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  /// function for fetching the notificaitons ---------------------------/
  async function fetchNotificationsFromLocal() {
    try {
      setLoading(true);
      if (id) {
        const response = await blogService.fetchIndividualBlog(id);

        if (response.success && response.data && response.data.length > 0) {
          setBlogData(response.data[0]);
        } else {
          setSnackbarOpen(true);
          setSnackbarMessage("Not able to find the blog");
        }
      } else {
        setSnackbarOpen(true);
        setSnackbarMessage("Not able to find the blog");
      }
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarMessage("Not able to find the blog");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchNotificationsFromLocal();
  }, []);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
      edges={[ "left", "right", ]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")} // ✅ replace with your background
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            paddingHorizontal: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Blog" rightIcon={false} />
        </View>

        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <ActivityIndicator size="large" color="#9747FF" />
            <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>
              Loading blog...
            </Text>
          </View>
        ) : (
          blogData && (
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: responsiveSpacing(16),
                paddingTop: responsiveSpacing(16),
                paddingBottom: responsiveSpacing(100),
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Blog Cover Image */}
              {blogData.coverImage && (
                <View
                  style={{
                    marginBottom: responsiveSpacing(24),
                    borderRadius: responsiveSpacing(12),
                    overflow: "hidden",
                  }}
                >
                  <Image
                    source={{ uri: blogData.coverImage }}
                    style={{
                      width: "100%",
                      height: responsiveSpacing(240),
                    }}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Blog Title */}
              <Text
                style={{
                  fontSize: responsiveFontSize(20),
                  fontWeight: "700",
                  color: theme.colors.dark,
                  lineHeight: responsiveFontSize(28),
                  marginBottom: responsiveSpacing(20),
                }}
              >
                {blogData.title}
              </Text>

              {/* Blog Content */}
              <View>
                {/* Blog Content Loop */}
                {blogData?.content?.map((item, index) => {
                  if (item.contentType === "heading") {
                    return (
                      <Text
                        key={index}
                        style={{
                          fontSize: responsiveFontSize(18),
                          fontWeight: "700",
                          color: theme.colors.dark,
                          marginTop: index > 0 ? responsiveSpacing(24) : 0,
                          marginBottom: responsiveSpacing(12),
                        }}
                      >
                        {item.contentData}
                      </Text>
                    );
                  }

                  if (item.contentType === "text") {
                    return (
                      <Text
                        key={index}
                        style={{
                          fontSize: responsiveFontSize(15),
                          lineHeight: responsiveFontSize(24),
                          color: theme.colors.textSecondary,
                          marginBottom: responsiveSpacing(16),
                          fontWeight: "400",
                        }}
                      >
                        {item.contentData}
                      </Text>
                    );
                  }

                  if (item.contentType === "image") {
                    return (
                      <View
                        key={index}
                        style={{
                          marginVertical: responsiveSpacing(16),
                          borderRadius: responsiveSpacing(16),
                          overflow: "hidden",
                          backgroundColor: theme.colors.backgroundSecondary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={{ uri: item.contentData }}
                          style={{
                            width: "100%",
                            height: responsiveSpacing(220),
                          }}
                          resizeMode="contain"
                        />
                      </View>
                    );
                  }

                  return null;
                })}
              </View>

              {/* Medical Disclaimer for Health-Related Content */}
              <View
                style={{
                  backgroundColor: theme.colors.backgroundCardLight,
                  borderRadius: responsiveSpacing(12),
                  padding: responsiveSpacing(16),
                  marginTop: responsiveSpacing(24),
                  marginBottom: responsiveSpacing(16),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: responsiveSpacing(12),
                  }}
                >
                  <View
                    style={{
                      width: responsiveSpacing(40),
                      height: responsiveSpacing(40),
                      borderRadius: responsiveSpacing(20),
                      backgroundColor: theme.colors.secondPrimary,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: responsiveSpacing(12),
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={responsiveFontSize(22)}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(16),
                      fontWeight: "700",
                      color: theme.colors.dark,
                    }}
                  >
                    Medical Information Disclaimer
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: responsiveFontSize(14),
                    color: theme.colors.textSecondary,
                    lineHeight: responsiveFontSize(20),
                    fontWeight: "500",
                  }}
                >
                  If this blog contains health or medical information, please note
                  that it is for informational purposes only and is not intended as
                  medical advice. Always consult with a qualified healthcare
                  provider for personalized medical guidance.
                </Text>
              </View>
            </ScrollView>
          )
        )}
      </ImageBackground>
      <CustomSnackbar
        visible={snackbarOpen}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
        onDismiss={() => setSnackbarOpen(false)}
      />
    </SafeAreaView>
  );
}
