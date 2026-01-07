import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  ImageBackground,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { UserData } from "@/app/interfaces/UserInterface";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { height } = Dimensions.get("window");

interface PodcastBottomSheetModalProps {
  podcast: PodcastInterface | null;
  onClose: () => void;
  loggedUser: UserData | null;
  visible: boolean;
}

const PodcastBottomSheetModal: React.FC<PodcastBottomSheetModalProps> = ({
  podcast,
  onClose,
  visible,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const videoRef = useRef<Video>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false);
  const sharePreviewRef = useRef<View>(null);

  useEffect(() => {
    if (podcast) {
      setLikes(podcast.likes ?? []);
      setShowVideo(false);
      setExpandedDesc(false);
    }
  }, [podcast]);

  const handleShareFromPreview = async () => {
    try {
      if (!podcast?.thumbnailImageLink || !sharePreviewRef.current) {
        Alert.alert("Error", "Unable to capture image. Please try again.");
        return;
      }

      // Wait a bit for the view to render
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture the view with logo and Instagram handle overlay
      const uri = await captureRef(sharePreviewRef.current, {
        format: "jpg",
        quality: 0.9,
        result: "tmpfile",
      });

      if (!uri) {
        Alert.alert("Error", "Failed to capture image. Please try again.");
        return;
      }

      const instagramHandle =
        "https://www.instagram.com/iness_wellness360_app?igsh=MTlodmZuOXQ0OW9wYQ==";
      const shareText = podcast.description
        ? `🏋️ ${podcast.podcastName}\n\n${podcast.description}\n\n💪 Follow us: ${instagramHandle}\n\n#Iness #Fitness #Wellness`
        : `🏋️ ${podcast.podcastName}\n\n💪 Follow us: ${instagramHandle}\n\n#Iness #Fitness #Wellness`;

      // Close preview modal
      setSharePreviewVisible(false);

      // Share the captured image with overlays
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share to Instagram",
          UTI: "public.jpeg",
        });
      } else {
        await Share.share({
          message: shareText,
          title: "Share from Iness",
          url: Platform.OS === "ios" ? uri : undefined,
        });
      }
    } catch (error: any) {
      console.error("Error capturing and sharing:", error);
      Alert.alert("Error", "Failed to share image. Please try again.");
      setSharePreviewVisible(false);
    }
  };

  const handleSharePodcast = async () => {
    try {
      if (podcast?.thumbnailImageLink) {
        // Show preview modal with logo and Instagram handle overlay
        setSharePreviewVisible(true);
      } else {
        // Text-only share
        const instagramHandle =
          "https://www.instagram.com/iness_wellness360_app?igsh=MTlodmZuOXQ0OW9wYQ==";
        const shareText = podcast?.description
          ? `🏋️ ${podcast.podcastName}\n\n${podcast.description}\n\n💪 Follow us: ${instagramHandle}\n\n#Iness #Fitness #Wellness`
          : `🏋️ ${podcast?.podcastName}\n\n💪 Follow us: ${instagramHandle}\n\n#Iness #Fitness #Wellness`;
        await Share.share({
          message: shareText,
          title: "Share from Iness",
        });
      }
    } catch (error: any) {
      console.error("Error sharing podcast:", error);
      Alert.alert("Error", "Failed to share podcast. Please try again.");
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            height: height * 0.7, // 70% height
            backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {!podcast ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCardLight,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialCommunityIcons name="podcast" size={40} color={theme.colors.secondPrimary} />
              </View>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.medium,
                  fontWeight: theme.fontWeights.bold as "700",
                  marginBottom: 8,
                }}
              >
                No podcast selected
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: theme.colors.success,
                  borderRadius: 16,
                  shadowColor: theme.colors.success,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={onClose}
              >
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontWeight: theme.fontWeights.bold as "700",
                    fontSize: theme.fontSizes.regular,
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Handle Bar */}
              <View
                style={{
                  width: 50,
                  height: 5,
                  backgroundColor: isDark ? theme.colors.border : "#ccc",
                  borderRadius: 3,
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />

              {/* Header with Close and Share */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCardLight,
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
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.text,
                    }}
                  >
                    Podcast
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSharePodcast}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isDark ? theme.colors.background : theme.colors.greenLight,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color={theme.colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={onClose}
                  >
                    <Ionicons name="close" size={20} color={isDark ? theme.colors.text : "#666"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {/* Thumbnail or Video */}
                <View
                  style={{
                    width: "100%",
                    height: 240,
                    marginBottom: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!showVideo ? (
                    <TouchableOpacity
                      style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                      onPress={() => setShowVideo(true)}
                    >
                      <Image
                        source={{ uri: podcast.thumbnailImageLink }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          position: "absolute",
                          width: 70,
                          height: 70,
                          borderRadius: 35,
                          backgroundColor: theme.colors.secondPrimary,
                          justifyContent: "center",
                          alignItems: "center",
                          shadowColor: theme.colors.secondPrimary,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          elevation: 5,
                        }}
                      >
                        <Ionicons name="play" size={36} color={theme.colors.textWhite} />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <Video
                      ref={videoRef}
                      source={{ uri: podcast.podcastLink }}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls
                    />
                  )}
                </View>

                {/* Title */}
                <View
                  style={{
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: theme.fontSizes.large,
                      fontWeight: theme.fontWeights.bold as "700",
                      color: theme.colors.text,
                      lineHeight: 30,
                    }}
                  >
                    {podcast.podcastName}
                  </Text>
                </View>

                {/* Description Card */}
                <View
                  style={{
                    backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCard,
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text
                    numberOfLines={expandedDesc ? undefined : 3}
                    style={{
                      fontSize: theme.fontSizes.regular,
                      color: theme.colors.textSecondary,
                      lineHeight: 24,
                      fontWeight: theme.fontWeights.regular as "400",
                    }}
                  >
                    {podcast.description}
                  </Text>
                  {podcast.description && podcast.description.length > 100 && (
                    <TouchableOpacity
                      onPress={() => setExpandedDesc(!expandedDesc)}
                      style={{
                        marginTop: 12,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: theme.fontSizes.regularSmall,
                          color: theme.colors.secondPrimary,
                          fontWeight: theme.fontWeights.bold as "700",
                        }}
                      >
                        {expandedDesc ? "Show less" : "Show more"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Example extra content */}
              </ScrollView>
            </>
          )}
        </View>
      </View>

      {/* Share Preview Modal */}
      <Modal
        visible={sharePreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSharePreviewVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
              borderRadius: 24,
              padding: 24,
              width: "90%",
              maxWidth: 400,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCardLight,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="share-social" size={20} color={theme.colors.secondPrimary} />
              </View>
              <Text
                style={{
                  fontSize: theme.fontSizes.large,
                  fontWeight: theme.fontWeights.bold as "700",
                  color: theme.colors.text,
                }}
              >
                Preview Share
              </Text>
            </View>
            <Text
              style={{
                fontSize: theme.fontSizes.regularSmall,
                color: theme.colors.textSecondary,
                marginBottom: 20,
                textAlign: "center",
                fontWeight: theme.fontWeights.medium as "500",
              }}
            >
              Logo and Instagram handle will be visible when shared
            </Text>

            <View
              ref={sharePreviewRef}
              collapsable={false}
              style={{
                width: "100%",
                aspectRatio: 1,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#000",
                marginBottom: 20,
              }}
            >
              <ImageBackground
                source={{ uri: podcast?.thumbnailImageLink || "" }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                resizeMode="cover"
              >
                {/* Logo Overlay - Top Left */}
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: 12,
                    padding: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={require("@/assets/images/logowithoutbackground.png")}
                    style={{
                      width: 50,
                      height: 50,
                    }}
                    resizeMode="contain"
                  />
                </View>

                {/* Instagram Handle Overlay - Bottom Right */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    borderRadius: 12,
                    padding: 12,
                    alignItems: "flex-end",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.textWhite,
                      fontSize: theme.fontSizes.small,
                      fontWeight: theme.fontWeights.bold as "700",
                      marginBottom: 2,
                    }}
                  >
                    @iness_wellness360_app
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.success,
                      fontSize: theme.fontSizes.small,
                    }}
                  >
                    instagram.com/iness_wellness360_app
                  </Text>
                </View>
              </ImageBackground>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundSecondary,
                  borderRadius: 16,
                  alignItems: "center",
                  marginRight: 8,
                }}
                onPress={() => setSharePreviewVisible(false)}
              >
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.medium as "500",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 16,
                  backgroundColor: theme.colors.success,
                  borderRadius: 16,
                  alignItems: "center",
                  shadowColor: theme.colors.success,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                onPress={handleShareFromPreview}
              >
                <Text
                  style={{
                    color: theme.colors.textWhite,
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.bold as "700",
                  }}
                >
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default PodcastBottomSheetModal;
