import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import theme from "@/app/Theme/globalTheme";
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

  useEffect(() => {
    if (podcast) {
      setLikes(podcast.likes ?? []);
      setShowVideo(false);
      setExpandedDesc(false);
    }
  }, [podcast]);

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
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 16,
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
              <Text style={{ color: theme.colors.dark, fontSize: 16 }}>
                No podcast selected
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 8,
                }}
                onPress={onClose}
              >
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Dash */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#ccc",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: 12,
                }}
              />

              {/* Close Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#eee",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "flex-end",
                  marginBottom: 12,
                }}
                onPress={onClose}
              >
                <Ionicons name="close" size={20} color="#333" />
              </TouchableOpacity>

              {/* Scrollable Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {/* Thumbnail or Video */}
                {!showVideo ? (
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 12,
                      marginBottom: 16,
                      overflow: "hidden",
                      backgroundColor: "#000",
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
                    <Ionicons
                      name="play-circle"
                      size={48}
                      color="#fff"
                      style={{ position: "absolute" }}
                    />
                  </TouchableOpacity>
                ) : (
                  <Video
                    ref={videoRef}
                    source={{ uri: podcast.podcastLink }}
                    style={{
                      width: "100%",
                      height: 200,
                      backgroundColor: "#000",
                      borderRadius: 12,
                      marginBottom: 16,
                    }}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                  />
                )}

                {/* Title + Like */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: theme.fonts.bold,
                      color: theme.colors.dark,
                      marginBottom: 6,
                    }}
                  >
                    {podcast.podcastName}
                  </Text>
                  {/* <Ionicons
                    name={likes.length > 0 ? "heart" : "heart-outline"}
                    size={22}
                    color={likes.length > 0 ? "#E86A92" : "#999"}
                  /> */}
                </View>

                {/* Description */}
                <Text
                  numberOfLines={expandedDesc ? undefined : 3}
                  style={{
                    fontSize: 14,
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  {podcast.description}
                </Text>
                {podcast.description.length > 100 && (
                  <TouchableOpacity
                    onPress={() => setExpandedDesc(!expandedDesc)}
                    style={{
                      backgroundColor: "#67c694",

                      height: 30,
                      borderRadius: 16,
                      maxWidth: "30%",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        marginRight: 6,
                        fontFamily: theme.fonts.medium,
                      }}
                    >
                      {expandedDesc ? "Show less" : "Show more"}
                    </Text>
                    <Ionicons
                      name={expandedDesc ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={"#fff"}
                    />
                  </TouchableOpacity>
                )}

                {/* Example extra content */}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PodcastBottomSheetModal;
