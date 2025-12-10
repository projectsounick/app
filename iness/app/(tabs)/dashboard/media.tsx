import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Image, ImageBackground, Dimensions, Platform, ActivityIndicator, TouchableOpacity } from "react-native";
import VideoCard from "@/app/modules/VideoCard";
import NormalHeader from "@/app/modules/NormalHeader";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { podCastService } from "@/app/services/podcast.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import FullScreenLoader from "@/app/modules/FullScreenLoader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { appendPodcasts } from "@/Slices/podcastSlice";
import { PAGINATION_LIMITS } from "@/app/shared/paginationLimits";

const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

///// Main functional component for the Media Screen ---------------------------/
export default function MediaScreen() {
  const dispatch = useDispatch();
  const podcasts = useSelector((state: RootState) => state.podcast.podcasts);
  const [loggedUser, setLoggedUser] = useState<UserData | null>(null);
  const [updateLoader, setUpdateLoader] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // Fetch logged user from AsyncStorage
  useEffect(() => {
    async function fetchLoggedUser() {
      const userResponse = await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (userResponse.exists) {
        setLoggedUser(userResponse.data);
      }
    }
    fetchLoggedUser();
  }, []);

  // Initialize lastId and hasMore from existing podcasts
  useEffect(() => {
    if (podcasts && podcasts.length > 0) {
      const lastPodcast: any = podcasts[podcasts.length - 1];
      if (lastPodcast?._id) {
        const lastIdValue = typeof lastPodcast._id === 'string' 
          ? lastPodcast._id 
          : (lastPodcast._id as any).toString();
        setLastId(lastIdValue);
      }
      // If we have the initial limit, there might be more
      setHasMore(podcasts.length >= PAGINATION_LIMITS.PODCAST_INITIAL);
    }
  }, []); // Only run once on mount

  // Fetch more podcasts when scrolling
  const fetchMorePodcasts = useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    if (!lastId) {
      setHasMore(false);
      return;
    }

    setLoadingMore(true);
    try {
      const response = await podCastService.getPodcastsPaginated(lastId, PAGINATION_LIMITS.PODCAST_LOAD_MORE);
      
      if (response.success && response.data) {
        const newPodcasts = response.data as PodcastInterface[];
        if (newPodcasts.length > 0) {
          // Use appendPodcasts to prevent duplicates
          dispatch(appendPodcasts(newPodcasts));
          
          // Update lastId from response
          if (response.lastId) {
            setLastId(response.lastId);
          } else {
            // Fallback: extract from last podcast
            const newLastPodcast: any = newPodcasts[newPodcasts.length - 1];
            if (newLastPodcast?._id) {
              const fallbackLastId = typeof newLastPodcast._id === 'string' 
                ? newLastPodcast._id 
                : newLastPodcast._id.toString();
              setLastId(fallbackLastId);
            }
          }
          
          setHasMore(response.hasMore === true);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more podcasts:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [lastId, hasMore, loadingMore, dispatch]);

  // Handle scroll to bottom for infinite scroll
  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchMorePodcasts();
    }
  }, [loadingMore, hasMore, fetchMorePodcasts]);

  // Function for updating the podcast
  async function updatePodcastData(updateData: any) {
    // Implementation can be added later if needed
  }

  // Create unique key extractor to prevent duplicate key warnings
  const keyExtractor = useCallback((item: PodcastInterface, index: number) => {
    // Use _id if available, otherwise use index with a prefix
    return item._id ? `podcast-${item._id}` : `podcast-index-${index}`;
  }, []);

  // Memoize podcasts to prevent unnecessary re-renders
  const displayPodcasts = useMemo(() => {
    // Remove duplicates based on _id
    const uniquePodcasts = podcasts.filter((podcast, index, self) => 
      podcast._id && index === self.findIndex(p => p._id === podcast._id)
    );
    return uniquePodcasts;
  }, [podcasts]);

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

          {displayPodcasts.length === 0 && loggedUser ? (
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
            <FlatList
              data={displayPodcasts}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => (
                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                  <VideoCard
                    podcast={item}
                    updatePodcastData={updatePodcastData}
                    loggedUser={loggedUser}
                  />
                </View>
              )}
              contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.3}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                loadingMore ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <ActivityIndicator size="small" color="#67C694" />
                  </View>
                ) : hasMore && displayPodcasts.length > 0 ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={fetchMorePodcasts}
                      style={{
                        backgroundColor: "#67C694",
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 20,
                        shadowColor: "#67C694",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <Text style={{ color: "#fff", fontFamily: theme.fonts.bold, fontSize: 14 }}>
                        Load More
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          )}

          {updateLoader && <FullScreenLoader />}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
