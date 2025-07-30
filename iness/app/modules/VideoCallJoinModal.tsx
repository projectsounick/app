import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { videocallService } from "../services/videocall.service";
import { ActivityIndicator } from "react-native-paper";
import VideoCallScreen from "./VideoCallModule";
import { VideoCallFrontend } from "../interfaces/videocallInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomSnackbar from "./Snackbar";
import theme from "../Theme/globalTheme";

const { width } = Dimensions.get("window");

interface Props {
  videoCallSchedule: {
    data: any;
    scheduled: boolean;
  };
  setVideoCallSchedule: React.Dispatch<
    React.SetStateAction<{
      data: any;
      scheduled: boolean;
    }>
  >;
}

export default function VideoCallChecker({
  videoCallSchedule,
  setVideoCallSchedule,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [callDetails, setCallDetails] = useState<{
    appId: string;
    channelName: string;
    token: any;
    callId: any;
  } | null>(null);

  const handleJoin = async () => {
    try {
      setLoading(true);

      let data = {
        channelName: videoCallSchedule.data.channelName,
        type: "audience",
        videoCallId: videoCallSchedule.data.videoCallId,
      };

      const response = await videocallService.joinVideoCall(data);

      if (response.success) {
        let data: VideoCallFrontend = response.data;

        const { appId, channelName, participants, active } = data;
        if (active) {
          if (participants && participants.length > 0) {
            setCallDetails({
              appId,
              channelName,
              token: participants[0].token,
              callId: participants[0].uid,
            });
            setShowVideoModal(true);
            setVideoCallSchedule({ data: null, scheduled: false });
          }
        } else {
          setVideoCallSchedule({ data: null, scheduled: false });
          setSnackbarMessage("This call has been ended");
          setSnackbarVisible(true);
        }
      }
    } catch (error) {
      setMessage("Some error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setVideoCallSchedule({ data: null, scheduled: false });
    AsyncStorage.removeItem("videocallActivity");
  };

  return (
    <>
      {/* 📞 Join Call Prompt Modal */}
      <Modal
        visible={videoCallSchedule.scheduled}
        transparent
        animationType="fade"
      >
        <View style={styles.animatedWrapper}>
          <LinearGradient
            colors={["#140A21", "#522987"]}
            style={styles.modalContent}
          >
            <Text style={styles.title}>You're Invited to a Video Call</Text>
            <Text style={styles.description}>
              Tap the button below to join the call.
            </Text>

            <View style={styles.iconRow}>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <TouchableOpacity
                  onPress={handleJoin}
                  style={styles.joinButton}
                >
                  <Ionicons name="videocam" size={30} color="#fff" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleDismiss}
                style={styles.dismissButton}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* 🎥 Actual Call Fullscreen Modal */}
      <Modal visible={showVideoModal} animationType="slide">
        {callDetails && (
          <VideoCallScreen
            appId={callDetails.appId}
            channelName={callDetails.channelName}
            token={callDetails.token}
            isHost={true}
            uid={callDetails.callId}
            onCallEnd={() => setShowVideoModal(false)} // 👈 pass end handler
          />
        )}
      </Modal>
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  animatedWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000070",
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#ddd",
    marginBottom: 24,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
  },
  joinButton: {
    backgroundColor: "#7A3FFF",
    padding: 15,
    borderRadius: 50,
  },
  dismissButton: {
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 50,
  },
});
