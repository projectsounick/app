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
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const VIDEO_FLAG = "promoVideoClosed";

const PromoVideoModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoRef = useRef<Video | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const isSmallScreen = screenWidth < 768;

  useEffect(() => {
    const fetchData = async () => {
      const flag = await AsyncStorage.getItem(VIDEO_FLAG);
      if (flag && Date.now() - parseInt(flag) < 2 * 24 * 60 * 60 * 1000) return;

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
            setTimeout(() => setLoading(false), 2000); // simulate 2s loading
          }
        } catch (err) {
          console.error("Error fetching promo video:", err);
        }
      }, 5000);
    };

    fetchData();
  }, []);

  const handleClose = async () => {
    await AsyncStorage.setItem(VIDEO_FLAG, Date.now().toString());
    setShowModal(false);
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const videoStyles = fullscreen
    ? {
        width: screenWidth * 0.9,
        height: screenHeight * 0.8,
        borderRadius: 12,
      }
    : isSmallScreen
      ? {
          width: 250,
          height: 150,
          borderRadius: 12,
        }
      : {
          width: 400,
          height: 250,
          borderRadius: 12,
        };

  return (
    <Modal transparent visible={showModal} animationType="fade">
      <View style={styles.overlay}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 10 }}>
              Loading video...
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.modalContent,
              fullscreen
                ? styles.centeredModal
                : isSmallScreen
                  ? styles.bottomRight
                  : styles.centeredModal,
            ]}
          >
            {videoUrl && (
              <Video
                ref={(ref: any) => (videoRef.current = ref)}
                source={{ uri: videoUrl }}
                shouldPlay
                useNativeControls={false}
                resizeMode={ResizeMode.CONTAIN}
                style={[videoStyles, { backgroundColor: "black" }]}
              />
            )}

            {/* Controls */}
            <View style={styles.controlRow}>
              <TouchableOpacity onPress={handlePlayPause} style={styles.icon}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={22}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFullscreen((prev) => !prev)}
                style={styles.icon}
              >
                <Ionicons
                  name={fullscreen ? "contract" : "expand"}
                  size={22}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose} style={styles.icon}>
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default PromoVideoModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  centeredModal: {
    position: "absolute",
    top: "10%",
    left: "5%",
    right: "5%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  bottomRight: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  controlRow: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    zIndex: 9999,
  },
  icon: {
    marginLeft: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  loaderContainer: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 40,
    right: 20,
  },
});
