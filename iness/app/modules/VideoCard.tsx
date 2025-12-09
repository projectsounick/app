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
        backgroundColor: "#FFFFFF",
        marginBottom: 20,
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
      {/* Thumbnail or Video */}
      <View
        style={{
          position: "relative",
          width: "100%",
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
          backgroundColor: "#FFFFFF",
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            marginTop: 4,
            color: "#000",
            fontFamily: theme.fonts.bold,
            marginBottom: 8,
          }}
        >
          {podcast.podcastName}
        </Text>

        {/* Collapsible Description */}
        <Text
          style={{
            marginTop: 4,
            fontSize: 14,
            color: "#666",
            fontFamily: theme.fonts.regular,
            lineHeight: 20,
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
              color: "#67C694",
              fontWeight: "600",
              marginTop: 6,
              fontFamily: theme.fonts.medium,
              fontSize: 13,
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
            activeOpacity={0.7}
          >
            {loggedUser?._id && podcast.likes.includes(loggedUser._id) ? (
              <AntDesign name={"heart"} size={20} color={"#F44336"} />
            ) : (
              <AntDesign name={"hearto"} size={20} color={"#666"} />
            )}
            <Text
              style={{
                marginLeft: 8,
                color: "#666",
                fontSize: 14,
                fontFamily: theme.fonts.medium,
              }}
            >
              {podcast.likes ? podcast.likes.length : 0}
            </Text>
          </TouchableOpacity>
          {showTooltipForPost === podcast._id ? (
            <ActivityIndicator size="small" color="#67C694" />
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
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
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
