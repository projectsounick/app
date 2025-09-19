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

import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;
const SPACING = 14;

const demoPodcasts: PodcastInterface[] = [
  {
    _id: "p1",
    podcastName: "Mindful Fitness",
    podcastLink: "https://example.com/podcast1",
    category: "Health",
    createdBy: "u1",
    interactions: [],
    thumbnailImageLink:
      "https://images.unsplash.com/photo-1603415526960-f8f0d1c16c49?w=600",
    description: "Learn how mindfulness can improve your workouts.",
    likes: [],
  },
  {
    _id: "p2",
    podcastName: "Strength Talks",
    podcastLink: "https://example.com/podcast2",
    category: "Workout",
    createdBy: "u2",
    interactions: [],
    thumbnailImageLink:
      "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=600",
    description: "Exploring strength training and personal stories.",
    likes: [],
  },
  {
    _id: "p3",
    podcastName: "Healthy Habits",
    podcastLink: "https://example.com/podcast3",
    category: "Lifestyle",
    createdBy: "u3",
    interactions: [],
    thumbnailImageLink:
      "https://images.unsplash.com/photo-1544717305-996b815c338c?w=600",
    description: "Tips and habits to build a healthier lifestyle and many more",
    likes: [],
  },
];
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
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
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
          <MaterialCommunityIcons
            name="podcast"
            size={22}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontFamily: theme.fonts.bold,
              color: theme.colors.dark,
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
              color: "#000",
              marginRight: 4,
            }}
          >
            See All
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Podcast Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: SPACING }}
      >
        {podCasts.map((podcast, index) => (
          <View
            key={podcast._id ?? `podcast-${index}`}
            style={{
              width: CARD_WIDTH,
              marginRight: SPACING,
              backgroundColor: "#f9f9f9",
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
            }}
          >
            {/* Thumbnail */}
            <Image
              source={{ uri: podcast.thumbnailImageLink }}
              style={{ width: "100%", height: 140 }}
              resizeMode="cover"
            />

            {/* Content */}
            <View style={{ padding: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.dark,
                  marginBottom: 4,
                }}
                numberOfLines={1}
              >
                {podcast.podcastName}
              </Text>
              <Text
                style={{ fontSize: 13, color: "#555", marginBottom: 6 }}
                numberOfLines={2}
              >
                {podcast.description}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#E86A92",
                  fontFamily: theme.fonts.medium,
                  marginBottom: 8,
                }}
              >
                {podcast.category}
              </Text>

              <TouchableOpacity
                style={{
                  backgroundColor: "#67c694",
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setVisible(true);
                  setSelectedMedia(podcast);
                }}
              >
                <Ionicons
                  name="play-circle"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: theme.fonts.bold,
                    fontSize: 14,
                  }}
                >
                  Watch
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
