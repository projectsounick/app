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
const { height } = Dimensions.get("window");
const topPadding = height * 0.05;
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
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
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
            <Text style={{ marginTop: 10, color: "#666" }}>
              Loading blog...
            </Text>
          </View>
        ) : (
          blogData && (
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Blog Cover Image Card */}
              {blogData.coverImage && (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 24,
                    overflow: "hidden",
                    marginBottom: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <Image
                    source={{ uri: blogData.coverImage }}
                    style={{
                      width: "100%",
                      height: 240,
                    }}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Blog Title Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#000",
                    lineHeight: 30,
                  }}
                >
                  {blogData.title}
                </Text>
              </View>

              {/* Blog Content Card */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 24,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                {/* Blog Content Loop */}
                {blogData?.content?.map((item, index) => {
                  if (item.contentType === "heading") {
                    return (
                      <Text
                        key={index}
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#000",
                          marginTop: index > 0 ? 24 : 0,
                          marginBottom: 12,
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
                          fontSize: 15,
                          lineHeight: 24,
                          color: "#666",
                          marginBottom: 16,
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
                          marginVertical: 16,
                          borderRadius: 16,
                          overflow: "hidden",
                          backgroundColor: "#F8F8F8",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={{ uri: item.contentData }}
                          style={{
                            width: "100%",
                            height: 220,
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
                  backgroundColor: "#F3EDFF",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#E8D5FF",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#9747FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    Medical Information Disclaimer
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 20,
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
