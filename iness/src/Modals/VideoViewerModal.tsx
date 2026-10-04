import React, { memo } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Video, ResizeMode } from "@/src/modules/AppVideo";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
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

const getStyles = (theme: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.6,
    borderRadius: 12,
    backgroundColor: theme.colors.black,
  },
  text: {
    marginTop: 20,
    color: theme.colors.text,
    fontSize: theme.fontSizes.regular,
    textAlignVertical: "center",
  },
});

export default memo(VideoViewerModal);
