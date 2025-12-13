import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ImageBackground,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { height } = Dimensions.get("window");

type MeditationType = "timer" | "breathing" | "guided";

interface MeditationSession {
  id: string;
  title: string;
  duration: number; // in minutes
  description: string;
  icon: string;
  color: string[];
  info?: string;
}

const meditationSessions: MeditationSession[] = [
  {
    id: "1",
    title: "Quick Calm",
    duration: 5,
    description: "A quick 5-minute session to center yourself",
    icon: "leaf",
    color: ["#9747FF", "#7B2CBF"],
    info: "Quick Calm is designed for those moments when you need immediate relief from stress or anxiety. This 5-minute meditation helps you quickly center yourself, regulate your breathing, and find a moment of peace in your busy day. Perfect for a quick break at work, before an important meeting, or whenever you feel overwhelmed. The session focuses on deep breathing techniques and gentle mindfulness to help you reset and refocus.",
  },
  {
    id: "2",
    title: "Deep Focus",
    duration: 10,
    description: "Enhance concentration and mental clarity",
    icon: "brain",
    color: ["#67C694", "#4CAF50"],
    info: "Deep Focus meditation is specifically crafted to enhance your concentration and mental clarity. This 10-minute session helps you clear mental clutter, improve attention span, and boost cognitive performance. Ideal for students preparing for exams, professionals needing to focus on complex tasks, or anyone looking to sharpen their mental acuity. The practice combines mindfulness techniques with visualization exercises to help you achieve a state of deep, sustained focus.",
  },
  {
    id: "3",
    title: "Sleep Well",
    duration: 15,
    description: "Relax your mind for better sleep",
    icon: "moon-waning-crescent",
    color: ["#4FC3F7", "#29B6F6"],
    info: "Sleep Well meditation is your perfect companion for a restful night. This 15-minute guided session helps you unwind from the day's stress, release physical tension, and prepare your mind and body for deep, restorative sleep. The practice includes progressive muscle relaxation, calming breathing exercises, and peaceful visualization techniques. Use this session before bedtime to quiet racing thoughts, reduce anxiety, and drift into a peaceful slumber naturally.",
  },
  {
    id: "4",
    title: "Stress Relief",
    duration: 20,
    description: "Release tension and find inner peace",
    icon: "heart",
    color: ["#FF6B9D", "#FF8E9B"],
    info: "Stress Relief meditation is a comprehensive 20-minute practice designed to help you release accumulated tension and find lasting inner peace. This extended session allows you to fully unwind, process daily stressors, and reconnect with your inner calm. The meditation incorporates body scanning techniques, deep breathing patterns, and loving-kindness practices to help you let go of worries, reduce cortisol levels, and restore emotional balance. Perfect for end-of-day relaxation or whenever you need a complete mental reset.",
  },
];

