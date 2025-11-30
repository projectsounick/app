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
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { PodcastInterface } from "@/app/interfaces/podcastsInterface";
import { UserData } from "@/app/interfaces/UserInterface";

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
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
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
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "600" }}>
                No podcast selected
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: "#67C694",
                  borderRadius: 20,
                }}
                onPress={onClose}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Dash */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#000000",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 16,
                }}
              />

              {/* Header with Close and Share */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View style={{ width: 40 }} />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  Podcast
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSharePodcast}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#F8F8F8",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color="#9747FF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "#F8F8F8",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={onClose}
                  >
                    <Ionicons name="close" size={20} color="#333" />
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
                    height: 220,
                    borderRadius: 16,
                    marginBottom: 20,
                    overflow: "hidden",
                    backgroundColor: "#000",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  {!showVideo ? (
                    <TouchableOpacity
                      style={{
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => setShowVideo(true)}
                    >
                      <Image
                        source={{ uri: podcast.thumbnailImageLink }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          backgroundColor: "rgba(151, 71, 255, 0.9)",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons name="play" size={32} color="#FFFFFF" />
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
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#000",
                      marginBottom: 8,
                    }}
                  >
                    {podcast.podcastName}
                  </Text>
                </View>

                {/* Description */}
                <View
                  style={{
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    numberOfLines={expandedDesc ? undefined : 3}
                    style={{
                      fontSize: 14,
                      color: "#666",
                      lineHeight: 20,
                    }}
                  >
                    {podcast.description}
                  </Text>
                  {podcast.description && podcast.description.length > 100 && (
                    <TouchableOpacity
                      onPress={() => setExpandedDesc(!expandedDesc)}
                      style={{
                        marginTop: 8,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#9747FF",
                          fontWeight: "600",
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
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 24,
              width: "90%",
              maxWidth: 400,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              Preview Share
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#666",
                marginBottom: 20,
                textAlign: "center",
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
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: "700",
                      marginBottom: 2,
                    }}
                  >
                    @iness_wellness360_app
                  </Text>
                  <Text
                    style={{
                      color: "#67C694",
                      fontSize: 9,
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
                  padding: 14,
                  backgroundColor: "#F0F0F0",
                  borderRadius: 12,
                  alignItems: "center",
                }}
                onPress={() => setSharePreviewVisible(false)}
              >
                <Text
                  style={{
                    color: "#000",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 14,
                  backgroundColor: "#67C694",
                  borderRadius: 12,
                  alignItems: "center",
                }}
                onPress={handleShareFromPreview}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "700",
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
