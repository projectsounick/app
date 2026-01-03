import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  InteractionManager,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  IRtcEngine,
} from "react-native-agora";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "@/app/Theme/globalTheme";

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
        setJoined(true);
        setCallStartTime(new Date());
      },
      onUserJoined: (_, uid) => {
        setRemoteUids((prev) => [...new Set([...prev, uid])]);
      },
      onUserOffline: (_, uid) => {
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
      } catch (err) {
        // Agora cleanup failed
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
        <View style={styles.emptyStateContainer}>
          <LinearGradient
            colors={["#9747FF", "#7B2CBF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyStateGradient}
          >
            <View style={styles.emptyStateContent}>
              <MaterialCommunityIcons
                name="video-off"
                size={64}
                color="#fff"
                style={{ marginBottom: 16 }}
              />
              <Text style={styles.emptyStateTitle}>Waiting for participants</Text>
              <Text style={styles.emptyStateSubtitle}>
                The call will start when others join
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    if (count === 1) {
      return (
        <View style={styles.singleRemoteContainer}>
          <RtcSurfaceView
            key={remoteUids[0]}
            canvas={{ uid: remoteUids[0], renderMode: 1 }}
            style={styles.singleRemoteView}
          />
        </View>
      );
    }

    if (count === 2) {
      return (
        <View style={styles.twoRemoteContainer}>
          {remoteUids.map((uid) => (
            <View key={uid} style={styles.twoRemoteItem}>
              <RtcSurfaceView
                canvas={{ uid, renderMode: 1 }}
                style={styles.twoRemoteView}
              />
            </View>
          ))}
        </View>
      );
    }

    // More than 2 → grid
    return (
      <View style={styles.gridContainer}>
        {remoteUids.map((uid) => (
          <View key={uid} style={styles.gridItem}>
            <RtcSurfaceView
              canvas={{ uid, renderMode: 1 }}
              style={styles.gridView}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Top Bar with Timer */}
      {joined && (
        <View style={styles.topBar}>
          <LinearGradient
            colors={["rgba(151, 71, 255, 0.9)", "rgba(123, 44, 191, 0.9)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.timerContainer}
          >
            <Ionicons name="time-outline" size={18} color="#fff" />
            <Text style={styles.timerText}>{callDuration}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Remote Layout */}
      <View style={styles.remoteContainer}>{renderRemoteLayout()}</View>

      {/* Floating Local View */}
      {isHost && (
        <View style={styles.localViewContainer}>
          <View style={styles.localViewWrapper}>
            <RtcSurfaceView
              canvas={{ uid: 0, renderMode: 1 }}
              style={styles.localView}
            />
            {!cameraOn && (
              <View style={styles.cameraOffOverlay}>
                <Ionicons name="videocam-off" size={24} color="#fff" />
              </View>
            )}
            {/* Host Badge - Top Right */}
            <View style={styles.hostBadge}>
              <LinearGradient
                colors={["#9747FF", "#7B2CBF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hostBadgeGradient}
              >
                <MaterialCommunityIcons name="account-star" size={12} color="#fff" />
                <Text style={styles.hostBadgeText}>Host</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      {/* Controls Bar */}
      <View style={styles.controlsContainer}>
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.5)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.controlsGradient}
        >
          <View style={styles.controlsRow}>
            {/* Mute Button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                isMuted && styles.controlButtonActive,
              ]}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isMuted
                    ? ["#E53935", "#C62828"]
                    : ["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.controlButtonGradient}
              >
                <Ionicons
                  name={isMuted ? "mic-off" : "mic"}
                  size={22}
                  color="#fff"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Camera Toggle */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !cameraOn && styles.controlButtonActive,
              ]}
              onPress={toggleCamera}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !cameraOn
                    ? ["#E53935", "#C62828"]
                    : ["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.controlButtonGradient}
              >
                <Ionicons
                  name={cameraOn ? "videocam" : "videocam-off"}
                  size={22}
                  color="#fff"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Switch Camera (only if camera is on) */}
            {cameraOn && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={switchCamera}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.1)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.controlButtonGradient}
                >
                  <Ionicons
                    name="camera-reverse"
                    size={22}
                    color="#fff"
                  />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* End Call Button */}
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={endCall}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#E53935", "#C62828"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.endCallGradient}
              >
                <Ionicons name="call" size={26} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 100,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timerText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  hostBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  hostBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  hostBadgeText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.small,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  remoteContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateGradient: {
    width: width * 0.8,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  emptyStateContent: {
    alignItems: "center",
  },
  emptyStateTitle: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.large,
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
  },
  singleRemoteContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  singleRemoteView: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.text,
  },
  twoRemoteContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 2,
  },
  twoRemoteItem: {
    flex: 1,
    overflow: "hidden",
  },
  twoRemoteView: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.text,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  gridItem: {
    width: width / 2 - 1,
    height: height / 3 - 1,
    overflow: "hidden",
  },
  gridView: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.text,
  },
  localViewContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    right: 20,
    zIndex: 50,
  },
  localViewWrapper: {
    width: 140,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#67C694",
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: theme.colors.black,
  },
  localView: {
    width: "100%",
    height: "100%",
  },
  cameraOffOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    zIndex: 100,
  },
  controlsGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonActive: {
    shadowColor: "#E53935",
    shadowOpacity: 0.5,
  },
  controlButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  endCallGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
