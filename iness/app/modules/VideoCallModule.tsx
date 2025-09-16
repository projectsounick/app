import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  InteractionManager,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

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
  const [remoteUids, setRemoteUids] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState<string>("00:00");

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
        console.log("✅ Joined channel, UID:", localUid);
        setJoined(true);
        setCallStartTime(new Date());
      },
      onUserJoined: (_, uid) => {
        console.log("👤 Remote user joined:", uid);
        setRemoteUids((prev) => [...new Set([...prev, uid])]);
      },
      onUserOffline: (_, uid) => {
        console.log("❌ Remote user offline:", uid);
        setRemoteUids((prev) => prev.filter((id) => id !== uid));
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
    setRemoteUids([]);

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

  // 📌 Remote Layout Logic
  const renderRemoteLayout = () => {
    const count = remoteUids.length;

    if (count === 0) {
      return (
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            textAlign: "center",
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
          }}
        >
          Waiting for remote users...
        </Text>
      );
    }

    if (count === 1) {
      return (
        <RtcSurfaceView
          key={remoteUids[0]}
          canvas={{ uid: remoteUids[0], renderMode: 1 }}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            backgroundColor: "#111",
          }}
        />
      );
    }

    if (count === 2) {
      return (
        <View style={{ flex: 1, flexDirection: "column" }}>
          {remoteUids.map((uid) => (
            <RtcSurfaceView
              key={uid}
              canvas={{ uid, renderMode: 1 }}
              style={{
                width: "100%",
                height: height / 2,
                backgroundColor: "#111",
              }}
            />
          ))}
        </View>
      );
    }

    // More than 2 → grid
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {remoteUids.map((uid) => (
          <RtcSurfaceView
            key={uid}
            canvas={{ uid, renderMode: 1 }}
            style={{
              width: width / 2,
              height: height / 3,
              backgroundColor: "#111",
              borderWidth: 1,
              borderColor: "#000",
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Timer */}
      {joined && (
        <View
          style={{
            position: "absolute",
            top: 40,
            left: 16,
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            zIndex: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {callDuration}
          </Text>
        </View>
      )}

      {/* Remote Layout */}
      {renderRemoteLayout()}

      {/* Floating Local View */}
      {isHost && (
        <View
          style={{
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
          }}
        >
          <RtcSurfaceView
            canvas={{ uid: 0, renderMode: 1 }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
      )}

      {/* Controls */}
      <View
        style={{
          position: "absolute",
          alignSelf: "center",
          bottom: 40,
          flexDirection: "row",
          gap: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#333",
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={toggleMute}
        >
          <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#333",
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={toggleCamera}
        >
          <Ionicons
            name={cameraOn ? "videocam" : "videocam-off"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#333",
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={switchCamera}
        >
          <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#E53935",
            width: 56,
            height: 56,
            borderRadius: 32,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={endCall}
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
