import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
  Pressable,
  AppState,
  AppStateStatus,
  Platform,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import {
  promotionalVideoService,
  PromotionalVideoItem,
} from "../services/promotionalVideo.service";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const PromoVideoModal = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [showModal, setShowModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<PromotionalVideoItem | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<Video | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocused = useIsFocused();

  const stopPlayback = useCallback(async (shouldUnload: boolean = false) => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.pauseAsync();
    } catch (err) {
      console.error("Error pausing video:", err);
    }

    if (shouldUnload) {
      try {
        await videoRef.current.unloadAsync();
      } catch (err) {
        console.error("Error unloading video:", err);
      }
    }
  }, []);

  useEffect(() => {
    const checkForNewVideo = async () => {
      try {
        setLoading(true);
        // Check for new promotional video with higher number
        const newVideo = await promotionalVideoService.checkForNewPromotionalVideo();
        
        if (newVideo) {
          setCurrentVideo(newVideo);
          setVideoUrl(newVideo.url);
          setShowModal(true);
          setTimeout(() => setLoading(false), 2000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking for promotional video:", err);
        setLoading(false);
      }
    };

    // Check for new video after a delay
    checkTimerRef.current = setTimeout(() => {
      checkForNewVideo();
    }, 5000);

    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
      stopPlayback(true);
    };
  }, [stopPlayback]);

  useEffect(() => {
    if (!isFocused || !showModal) {
      setIsPlaying(false);
      stopPlayback(false);
    }
  }, [isFocused, showModal, stopPlayback]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState !== "active") {
        setIsPlaying(false);
        stopPlayback(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [stopPlayback]);

  const handleClose = async () => {
    try {
      setIsPlaying(false);
      setIsFullscreen(false);
      await stopPlayback(true);
      
      // Close modal immediately to prevent UI freeze
      setShowModal(false);
      
      // Store the entire video object in AsyncStorage in background (non-blocking)
      if (currentVideo) {
        promotionalVideoService.storePromotionalVideo(currentVideo).catch((err) => {
          console.error("Error saving promotional video:", err);
        });
      }
    } catch (err) {
      console.error("Error closing modal:", err);
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
                  <Ionicons name="school-outline" size={28} color={theme.colors.secondPrimary} />
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.modalTitle}>Watch & Learn</Text>
                  <Text style={styles.modalSubtitle}>Discover what's new</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Fullscreen Header */}
          {isFullscreen && (
            <View style={styles.fullscreenHeader}>
              <View style={styles.fullscreenTitleContainer}>
                <Ionicons name="school-outline" size={24} color={theme.colors.secondPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.fullscreenTitle}>Watch & Learn</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.fullscreenCloseButton}>
                <Ionicons name="close" size={24} color={theme.colors.textWhite} />
              </TouchableOpacity>
            </View>
          )}

          {/* Video Container */}
          <View style={[styles.videoContainer, isFullscreen && styles.videoContainerFullscreen]}>
            {loading ? (
              <View style={styles.loaderContainer}>
                <View style={styles.loaderIconContainer}>
                  <Ionicons name="school-outline" size={48} color={theme.colors.secondPrimary} />
                </View>
                <ActivityIndicator size="large" color={theme.colors.secondPrimary} style={{ marginTop: 16 }} />
                <Text style={styles.loadingText}>Preparing your video...</Text>
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
                  onError={(error) => {
                    console.error("Video error:", error);
                    setLoading(false);
                  }}
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
                      color={theme.colors.textWhite}
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
                        size={18}
                        color={theme.colors.textWhite}
                      />
                    </View>
                  </TouchableOpacity>

                </View>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textMuted} />
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

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    width: "100%",
    maxWidth: Dimensions.get("window").width - 20,
    maxHeight: Dimensions.get("window").height * 0.6,
    height: Dimensions.get("window").height * 0.55,
    borderWidth: 1,
    borderColor: theme.colors.mediumGrey,
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
    width: 50,
    height: 5,
    backgroundColor: theme.colors.textLight,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    position: "relative",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: isDark ? theme.colors.textWhite : theme.colors.black,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.regular as "400",
    color: theme.colors.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  videoContainer: {
    paddingHorizontal: 10,
    marginBottom: 12,
    flex: 1,
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
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.black,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "transparent",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.success + "E6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loaderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 20,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textMuted,
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
    backgroundColor: theme.colors.overlay,
    zIndex: 20,
  },
  fullscreenTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullscreenTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.textWhite,
  },
  fullscreenCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.textWhite + "40",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
});
