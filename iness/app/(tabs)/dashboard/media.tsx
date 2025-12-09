import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Image, ImageBackground, Dimensions, Platform } from "react-native";
import VideoCard from "@/app/modules/VideoCard";
import NormalHeader from "@/app/modules/NormalHeader";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { podCastService } from "@/app/services/podcast.service";
import useGetDataHook from "@/hooks/useFetchHook";
import SimmerSkeletonCard from "@/app/modules/SimmerCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import CustomSnackbar from "@/app/modules/Snackbar";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import FullScreenLoader from "@/app/modules/FullScreenLoader";
import useFetchStoreDataHook from "@/hooks/useStoreFetchHook";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const { height } = Dimensions.get("window");
const topPadding = height * 0.05;
///// Main funcitonal component for the Media Screen ---------------------------/
export default function MediaScreen() {
  const mediaItems = useSelector((state: RootState) => state.podcast.podcasts);
  const [loggedUser, setLoggedUser] = useState<UserData | null>(null);
  const [updateLoader, setUpdateLoader] = useState(false);
  //// Useeffect for fetching from the asyncstorage -------------/
  useEffect(() => {
    async function fetchLoggedUser() {
      const userResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userResponse.exists) {
        setLoggedUser(userResponse.data);
      }
    }
    fetchLoggedUser();
  }, []);

  //// Function for updating the podcast --------------------------/
  async function updatePodcastData(updateData: any) {
    // try {
    //   setUpdateLoader(true);
    //   let data = { ...updateData, userName: loggedUser?.name };
    //   const response = await podCastService.updatePodcasts(data);
    //   if (response.success) {
    //     // Replace the updated podcast in local state
    //     setData(
    //       mediaItems.map((podcast: PodcastInterface) =>
    //         podcast._id === response.data._id ? response.data : podcast
    //       )
    //     );
    //   } else {
    //     setSnackbarVisible(true);
    //     setSnackbarMessage(response.message);
    //   }
    // } catch (error: any) {
    //   setSnackbarVisible(true);
    //   setSnackbarMessage(error.message);
    // } finally {
    //   setUpdateLoader(false);
    // }
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Media" />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingTop: 0 }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {mediaItems.length === 0 && loggedUser ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 40,
                  minHeight: height * 0.6,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 24,
                    padding: 32,
                    alignItems: "center",
                    width: "100%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: "#F3EDFF",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="podcast"
                      size={40}
                      color="#9747FF"
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: theme.fonts.bold,
                      color: "#000",
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    No Media Available
                  </Text>

                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: theme.fonts.regular,
                      color: "#666",
                      textAlign: "center",
                      marginBottom: 24,
                    }}
                  >
                    We will update soon
                  </Text>

                  <Image
                    source={require("../../../assets/images/placeholderMedia.png")}
                    style={{
                      width: 200,
                      height: 200,
                      resizeMode: "contain",
                    }}
                  />
                </View>
              </View>
            ) : (
              mediaItems.map((item: PodcastInterface, index: number) => (
                <VideoCard
                  key={index}
                  podcast={item}
                  updatePodcastData={updatePodcastData}
                  loggedUser={loggedUser}
                />
              ))
            )}
          </ScrollView>

          {updateLoader && <FullScreenLoader />}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