const breathingPatterns = [
  {
    id: "1",
    name: "4-7-8 Breathing",
    pattern: "4-7-8",
    description: "Inhale 4s, Hold 7s, Exhale 8s",
    inhale: 4,
    hold: 7,
    exhale: 8,
    color: ["#9747FF", "#7B2CBF"],
    info: "The 4-7-8 breathing technique, also known as the 'relaxing breath,' is a powerful method developed by Dr. Andrew Weil. This pattern helps activate your body's natural relaxation response by calming the nervous system. The technique involves inhaling for 4 seconds, holding the breath for 7 seconds, and exhaling for 8 seconds. This extended exhalation helps slow your heart rate and promotes a state of deep relaxation. It's particularly effective for reducing anxiety, improving sleep quality, and managing stress. Practice this technique regularly for best results.",
    link: "https://www.healthline.com/health/4-7-8-breathing",
  },
  {
    id: "2",
    name: "Box Breathing",
    pattern: "4-4-4-4",
    description: "Equal 4-4-4-4 pattern",
    inhale: 4,
    hold: 4,
    exhale: 4,
    pause: 4,
    color: ["#67C694", "#4CAF50"],
    info: "Box breathing, also called square breathing or four-square breathing, is a simple yet effective technique used by athletes, military personnel, and meditation practitioners. The pattern creates equal intervals for each phase: inhale (4s), hold (4s), exhale (4s), and pause (4s). This balanced rhythm helps regulate your breathing, improve focus, and reduce stress. The technique is excellent for enhancing concentration, managing performance anxiety, and maintaining calm under pressure. The equal timing creates a sense of balance and control, making it ideal for beginners and experienced practitioners alike.",
    link: "https://www.healthline.com/health/box-breathing",
  },
  {
    id: "3",
    name: "Deep Breathing",
    pattern: "6-6",
    description: "Slow 6-6 pattern",
    inhale: 6,
    exhale: 6,
    color: ["#4FC3F7", "#29B6F6"],
    info: "Deep breathing, also known as diaphragmatic or belly breathing, is a fundamental technique that engages your diaphragm fully. The 6-6 pattern involves slow, deep inhales and exhales, each lasting 6 seconds. This technique helps maximize oxygen intake, improve lung capacity, and activate the parasympathetic nervous system. Deep breathing is particularly beneficial for reducing stress, lowering blood pressure, and improving overall respiratory health. The slow, rhythmic pattern helps quiet the mind and promotes a sense of calm and well-being. This is an excellent technique for daily practice and can be done anywhere, anytime.",
    link: "https://www.healthline.com/health/diaphragmatic-breathing",
  },
];

