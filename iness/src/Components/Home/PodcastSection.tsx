import { safeRouter } from "@/src/utils/safeRouter";
import React, { memo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import PodcastBottomSheetModal from "@/src/Modals/PodcastBottomSheetModal";
import { UserData } from "@/src/interfaces/UserInterface";
import { PodcastInterface } from "@/src/interfaces/podcastsInterface";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { PAGINATION_LIMITS } from "@/src/shared/paginationLimits";
import CachedRemoteImage from "./CachedRemoteImage";

interface PodcastMediaCardInterface {
  loggedUser: UserData | null;
}
function PodcastMediaCard({ loggedUser }: PodcastMediaCardInterface) {
  const theme = useGlobalTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width * 0.78, 220), Math.max(width - 48, 220), 520);
  // Always fallback to [] if no data
  const podCasts = useSelector((state: RootState) => state.podcast.podcasts);
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
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
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
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              name="podcast"
              size={16}
                    color={theme.colors.secondPrimary}
            />
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontFamily: theme.fonts.bold,
              color: theme.colors.text,
              fontWeight: "700",
            }}
          >
            Media / Podcasts
          </Text>
        </View>

        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => safeRouter.navigate("/(tabs)/dashboard/media")}
          accessibilityRole="button"
          accessibilityLabel="See all podcasts"
        >
          <Text
            style={{
              fontSize: theme.fontSizes.regularSmall,
              fontFamily: theme.fonts.medium,
              color: theme.colors.textSecondary,
              marginRight: 4,
              fontWeight: theme.fontWeights.medium as "500",
            }}
          >
            See All
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Podcast Carousel */}
      <FlatList
        data={podCasts.slice(0, PAGINATION_LIMITS.PODCAST_INITIAL)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 12, paddingTop: 6, paddingBottom: 6 }}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={3}
        keyExtractor={(podcast, index) => podcast._id ?? `podcast-${index}`}
        renderItem={({ item: podcast, index }) => (
          <TouchableOpacity
            onPress={() => {
              setVisible(true);
              setSelectedMedia(podcast);
            }}
            style={{
              width: cardWidth,
              marginRight: 16,
              marginLeft: index === 0 ? 0 : 0,
              marginTop: 4,
              marginBottom: 4,
              backgroundColor: theme.colors.background,
              borderRadius: 20,
              overflow: "hidden",
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
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open podcast ${podcast.podcastName}`}
            accessibilityHint="Opens podcast details and playback controls"
          >
            {/* Thumbnail */}
            <View
              style={{
                width: "100%",
                height: 160,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CachedRemoteImage
                uri={podcast.thumbnailImageLink}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                accessibilityLabel={`${podcast.podcastName} thumbnail`}
                recyclingKey={podcast._id}
              />
            </View>

            {/* Content */}
            <View style={{ padding: 12 }}>
              <Text
                style={{
                  fontSize: theme.fontSizes.regular,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                  marginBottom: 6,
                  fontWeight: theme.fontWeights.bold as "700",
                }}
                numberOfLines={1}
              >
                {podcast.podcastName}
              </Text>
              <Text
                style={{
                  fontSize: theme.fontSizes.regularSmall,
                  color: theme.colors.textSecondary,
                  marginBottom: 6,
                  fontWeight: theme.fontWeights.medium as "500",
                  lineHeight: 18,
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
                  marginTop: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.small,
                    color: theme.colors.success,
                    fontFamily: theme.fonts.medium,
                    fontWeight: "600",
                    backgroundColor: theme.colors.greenLight,
                    paddingVertical: 3,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                  }}
                >
                  {podcast.category}
                </Text>

                <View
                  style={{
                    backgroundColor: theme.colors.success,
                    paddingVertical: 5,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
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
                  <Ionicons
                    name="play-circle"
                    size={12}
                    color={theme.colors.textWhite}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      color: theme.colors.textWhite,
                      fontFamily: theme.fonts.bold,
                      fontSize: theme.fontSizes.small,
                      fontWeight: theme.fontWeights.bold as "700",
                    }}
                  >
                    Watch
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

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
