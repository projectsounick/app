import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  InteractionManager,
} from "react-native";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  IRtcEngine,
} from "react-native-agora";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface VideoCallScreenProps {
  appId: string;
  channelName: string;
  token: string;
  isHost?: boolean;
  uid: number;
  onCallEnd: () => void;
}

export default function VideoCallScreen({
  appId,
  channelName,
  token,
  isHost = false,
  uid,
  onCallEnd,
}: VideoCallScreenProps) {
  const agoraEngineRef = useRef<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [showLocalFull, setShowLocalFull] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState<string>("00:00");

  // Update call duration
  useEffect(() => {
    let timer: any;
    if (callStartTime) {
      timer = setInterval(() => {
        const diff = Math.floor(
          (new Date().getTime() - callStartTime.getTime()) / 1000
        );
        const minutes = Math.floor(diff / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (diff % 60).toString().padStart(2, "0");
        setCallDuration(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStartTime]);

  const getPermission = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  };

  const setupAgora = async () => {
    await getPermission();
    const engine = createAgoraRtcEngine();
    agoraEngineRef.current = engine;

    engine.initialize({
      appId,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });

    await engine.enableVideo();
    await engine.enableAudio();

    if (Platform.OS === "android") {
      await engine.setEnableSpeakerphone(true);
    }

    if (isHost) {
      await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      await engine.startPreview();
      engine.setLocalRenderMode(1, 0);
    } else {
      await engine.setClientRole(ClientRoleType.ClientRoleAudience);
    }

    engine.registerEventHandler({
      onJoinChannelSuccess: (_, localUid) => {
        setJoined(true);
        setCallStartTime(new Date());
      },
      onUserJoined: (_, uid) => {
        setRemoteUid(uid);
      },
      onUserOffline: (_, uid) => {
        setRemoteUid(null);
      },
      onError: (err) => {
        console.error("❌ Agora error:", err);
      },
    });

    await engine.joinChannel(token, channelName, uid, {
      clientRoleType: isHost
        ? ClientRoleType.ClientRoleBroadcaster
        : ClientRoleType.ClientRoleAudience,
    });
  };

  const endCall = async () => {
    onCallEnd();
    setJoined(false);
    setRemoteUid(null);

    InteractionManager.runAfterInteractions(async () => {
      try {
        if (agoraEngineRef.current) {
          await agoraEngineRef.current.leaveChannel();
          await agoraEngineRef.current.release();
          agoraEngineRef.current = null;
        }
        await AsyncStorage.removeItem("videocallActivity");
        console.log("✅ Agora cleanup done");
      } catch (err) {
        console.warn("⚠️ Agora cleanup failed:", err);
      }
    });
  };
  useEffect(() => {
    setupAgora();

    return () => {
      // just delegate cleanup here
      endCall();
    };
  }, []);

  const toggleMute = () => {
    const mute = !isMuted;
    setIsMuted(mute);
    agoraEngineRef.current?.muteLocalAudioStream(mute);
  };

  const toggleCamera = () => {
    const camOn = !cameraOn;
    setCameraOn(camOn);
    agoraEngineRef.current?.muteLocalVideoStream(!camOn);
  };

  const switchCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };

  const swapViews = () => {
    setShowLocalFull((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Call Duration */}
      {joined && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{callDuration}</Text>
        </View>
      )}

      {/* Video Area */}
      <View style={styles.fullVideo}>
        {showLocalFull ? (
          isHost && (
            <RtcSurfaceView
              canvas={{ uid: 0, renderMode: 1 }}
              style={styles.fullVideo}
            />
          )
        ) : remoteUid !== null ? (
          <RtcSurfaceView
            canvas={{ uid: remoteUid, renderMode: 1 }}
            style={[styles.fullVideo, { transform: [{ scaleX: -1 }] }]}
          />
        ) : (
          <Text style={styles.statusText}>Waiting for remote user...</Text>
        )}
      </View>

      {/* Picture-in-Picture */}
      {remoteUid !== null && isHost && (
        <TouchableOpacity onPress={swapViews} style={styles.pipContainer}>
          <RtcSurfaceView
            canvas={{ uid: showLocalFull ? remoteUid : 0, renderMode: 1 }}
            style={styles.pipVideo}
          />
        </TouchableOpacity>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.circleButton} onPress={toggleMute}>
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} onPress={toggleCamera}>
          <Ionicons
            name={cameraOn ? "videocam" : "videocam-off"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} onPress={switchCamera}>
          <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={endCall}>
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  fullVideo: { flex: 1, width: "100%", height: "100%" },
  pipContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    borderColor: "#fff",
    borderWidth: 1,
    zIndex: 10,
  },
  pipVideo: { width: "100%", height: "100%" },
  controls: {
    position: "absolute",
    right: 16,
    bottom: 40,
    flexDirection: "column",
    gap: 16,
    alignItems: "center",
  },
  circleButton: {
    backgroundColor: "#333",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  endButton: {
    backgroundColor: "#E53935",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 16,
  },
  statusText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
  },
  timerContainer: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  timerText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
