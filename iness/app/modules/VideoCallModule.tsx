import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
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
  const [showLocalFull, setShowLocalFull] = useState(false); // 👈 View toggle

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
      onJoinChannelSuccess: (connection, localUid) => {
        setJoined(true);
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
    agoraEngineRef.current?.leaveChannel();
    agoraEngineRef.current?.release();
    setJoined(false);
    setRemoteUid(null);
    onCallEnd();
    await AsyncStorage.removeItem("videocallActivity");
  };

  const toggleMute = () => {
    const mute = !isMuted;
    setIsMuted(mute);
    agoraEngineRef.current?.muteLocalAudioStream(mute);
  };

  useEffect(() => {
    setupAgora();
    return () => {
      agoraEngineRef.current?.leaveChannel();
      agoraEngineRef.current?.release();
    };
  }, []);

  const swapViews = () => {
    setShowLocalFull((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {joined ? (
        <>
          {/* Main Video Area */}
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

          {/* Small Picture-in-Picture View */}
          {remoteUid !== null && isHost && (
            <TouchableOpacity onPress={swapViews} style={styles.pipContainer}>
              <RtcSurfaceView
                canvas={{ uid: showLocalFull ? remoteUid : 0, renderMode: 1 }}
                style={styles.pipVideo}
              />
            </TouchableOpacity>
          )}

          {/* Mic Button */}
          <TouchableOpacity style={styles.micButton} onPress={toggleMute}>
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity style={styles.endButton} onPress={endCall}>
            <Ionicons name="call" size={28} color="#fff" />
            <Text style={styles.endText}>End Call</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.statusText}>Joining call...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
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
  pipVideo: {
    width: "100%",
    height: "100%",
  },
  endButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  micButton: {
    position: "absolute",
    bottom: 110,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 50,
  },
  endText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});
