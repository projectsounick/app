import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import VideoCard from "@/src/modules/VideoCard";

import SmallHeader from "@/src/modules/SmallHeader";
import { PodcastInterface } from "@/src/interfaces/podcastsInterface";
import { podCastService } from "@/src/services/podcast.service";
import useGetDataHook from "@/hooks/useFetchHook";
import ShimmerCard from "@/src/modules/Shimmer/ShimmerCard";

import theme from "@/src/Theme/globalTheme";
import CustomSnackbar from "@/src/modules/Snackbar";
import { UserData } from "@/src/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import FullScreenLoader from "@/src/modules/FullScreenLoader";
import useFetchStoreDataHook from "@/hooks/useStoreFetchHook";
import { SafeAreaView } from "react-native-safe-area-context";
///// Main funcitonal component for the Media Screen ---------------------------/
export default function MediaScreen() {
  const {
    data: mediaItems,
    loading,
    error,
    snackbarVisible,
    snackbarMessage,
    setSnackbarMessage,
    setSnackbarVisible,
    setData,
  } = useFetchStoreDataHook("media", podCastService.getPodcasts);

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
    try {
      setUpdateLoader(true);
      let data = { ...updateData, userName: loggedUser?.name };
      const response = await podCastService.updatePodcasts(data);
      if (response.success) {
        // Replace the updated podcast in local state
        setData(
          mediaItems.map((podcast: PodcastInterface) =>
            podcast._id === response.data._id ? response.data : podcast
          )
        );
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage(response.message);
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    } finally {
      setUpdateLoader(false);
    }
  }
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
      edges={["left", "right"]}
    >
      {/* <SmallHeader title="Media" weightShow={false} />
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        scrollEventThrottle={16}
      >
        {loading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : mediaItems.length === 0 && loggedUser ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                height: "80%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.medium,
                    fontFamily: theme.fonts.bold,
                    color: theme.colors.normal,

                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  No Medial available
                </Text>

                <Text
                  style={{
                    fontSize: theme.fontSizes.regularSmall,
                    fontWeight: "500",
                    color: theme.colors.text,

                    textAlign: "center",
                  }}
                >
                  we will update soon
                </Text>
              </View>
              <Image
                source={require("../../../../assets/images/placeholderMedia.png")}
                style={{
                  width: 250,
                  height: 250,
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
              loading={loading}
              updatePodcastData={updatePodcastData}
              loggedUser={loggedUser}
            />
          ))
        )}
      </ScrollView>

      {updateLoader && <FullScreenLoader />} */}
    </SafeAreaView>
  );
}
