import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import PodcastBottomSheetModal from "./PodcastBottomSheetModal";
import { UserData } from "@/app/interfaces/UserInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPodcasts } from "@/Slices/podcastSlice";
import { PAGINATION_LIMITS } from "@/app/shared/paginationLimits";

import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface PodcastMediaCardInterface {
  loggedUser: UserData | null;
}
function PodcastMediaCard({ loggedUser }: PodcastMediaCardInterface) {
  // Always fallback to [] if no data
  const podCasts = useSelector((state: RootState) => state.podcast.podcasts);
  const router = useRouter();
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<PodcastInterface | null>(
    null
  );

  const onClose = () => {
    setVisible(false);
    setSelectedMedia(null);
  };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="podcast"
              size={20}
              color="#9747FF"
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: theme.fonts.bold,
              color: "#000",
              fontWeight: "700",
            }}
          >
            Media / Podcasts
          </Text>
        </View>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("/(tabs)/dashboard/media")}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: theme.fonts.medium,
              color: "#666",
              marginRight: 4,
              fontWeight: "600",
            }}
          >
            See All
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Podcast Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {podCasts.slice(0, PAGINATION_LIMITS.PODCAST_INITIAL).map((podcast, index) => (
          <TouchableOpacity
            key={podcast._id ?? `podcast-${index}`}
            onPress={() => {
              setVisible(true);
              setSelectedMedia(podcast);
            }}
            style={{
              width: 320,
              marginRight: 16,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#F5F5F5",
            }}
          >
            {/* Thumbnail */}
            <View
              style={{
                width: "100%",
                height: 180,
                backgroundColor: "#F8F8F8",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{ uri: podcast.thumbnailImageLink }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>

            {/* Content */}
            <View style={{ padding: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: theme.fonts.bold,
                  color: "#000",
                  marginBottom: 8,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {podcast.podcastName}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  marginBottom: 8,
                  fontWeight: "500",
                  lineHeight: 20,
                }}
                numberOfLines={2}
              >
                {podcast.description}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#67C694",
                    fontFamily: theme.fonts.medium,
                    fontWeight: "600",
                    backgroundColor: "#E8F5E9",
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                  }}
                >
                  {podcast.category}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#67C694",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#67C694",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => {
                    setVisible(true);
                    setSelectedMedia(podcast);
                  }}
                >
                  <Ionicons
                    name="play-circle"
                    size={14}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: theme.fonts.bold,
                      fontSize: 14,
                      fontWeight: "700",
                    }}
                  >
                    Watch
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal */}
      {visible && selectedMedia && (
        <PodcastBottomSheetModal
          podcast={selectedMedia}
          onClose={onClose}
          visible={visible}
          loggedUser={loggedUser}
        />
      )}
    </View>
  );
}

export default memo(PodcastMediaCard);
