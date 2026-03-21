import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
  Linking,
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

interface TrainerVideoCallScreenProps {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  onCallEnd: () => void;
}

const { width, height } = Dimensions.get("window");

export default function TrainerVideoCallScreen({
  appId,
  channelName,
  token,
  uid,
  onCallEnd,
}: TrainerVideoCallScreenProps) {
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
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);

      console.log('Permissions granted:', granted);

      if (
        granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.warn('Camera or audio permission not granted!');
        return false;
      }
    } else {
      console.log('iOS permissions handled by system');
    }
    return true;
  };

  const setupAgora = async () => {
    const hasPermission = await getPermission();
    if (!hasPermission && Platform.OS === "android") {
      console.error('Failed to get camera/audio permissions');
      return;
    }

    const engine = createAgoraRtcEngine();
    agoraEngineRef.current = engine;

    engine.initialize({
      appId,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });

    console.log('Agora engine initialized');

    engine.enableAudio();

    if (Platform.OS === "android") {
      engine.setEnableSpeakerphone(true);
    }

    // Set client role as broadcaster (host)
    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    console.log('Client role set to broadcaster');

    // Enable video module
    console.log('Enabling video module...');
    engine.enableVideo();

    // Configure video encoder
    engine.setVideoEncoderConfiguration({
      dimensions: { width: 640, height: 480 },
      frameRate: 15,
      bitrate: 0,
      minBitrate: -1,
      orientationMode: 0,
      degradationPreference: 0,
      mirrorMode: 0,
    });

    engine.setLocalRenderMode(2, 0);

    engine.registerEventHandler({
      onJoinChannelSuccess: (_, localUid) => {
        console.log('Successfully joined channel, uid:', localUid);
        setJoined(true);
        setCallStartTime(new Date());
      },
      onUserJoined: (_, uid) => {
        console.log('User joined:', uid);
        setRemoteUids((prev) => [...new Set([...prev, uid])]);
      },
      onUserOffline: (_, uid) => {
        console.log('User offline:', uid);
        setRemoteUids((prev) => prev.filter((id) => id !== uid));
      },
      onLocalVideoStateChanged: (source, state, error) => {
        console.log('Local video state changed:', { source, state, error });
        if (state === 2) {
          console.log('Local video is now encoding');
        } else if (state === 3) {
          console.error('Local video failed with error:', error);

          if (error === 7 && Platform.OS === 'ios') {
            console.error('Camera error 7 on iOS - permission likely denied previously');
            Alert.alert(
              'Camera Access Required',
              'To use video calls, please:\n\n1. Go to Settings\n2. Find this app\n3. Enable Camera permission\n4. Restart the app',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => Linking.openSettings(),
                },
              ]
            );
          } else if (error === 7) {
            console.error('Camera error 7 - camera may be in use or permission denied');
          }
        } else if (state === 0) {
          console.log('Local video stopped');
        } else if (state === 1) {
          console.log('Local video is capturing');
        }
      },
    });

    // Start preview BEFORE joining channel
    console.log('Starting local video preview BEFORE joining...');
    setTimeout(() => {
      try {
        // Enable local video
        const enableLocalResult = engine.enableLocalVideo(true);
        console.log('enableLocalVideo result:', enableLocalResult);

        // Start preview
        const previewResult = engine.startPreview();
        console.log('startPreview result:', previewResult);

        // Wait a moment for camera to initialize, then join
        setTimeout(() => {
          console.log('Camera ready, joining channel...');
          engine.joinChannel(token, channelName, uid, {
            clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          });
        }, 500);
      } catch (err) {
        console.error('Error starting preview:', err);
        // Join anyway even if preview fails
        engine.joinChannel(token, channelName, uid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      }
    }, 500);
  };

  const endCall = () => {
    // IMMEDIATELY close the UI - don't wait for anything
    onCallEnd();

    // Everything else happens in background, UI is already closed
    setTimeout(() => {
      try {
        setJoined(false);
        setRemoteUids([]);
      } catch (err) {
        console.error('State update error:', err);
      }

      // Push heavy cleanup to even later
      setTimeout(() => {
        if (agoraEngineRef.current) {
          try {
            agoraEngineRef.current.leaveChannel();
            agoraEngineRef.current.release();
            agoraEngineRef.current = null;
          } catch (err) {
            console.error('Agora cleanup error:', err);
          }
        }

        AsyncStorage.removeItem("videocallActivity").catch((err) => {
          console.error('Storage cleanup error:', err);
        });
      }, 100);
    }, 0);
  };

  useEffect(() => {
    setupAgora();
    return () => {
      endCall();
    };
  }, []);

  const toggleMute = () => {
    const mute = !isMuted;
    console.log('🎤 Toggling MICROPHONE to:', mute ? 'MUTED' : 'UNMUTED');
    setIsMuted(mute);
    agoraEngineRef.current?.muteLocalAudioStream(mute);
    console.log('✅ Microphone toggled (camera unchanged)');
  };

  const toggleCamera = () => {
    const camOn = !cameraOn;
    console.log('📹 Toggling CAMERA to:', camOn ? 'ON' : 'OFF');
    setCameraOn(camOn);

    if (camOn) {
      console.log('Enabling local video...');
      agoraEngineRef.current?.enableLocalVideo(true);
      agoraEngineRef.current?.muteLocalVideoStream(false);
      agoraEngineRef.current?.startPreview();
    } else {
      console.log('Disabling local video...');
      agoraEngineRef.current?.muteLocalVideoStream(true);
    }
    console.log('✅ Camera toggled (microphone unchanged)');
  };

  const switchCamera = () => {
    agoraEngineRef.current?.switchCamera();
  };

  // Render video grid including trainer's own video
  const renderVideoGrid = () => {
    // Always include trainer (uid 0) in the grid
    const allParticipants = [0, ...remoteUids];
    const count = allParticipants.length;

    // Calculate grid layout
    const getGridDimensions = (participantCount: number) => {
      if (participantCount === 1) return { cols: 1, rows: 1 };
      if (participantCount === 2) return { cols: 1, rows: 2 };
      if (participantCount <= 4) return { cols: 2, rows: 2 };
      if (participantCount <= 6) return { cols: 3, rows: 2 };
      if (participantCount <= 9) return { cols: 3, rows: 3 };
      if (participantCount <= 12) return { cols: 4, rows: 3 };
      return { cols: 4, rows: Math.ceil(participantCount / 4) };
    };

    const { cols, rows } = getGridDimensions(count);
    const itemWidth = Math.floor(width / cols);
    const itemHeight = Math.floor(height / rows);

    console.log(`📐 Grid: ${count} people, ${cols}x${rows}, tile: ${itemWidth}x${itemHeight}px`);

    return (
      <View style={styles.gridContainer}>
        {allParticipants.map((participantUid) => (
          <View
            key={participantUid}
            style={[
              styles.gridItem,
              {
                width: itemWidth,
                height: itemHeight,
              },
            ]}
          >
            {participantUid === 0 && !cameraOn ? (
              <View style={styles.gridCameraOff}>
                <Ionicons name="videocam-off" size={32} color="#fff" />
                <Text style={styles.gridCameraOffText}>Camera Off</Text>
              </View>
            ) : (
              <RtcSurfaceView
                canvas={{ uid: participantUid, renderMode: 2 }}
                style={styles.gridView}
              />
            )}

            {participantUid === 0 && (
              <View style={styles.gridHostBadge}>
                <LinearGradient
                  colors={["#9747FF", "#7B2CBF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gridHostBadgeGradient}
                >
                  <MaterialCommunityIcons name="account-star" size={10} color="#fff" />
                  <Text style={styles.gridHostBadgeText}>You</Text>
                </LinearGradient>
              </View>
            )}

            {participantUid === 0 && isMuted && (
              <View style={styles.gridMutedBadge}>
                <View style={styles.gridMutedBadgeContent}>
                  <Ionicons name="mic-off" size={12} color="#fff" />
                </View>
              </View>
            )}

            {remoteUids.length === 0 && participantUid === 0 && (
              <View style={styles.waitingOverlay}>
                <MaterialCommunityIcons
                  name="account-clock"
                  size={40}
                  color="rgba(255, 255, 255, 0.6)"
                />
                <Text style={styles.waitingText}>Waiting for participants...</Text>
              </View>
            )}
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

          {remoteUids.length > 0 && (
            <View style={styles.participantBadge}>
              <LinearGradient
                colors={["rgba(103, 198, 148, 0.9)", "rgba(76, 175, 80, 0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.participantBadgeGradient}
              >
                <Ionicons name="people" size={16} color="#fff" />
                <Text style={styles.participantText}>{remoteUids.length + 1}</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      )}

      {/* Video Grid */}
      <View style={styles.remoteContainer}>{renderVideoGrid()}</View>

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

            {/* Switch Camera */}
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
  participantBadge: {
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  participantBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  participantText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.regular,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  remoteContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: theme.colors.black,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  gridItem: {
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#333",
    position: "relative",
    margin: 0,
    padding: 0,
  },
  gridView: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.text,
  },
  gridCameraOff: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  gridCameraOffText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
    fontFamily: theme.fonts.regular,
  },
  gridHostBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
  },
  gridHostBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  gridHostBadgeText: {
    color: theme.colors.textWhite,
    fontSize: 9,
    fontWeight: "700",
    fontFamily: theme.fonts.bold,
  },
  gridMutedBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 10,
  },
  gridMutedBadgeContent: {
    backgroundColor: "rgba(229, 57, 53, 0.9)",
    borderRadius: 12,
    padding: 6,
  },
  waitingOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    alignItems: "center",
    gap: 6,
  },
  waitingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    fontFamily: theme.fonts.regular,
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
