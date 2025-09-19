import React, { use, useEffect, useRef, useState } from "react";
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
  ImageBackground,
  UIManager,
  LayoutAnimation,
  ActivityIndicator,
} from "react-native";
import { Feather, AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";

import { Linking, Alert } from "react-native";
import theme from "../Theme/globalTheme";
import {
  PodcastInterface,
  PodcastVideoCardPropsInterface,
} from "../interfaces/podcastsInterface";

import MediaComponentModal from "../Components/MediaComponents/MediaCommentModal";
import { useVideoPlayer, VideoView } from "expo-video";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
//// Main function for the Video Card --------------------------------------------------------/
const VideoCard = ({
  podcast,

  loggedUser,
  updatePodcastData,
}: PodcastVideoCardPropsInterface) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<any>(null);
  const [showMenuForPost, setShowMenuForPost] = useState<any>();
  const [showVideo, setShowVideo] = useState(false);
  const [showTooltipForPost, setShowTooltipForPost] = useState<string | null>(
    null
  );
  const [toolTipActionType, setToolTipActionType] = useState("");

  async function toolTipAction(postDetails: any, type: string) {
    try {
      setShowTooltipForPost(postDetails._id);

      await new Promise((resolve) => setTimeout(resolve, 3000));
      let complainerId;
      setToolTipActionType(type);
      let loggedUser =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (loggedUser.exists) {
        complainerId = loggedUser.data._id;
      }

      const response = await userService.addUserComplain({
        complainType: "media",

        complainerId: complainerId,
        medianName: podcast.podcastName,
      });

      return;
    } catch (error) {
    } finally {
      setShowTooltipForPost(null);
      alert(
        type === "complain"
          ? "Your complain has been recived by us ,we will have a look"
          : "You have successfully blocked this user"
      );
      setShowMenuForPost(null);
    }
  }

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
  const [imageHeight, setImageHeight] = useState(250);

  useEffect(() => {
    if (podcast?.thumbnailImageLink) {
      Image.getSize(podcast.thumbnailImageLink, (width, height) => {
        const screenWidth = Dimensions.get("window").width;
        const scaleFactor = height / width;
        setImageHeight(screenWidth * scaleFactor); // keep aspect ratio
      });
    }
  }, [podcast?.thumbnailImageLink]);

  return (
    <View
      style={{
        backgroundColor: "#000",
        marginBottom: 20,
        borderRadius: 16,
        elevation: 3,
        overflow: "hidden",
      }}
    >
      {/* Thumbnail or Video */}
      <View
        style={{
          position: "relative",

          width: 380,
          height: 220,
        }}
      >
        {showVideo ? (
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%", backgroundColor: "black" }}
            contentFit="cover" // Ensures the video fills the view
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : (
          <ImageBackground
            source={{ uri: podcast.thumbnailImageLink }}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            resizeMode="cover" // prevent cropping
          >
            <TouchableOpacity
              onPress={handlePlay}
              style={{
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
          </ImageBackground>
        )}
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
            color: "#000",
            fontFamily: theme.fonts.bold,
          }}
        >
          {podcast.podcastName}
        </Text>

        {/* Collapsible Description */}
        <Text
          style={{
            marginTop: 6,
            fontSize: theme.fontSizes.small,
            color: theme.colors.dark,
            fontFamily: theme.fonts.meidium,
          }}
          numberOfLines={expandedIndex === podcast._id ? undefined : 2}
        >
          {podcast.description?.replace(/\\n/g, "\n")}
        </Text>

        <TouchableOpacity
          onPress={() =>
            setExpandedIndex(expandedIndex === podcast._id ? null : podcast._id)
          }
        >
          <Text
            style={{
              color: "#1E90FF",
              fontWeight: "500",
              marginTop: 4,
              fontFamily: theme.fonts.medium,
            }}
          >
            {expandedIndex === podcast._id ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>

        {/* Actions */}
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
          {showTooltipForPost === podcast._id ? (
            <ActivityIndicator />
          ) : (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Complain about Post",
                  "Are you sure you want to complain about this post?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Yes, Complain",
                      onPress: () => toolTipAction(podcast, "complain"),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#000" />
            </TouchableOpacity>
          )}
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
