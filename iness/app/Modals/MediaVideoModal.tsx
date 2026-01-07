import React, { useEffect } from "react";
import { Modal, View, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { MediaVideoModalProps } from "@/app/interfaces/podcastsInterface";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function MediaVideoModal({
  podcast,
  visible,
  onClose,
}: MediaVideoModalProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const videoSource = podcast?.podcastLink;

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // Ensure video auto-plays when modal becomes visible
  useEffect(() => {
    if (visible && player) {
      player.play();
    } else {
      player.pause();
    }
  }, [visible, player]);

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.black,
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 40,
            right: 20,
            zIndex: 10,
            backgroundColor: theme.colors.background,
            padding: 6,
            borderRadius: 20,
          }}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <VideoView
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          style={{
            width: width,
            height: height,
          }}
        />
      </View>
    </Modal>
  );
}
