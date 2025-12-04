import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
  Platform,
  Pressable,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const VIDEO_FLAG = "promoVideoShown";

const PromoVideoModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<Video | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if video has been shown before
        const flag = await AsyncStorage.getItem(VIDEO_FLAG);
        if (flag === "true") {
          // Video already shown, don't show again
          return;
        }

        // Fetch video data after a delay
        setTimeout(async () => {
          try {
            const res = await fetch(
              "https://inessstorage.blob.core.windows.net/iness-public/promotionVideos.json"
            );
            const data = await res.json();
            const activeVideo = data.find((item: any) => item.active);
            if (activeVideo) {
              setVideoUrl(activeVideo.url);
              setShowModal(true);
              setTimeout(() => setLoading(false), 2000);
            }
          } catch (err) {
            console.error("Error fetching promo video:", err);
            setLoading(false);
          }
        }, 5000);
      } catch (err) {
        console.error("Error checking AsyncStorage:", err);
      }
    };

    fetchData();
  }, []);

  const handleClose = async () => {
    try {
      // Store flag in AsyncStorage - show only once
      await AsyncStorage.setItem(VIDEO_FLAG, "true");
      setShowModal(false);
    } catch (err) {
      console.error("Error saving flag:", err);
      setShowModal(false);
    }
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Error toggling play/pause:", err);
    }
  };

  const handleExpand = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Modal transparent visible={showModal} animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPressable} onPress={!isFullscreen ? handleClose : undefined} />
        <View style={[styles.modalContainer, isFullscreen && styles.modalContainerFullscreen]}>
          {!isFullscreen && (
            <>
              {/* Top Handle Bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.headerContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="videocam-outline" size={24} color="#9747FF" />
                </View>
                <Text style={styles.modalTitle}>Promotional Video</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Fullscreen Header */}
          {isFullscreen && (
            <View style={styles.fullscreenHeader}>
              <Text style={styles.fullscreenTitle}>Promotional Video</Text>
              <TouchableOpacity onPress={handleClose} style={styles.fullscreenCloseButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Video Container */}
          <View style={[styles.videoContainer, isFullscreen && styles.videoContainerFullscreen]}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#67C694" />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            ) : videoUrl ? (
              <View style={[styles.videoWrapper, isFullscreen && styles.videoWrapperFullscreen]}>
                <Video
                  ref={(ref: any) => (videoRef.current = ref)}
                  source={{ uri: videoUrl }}
                  shouldPlay={isPlaying}
                  useNativeControls={false}
                  resizeMode={ResizeMode.CONTAIN}
                  style={styles.video}
                  onLoad={() => setLoading(false)}
                />
                {/* Play/Pause Overlay Button (Center) */}
                <TouchableOpacity
                  onPress={handlePlayPause}
                  style={styles.playPauseButton}
                  activeOpacity={0.8}
                >
                  <View style={styles.playPauseIconContainer}>
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>

                {/* Video Controls Overlay (Bottom Right) */}
                <View style={styles.videoControlsOverlay}>
                  {/* Expand/Contract Button */}
                  <TouchableOpacity
                    onPress={handleExpand}
                    style={styles.controlButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.controlIconContainer}>
                      <Ionicons
                        name={isFullscreen ? "contract" : "expand"}
                        size={24}
                        color="#FFFFFF"
                      />
                    </View>
                  </TouchableOpacity>

                </View>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#999" />
                <Text style={styles.errorText}>Video not available</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PromoVideoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: Dimensions.get("window").width - 40,
    maxHeight: Dimensions.get("window").height * 0.85,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    overflow: "hidden",
  },
  modalContainerFullscreen: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    maxWidth: Dimensions.get("window").width,
    maxHeight: Dimensions.get("window").height,
    borderRadius: 0,
    borderWidth: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "relative",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  videoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainerFullscreen: {
    paddingHorizontal: 0,
    marginBottom: 0,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },
  videoWrapperFullscreen: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    aspectRatio: undefined,
    borderRadius: 0,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playPauseButton: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  playPauseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoControlsOverlay: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    gap: 12,
    zIndex: 10,
  },
  controlButton: {
    // Touchable area
  },
  controlIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  fullscreenHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 20,
  },
  fullscreenTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  fullscreenCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
