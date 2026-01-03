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
  StyleSheet,
} from "react-native";
import { Feather, AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Linking, Alert } from "react-native";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";
import {
  PodcastInterface,
  PodcastVideoCardPropsInterface,
} from "../interfaces/podcastsInterface";

import MediaComponentModal from "@/app/Modals/MediaCommentModal";
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
  const theme = useGlobalTheme();
  const styles = getStyles(theme);
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
    <View style={styles.cardContainer}>
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
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#9747FF", "#844ACF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playButton}
              >
                <Ionicons name="play" size={32} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </ImageBackground>
        )}
      </View>

      {/* Podcast Details */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          {podcast.podcastName}
        </Text>

        {/* Collapsible Description */}
        <Text
          style={styles.description}
          numberOfLines={expandedIndex === podcast._id ? undefined : 2}
        >
          {podcast.description?.replace(/\\n/g, "\n")}
        </Text>

        <TouchableOpacity
          onPress={() =>
            setExpandedIndex(expandedIndex === podcast._id ? null : podcast._id)
          }
          activeOpacity={0.7}
        >
          <Text style={styles.showMoreText}>
            {expandedIndex === podcast._id ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => handleLike(podcast)}
            style={styles.likeButton}
            activeOpacity={0.7}
          >
            {loggedUser?._id && podcast.likes.includes(loggedUser._id) ? (
              <AntDesign name={"heart"} size={20} color={"#F44336"} />
            ) : (
              <AntDesign name={"hearto"} size={20} color={"#666"} />
            )}
            <Text style={styles.likeText}>
              {podcast.likes ? podcast.likes.length : 0}
            </Text>
          </TouchableOpacity>
          {showTooltipForPost === podcast._id ? (
            <ActivityIndicator size="small" color={theme.colors.secondPrimary} />
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

const getStyles = (theme: any) => StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  playButton: {
    borderRadius: 35,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  contentContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    marginTop: 4,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  description: {
    marginTop: 4,
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    lineHeight: 20,
  },
  showMoreText: {
    color: theme.colors.secondPrimary,
    fontWeight: theme.fontWeights.medium as "500",
    marginTop: 6,
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.regularSmall,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: {
    marginLeft: 8,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.medium,
  },
});

export default VideoCard;
