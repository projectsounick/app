import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import theme from "@/app/Theme/globalTheme";

import { SafeAreaView } from "react-native-safe-area-context";
import { Blog } from "@/app/interfaces/blogInterface";
import { blogService } from "@/app/services/blog.Service";
import CustomSnackbar from "@/app/modules/Snackbar";
import BackHeader from "@/app/modules/BackHeader";
import NormalHeader from "@/app/modules/NormalHeader";

export default function BlogDetailsScreen() {
  const { id } = useLocalSearchParams();

  const router = useRouter();
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
        console.log(response);

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
      edges={["top", "left", "right", "bottom"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")} // ✅ replace with your background
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {" "}
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
