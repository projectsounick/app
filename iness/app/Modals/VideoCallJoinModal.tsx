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
import { videocallService } from "../services/videocall.service";
import { ActivityIndicator } from "react-native-paper";
import VideoCallScreen from "@/app/modules/VideoCallModule";
import { VideoCallFrontend } from "../interfaces/videocallInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "../Theme/globalTheme";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

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
            // ✅ get logged in user id from AsyncStorage
            const userCheck =
              await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

            if (userCheck.exists && userCheck.data) {
              const myId = userCheck.data._id;

              // ✅ find my participant details
              const myParticipant = participants.find((p) => p.userId === myId);

              if (myParticipant) {
                setCallDetails({
                  appId,
                  channelName,
                  token: myParticipant.token,
                  callId: myParticipant.uid,
                });
                setShowVideoModal(true);
                setVideoCallSchedule({ data: null, scheduled: false });
              } else {
                setSnackbarMessage("You are not a participant of this call");
                setSnackbarVisible(true);
              }
            } else {
              setSnackbarMessage("User not found in storage");
              setSnackbarVisible(true);
            }
          }
        } else {
          setVideoCallSchedule({ data: null, scheduled: false });
          setSnackbarMessage("This call has been ended");
          setSnackbarVisible(true);
        }
      }
    } catch (error) {
      console.error(error);
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
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="videocam" size={48} color="#67C694" />
            </View>

            {/* Title */}
            <Text style={styles.title}>You're Invited to a Video Call</Text>
            
            {/* Description */}
            <Text style={styles.description}>
              Tap the button below to join the call.
            </Text>

            {/* Join Button */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#67C694" />
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleJoin}
                style={styles.joinButton}
                activeOpacity={0.8}
              >
                <Ionicons name="videocam" size={20} color="#67C694" />
                <Text style={styles.joinButtonText}>Join Call</Text>
              </TouchableOpacity>
            )}
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    marginBottom: 28,
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
  },
  loadingContainer: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#67C694",
  },
  joinButtonText: {
    color: "#67C694",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    fontFamily: theme.fonts.bold,
  },
});
