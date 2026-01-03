import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";
import PodcastBottomSheetModal from "@/app/Modals/PodcastBottomSheetModal";
import { UserData } from "@/app/interfaces/UserInterface";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { setPodcasts } from "@/Slices/podcastSlice";
import { PAGINATION_LIMITS } from "@/app/shared/paginationLimits";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85; // Responsive card width - 85% of screen width to ensure at least one card is fully visible

interface PodcastMediaCardInterface {
  loggedUser: UserData | null;
}
function PodcastMediaCard({ loggedUser }: PodcastMediaCardInterface) {
  const theme = useGlobalTheme();
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
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
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
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="podcast"
              size={20}
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
          onPress={() => router.push("/(tabs)/dashboard/media")}
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 4, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}
      >
        {podCasts.slice(0, PAGINATION_LIMITS.PODCAST_INITIAL).map((podcast, index) => (
          <TouchableOpacity
            key={podcast._id ?? `podcast-${index}`}
            onPress={() => {
              setVisible(true);
              setSelectedMedia(podcast);
            }}
            style={{
              width: CARD_WIDTH,
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
          >
            {/* Thumbnail */}
            <View
              style={{
                width: "100%",
                height: 180,
                backgroundColor: theme.colors.backgroundSecondary,
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
                  fontSize: theme.fontSizes.regular,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                  marginBottom: 8,
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
                  marginBottom: 8,
                  fontWeight: theme.fontWeights.medium as "500",
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
                    fontSize: theme.fontSizes.small,
                    color: theme.colors.success,
                    fontFamily: theme.fonts.medium,
                    fontWeight: "600",
                    backgroundColor: theme.colors.greenLight,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                  }}
                >
                  {podcast.category}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.success,
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 12,
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
                  onPress={() => {
                    setVisible(true);
                    setSelectedMedia(podcast);
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
