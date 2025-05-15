import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Feather, AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";

import theme from "../Theme/globalTheme";
import {
  PodcastInterface,
  PodcastVideoCardPropsInterface,
} from "../interfaces/podcastsInterface";

import MediaComponentModal from "../Components/MediaComponents/MediaCommentModal";
import { useVideoPlayer, VideoView } from "expo-video";

//// Main function for the Video Card --------------------------------------------------------/
const VideoCard = ({
  podcast,
  loading,
  loggedUser,
  updatePodcastData,
}: PodcastVideoCardPropsInterface) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const [showVideo, setShowVideo] = useState(false);
  const player = useVideoPlayer(podcast.podcastLink, (player) => {
    if (showVideo) {
      player.play();
    }
  });

  //// Function for the user to handel the like of the video -----------/
  const handleLike = (podcast: PodcastInterface) => {
    /// calling the fallback function to update the like
    updatePodcastData({ podcastId: podcast._id, comment: null });
  };

  ////useEffect for fetching the checking with podcast like is there or not
  const handlePlay = () => {
    setShowVideo(true);
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        marginBottom: 20,
        borderRadius: 16,
        elevation: 3,
        overflow: "hidden",
      }}
    >
      {/* Thumbnail or Video */}
      <View style={{ position: "relative", width: "100%", height: 180 }}>
        {showVideo ? (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : (
          <>
            <Image
              source={{ uri: podcast.thumbnailImageLink }}
              style={{ width: "100%", height: 180 }}
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={handlePlay}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: [{ translateX: -25 }, { translateY: -25 }],
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 50,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="play" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        {/* Expand Button */}
      </View>

      {/* Podcast Details */}
      <View
        style={{
          backgroundColor: theme.colors.text,
          padding: 10,
          borderBottomStartRadius: 10,
          borderBottomEndRadius: 10,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSizes.medium,
            fontWeight: theme.fontWeights.bold,
            marginTop: 12,
            color: theme.colors.secondPrimary,
          }}
        >
          {podcast.podcastName}
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: theme.fontSizes.small,
            color: theme.colors.dark,
          }}
        >
          {podcast.description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => handleLike(podcast)}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            {loggedUser?._id && podcast.likes.includes(loggedUser._id) ? (
              <AntDesign name={"heart"} size={18} color={"red"} />
            ) : (
              <AntDesign name={"hearto"} size={18} color={"#444"} />
            )}

            <Text style={{ marginLeft: 6, color: "#444" }}>
              {podcast.likes ? podcast.likes.length : 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCommentModalVisible(true)}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <FontAwesome name="commenting-o" size={18} color="#444" />
            <Text style={{ marginLeft: 6, color: "#444" }}>
              {podcast.interactions.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#EAF5ED",
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Feather name="share-2" size={16} color="#34A853" />
            <Text
              style={{
                color: "#34A853",
                fontSize: 14,
                marginLeft: 6,
                fontWeight: "500",
              }}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Modal */}
      <MediaComponentModal
        handleAddComment={updatePodcastData}
        commentModalVisible={commentModalVisible}
        podcast={podcast}
        setCommentModalVisible={setCommentModalVisible}
      />
    </View>
  );
};

export default VideoCard;
