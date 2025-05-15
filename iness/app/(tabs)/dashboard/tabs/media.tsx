import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import VideoCard from "@/app/modules/VideoCard";

import SmallHeader from "@/app/modules/SmallHeader";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { podCastService } from "@/app/services/podcast.service";
import useGetDataHook from "@/hooks/useFetchHook";
import SimmerSkeletonCard from "@/app/modules/SimmerCard";

import theme from "@/app/Theme/globalTheme";
import CustomSnackbar from "@/app/modules/Snackbar";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import FullScreenLoader from "@/app/modules/FullScreenLoader";
///// Main funcitonal component for the Media Screen ---------------------------/
export default function MediaScreen() {
  const {
    data,
    loading,
    error,
    fetchData,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
    setData,
  } = useGetDataHook(podCastService.getPodcasts);
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
        setData((prevData: PodcastInterface[]) =>
          prevData.map((podcast) =>
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
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <SmallHeader title="Iness TV" />
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        scrollEventThrottle={16}
      >
        {loading ? (
          <>
            <SimmerSkeletonCard />
            <SimmerSkeletonCard />
          </>
        ) : data.length === 0 && loggedUser ? (
          <Text>No podcast available. We will be uploading soon.</Text>
        ) : (
          data.map((item: PodcastInterface, index: number) => (
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
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
        onDismiss={() => setSnackbarVisible(false)}
      />
      {updateLoader && <FullScreenLoader />}
    </View>
  );
}