export default function MeditationScreen() {
  const [selectedType, setSelectedType] = useState<MeditationType>("breathing");
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [selectedBreathing, setSelectedBreathing] = useState(breathingPatterns[0]);
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [breathingProgress, setBreathingProgress] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && selectedType === "timer") {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setTotalSessions((prev) => prev + 1);
            setTotalMinutes((prev) => prev + Math.floor((selectedSession?.duration || 5) - prev));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, selectedType, selectedSession]);

  useEffect(() => {
    if (isActive && selectedType === "breathing") {
      startBreathingCycle();
    } else {
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
      setBreathingProgress(0);
      setBreathingPhase("inhale");
    }
  }, [isActive, selectedType, selectedBreathing]);

  const startBreathingCycle = () => {
    let currentPhase: "inhale" | "hold" | "exhale" | "pause" = "inhale";
    let progress = 0;
    const duration = selectedBreathing[currentPhase] || 4;

    const cycle = () => {
      if (!isActive) return;

      progress += 0.1;
      const maxDuration = selectedBreathing[currentPhase] || 4;

      if (progress >= maxDuration) {
        progress = 0;
        // Move to next phase
        if (currentPhase === "inhale") {
          currentPhase = "hold";
        } else if (currentPhase === "hold") {
          currentPhase = "exhale";
        } else if (currentPhase === "exhale") {
          currentPhase = selectedBreathing.pause ? "pause" : "inhale";
        } else {
          currentPhase = "inhale";
        }
        setBreathingPhase(currentPhase);
      }

      setBreathingProgress((progress / maxDuration) * 100);

      // Animate scale
      if (currentPhase === "inhale") {
        Animated.timing(breathingScale, {
          toValue: 1.3,
          duration: (maxDuration - progress) * 1000,
          useNativeDriver: true,
        }).start();
      } else if (currentPhase === "exhale") {
        Animated.timing(breathingScale, {
          toValue: 1,
          duration: (maxDuration - progress) * 1000,
          useNativeDriver: true,
        }).start();
      }

      breathingIntervalRef.current = setTimeout(cycle, 100);
    };

    cycle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration * 60);
    setSelectedType("timer");
    setIsActive(false); // Don't auto-start, let user read info first
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (selectedSession) {
      setTimeRemaining(selectedSession.duration * 60);
    } else {
      setTimeRemaining(300);
    }
  };

  const renderTimerView = () => (
    <View style={styles.timerContainer}>
      {selectedSession ? (
        <>
          <View style={styles.timerCircle}>
            <Animated.View
              style={[
                styles.timerInnerCircle,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={selectedSession.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.timerGradient}
              >
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                <Text style={styles.timerLabel}>{selectedSession.title}</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          <View style={styles.timerControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={resetTimer}
            >
              <Ionicons name="refresh" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={toggleTimer}
            >
              <Ionicons
                name={isActive ? "pause" : "play"}
                size={32}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={() => {
                setIsActive(false);
                setSelectedSession(null);
                setTimeRemaining(300);
              }}
            >
              <Ionicons name="stop" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Session Info Section */}
          {selectedSession?.info && (
            <View style={styles.sessionInfoCard}>
              <View style={styles.sessionInfoHeader}>
                <View style={styles.sessionInfoIconContainer}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={20}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.sessionInfoTitle}>About This Session</Text>
              </View>
              <Text style={styles.sessionInfoText}>{selectedSession.info}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.sessionSelector}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Session</Text>
            <View style={styles.headerDash} />
          </View>
          {meditationSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => handleStartSession(session)}
            >
              <LinearGradient
                colors={session.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sessionGradient}
              >
                <MaterialCommunityIcons
                  name={session.icon as any}
                  size={28}
                  color="#fff"
                />
              </LinearGradient>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionDescription}>
                  {session.description}
                </Text>
                <Text style={styles.sessionDuration}>
                  {session.duration} minutes
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9747FF" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderBreathingView = () => (
    <View style={styles.breathingContainer}>
      {/* Breathing Circle - Always Visible */}
      <View style={styles.breathingCircleContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: breathingScale }],
            },
          ]}
        >
          <LinearGradient
            colors={selectedBreathing.color}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.breathingGradient}
          >
            <Text style={styles.breathingPhaseText}>
              {breathingPhase === "inhale"
                ? "Breathe In"
                : breathingPhase === "hold"
                ? "Hold"
                : breathingPhase === "exhale"
                ? "Breathe Out"
                : "Pause"}
            </Text>
            <View style={styles.breathingProgressBar}>
              <View
                style={[
                  styles.breathingProgressFill,
                  { width: `${breathingProgress}%` },
                ]}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Start Button */}
      <View style={styles.breathingControls}>
        <TouchableOpacity
          style={[styles.breathingButton, styles.startBreathingButton]}
          onPress={() => setIsActive(!isActive)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isActive ? "pause" : "play"}
            size={28}
            color="#fff"
          />
          <Text style={styles.breathingButtonText}>
            {isActive ? "Pause" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Switch Patterns - Horizontal Cards */}
      <View style={styles.breathingPatterns}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Breathing Patterns</Text>
          <View style={styles.headerDash} />
        </View>
        <View style={styles.breathingPatternsGrid}>
          {breathingPatterns.map((pattern) => (
            <TouchableOpacity
              key={pattern.id}
              style={[
                styles.breathingPatternCard,
                selectedBreathing.id === pattern.id && styles.breathingPatternCardActive,
              ]}
              onPress={() => {
                if (selectedBreathing.id !== pattern.id) {
                  setSelectedBreathing(pattern);
                  setIsActive(false);
                }
              }}
            >
              <Text style={styles.breathingPatternName}>{pattern.name}</Text>
              <Text style={styles.breathingPatternDesc}>{pattern.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Pattern Info Section - Below Pattern Selection */}
      {selectedBreathing?.info && (
        <View style={styles.sessionInfoCard}>
          <View style={styles.sessionInfoHeader}>
            <View style={styles.sessionInfoIconContainer}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="#9747FF"
              />
            </View>
            <Text style={styles.sessionInfoTitle}>About This Pattern</Text>
          </View>
          <Text style={styles.sessionInfoText}>{selectedBreathing.info}</Text>
          {selectedBreathing.link && (
            <TouchableOpacity
              style={styles.infoLinkButton}
              onPress={() => Linking.openURL(selectedBreathing.link!)}
            >
              <Ionicons name="open-outline" size={16} color="#9747FF" />
              <Text style={styles.infoLinkText}>Learn More</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderGuidedView = () => (
    <View style={styles.guidedContainer}>
      <Text style={styles.sectionTitle}>Guided Meditations</Text>
      <View style={styles.comingSoonCard}>
        <MaterialCommunityIcons
          name="meditation"
          size={48}
          color="#9747FF"
        />
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonText}>
          Guided meditation sessions with audio instructions will be available
          soon.
        </Text>
      </View>
    </View>
  );


  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View style={styles.headerContainer}>
            <NormalHeader screenName="Meditation" />
          </View>

          {/* Fixed Type Selector - Like Track Section */}
          <View style={styles.fixedTabsContainer}>
            {[
              { type: "breathing" as MeditationType, label: "Breathing", icon: "leaf-outline" },
              { type: "timer" as MeditationType, label: "Timer", icon: "timer-outline" },
              { type: "guided" as MeditationType, label: "Guided", icon: "headset-outline" },
            ].map((item) => {
              const isSelected = selectedType === item.type;
              return (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => {
                    setSelectedType(item.type);
                    setIsActive(false);
                    setSelectedSession(null);
                  }}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: isSelected ? "#67C694" : "transparent",
                      shadowColor: isSelected ? "#67C694" : "transparent",
                      shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                      shadowOpacity: isSelected ? 0.3 : 0,
                      shadowRadius: isSelected ? 4 : 0,
                      elevation: isSelected ? 3 : 0,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={isSelected ? "#FFFFFF" : "#999"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabButtonText,
                      {
                        color: isSelected ? "#FFFFFF" : "#666",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}>
              {/* Content */}
              {selectedType === "timer" && renderTimerView()}
              {selectedType === "breathing" && renderBreathingView()}
              {selectedType === "guided" && renderGuidedView()}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? height * 0.05 : "4%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  fixedTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  tabButtonText: {
    fontWeight: "700",
    fontSize: 13,
    fontFamily: theme.fonts.bold,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  timerContainer: {
    paddingHorizontal: 0,
  },
  timerCircle: {
    alignItems: "center",
    marginVertical: 40,
  },
  timerInnerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: "hidden",
  },
  timerGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#fff",
    fontFamily: theme.fonts.bold,
  },
  timerLabel: {
    fontSize: 18,
    color: "#fff",
    marginTop: 8,
    fontFamily: theme.fonts.medium,
  },
  timerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 30,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#67C694",
    borderWidth: 0,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resetButton: {},
  stopButton: {},
  sessionSelector: {
    paddingVertical: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  headerDash: {
    width: 40,
    height: 3,
    backgroundColor: "#9747FF",
    borderRadius: 2,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  sessionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
  },
  sessionDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontFamily: theme.fonts.regular,
  },
  sessionDuration: {
    fontSize: 12,
    color: "#9747FF",
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
  },
  breathingContainer: {
    paddingVertical: 0,
  },
  breathingCircleContainer: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 28,
  },
  breathingCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    overflow: "hidden",
  },
  breathingGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  breathingPhaseText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    fontFamily: theme.fonts.bold,
  },
  breathingProgressBar: {
    width: "80%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  breathingProgressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  breathingControls: {
    alignItems: "center",
    marginTop: 28,
  },
  breathingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 24,
    gap: 12,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startBreathingButton: {
    backgroundColor: "#67C694",
  },
  breathingButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    fontFamily: theme.fonts.bold,
  },
  breathingPatterns: {
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  breathingPatternsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  breathingPatternCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 140,
    justifyContent: "center",
  },
  breathingPatternCardActive: {
    borderColor: "#9747FF",
    borderWidth: 2,
    backgroundColor: "#F3EDFF",
  },
  breathingPatternName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  breathingPatternDesc: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  guidedContainer: {
    paddingVertical: 0,
  },
  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    marginHorizontal: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  sessionInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  sessionInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sessionInfoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sessionInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  sessionInfoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    fontFamily: theme.fonts.regular,
    textAlign: "left",
    marginBottom: 12,
  },
  infoLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F3EDFF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  infoLinkText: {
    fontSize: 13,
    color: "#9747FF",
    fontWeight: "600",
    marginLeft: 6,
    fontFamily: theme.fonts.medium,
  },
});
