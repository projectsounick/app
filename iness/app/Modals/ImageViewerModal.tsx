import React from "react";
import {
  Modal,
  Pressable,
  View,
  Image,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  onClose,
  imageUrl,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="contain"
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
  image: {
    width: Dimensions.get("window").width * 0.9,
    height: Dimensions.get("window").height * 0.7,
    borderRadius: 12,
  },
  text: {
    marginTop: 20,
    color: theme.colors.text,
    fontSize: theme.fontSizes.regular,
    textAlignVertical: "center",
  },
});

export default ImageViewerModal;
