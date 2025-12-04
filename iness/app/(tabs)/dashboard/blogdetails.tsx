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
        <View style={{     flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%", }}>
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
            <ActivityIndicator size="large" color="#A4FF55" />
            <Text style={{ marginTop: 10, color: "#666" }}>
              Loading blog...
            </Text>
          </View>
        ) : (
          blogData && (
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Blog Title */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#222",
                  marginBottom: 10,
                  textAlign: "center", // Center-align for better aesthetics
                }}
              >
                {blogData.title}
              </Text>

              {/* Blog Cover Image */}
              {blogData.coverImage && (
                <Image
                  source={{ uri: blogData.coverImage }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 12,
                    marginBottom: 16,
                  }}
                  resizeMode="contain"
                />
              )}

              {/* Blog Content Loop */}
              {blogData?.content?.map((item, index) => {
                if (item.contentType === "heading") {
                  return (
                    <Text
                      key={index}
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: theme.colors.dark,
                        marginTop: 16,
                        marginBottom: 6,
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
                        fontSize: 10,
                        lineHeight: 22,
                        color: "#333",
                        marginBottom: 12,
                      }}
                    >
                      {item.contentData}
                    </Text>
                  );
                }

                if (item.contentType === "image") {
                  return (
                    <Image
                      key={index}
                      source={{ uri: item.contentData }}
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 10,
                        marginBottom: 16,
                      }}
                      resizeMode="contain"
                    />
                  );
                }

                return null;
              })}

              {/* Medical Disclaimer for Health-Related Content */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 24,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#F0F0F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#9747FF"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: "#000",
                    }}
                  >
                    Medical Information Disclaimer
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#666",
                    lineHeight: 16,
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
