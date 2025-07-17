import React, { memo } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import theme from "@/app/Theme/globalTheme"; // adjust if needed

interface VideoViewerModalProps {
  visible: boolean;
  onClose: () => void;
  videoUrl: string | null;
}

const VideoViewerModal: React.FC<VideoViewerModalProps> = ({
  visible,
  onClose,
  videoUrl,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        {videoUrl && (
          <Video
            source={{ uri: videoUrl }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            style={styles.video}
            shouldPlay
          />
        )}
        <Text style={styles.text}>Tap anywhere to close</Text>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.6,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  text: {
    marginTop: 20,
    color: theme.colors.text,
    fontSize: 16,
    textAlignVertical: "center",
  },
});

export default memo(VideoViewerModal);
