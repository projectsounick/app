import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Switch,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import {
  aiCoachService,
  AiChatMessage,
  AiConversation,
  AiConfigData,
  AiAttachment,
} from "@/src/services/aiCoach.service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LocalAttachment {
  uri: string;
  base64: string;
  mimeType: string;
  name: string;
  size?: number;
  type: "image" | "document";
}

// Formatted AI message text renderer
function FormattedAiText({
  content,
  textColor,
  accentColor,
}: {
  content: string;
  textColor: string;
  accentColor: string;
}) {
  const lines = content.split("\n");

  return (
    <View style={{ gap: 4 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={idx} style={{ height: 4 }} />;
        }

        const isBullet =
          trimmed.startsWith("* ") ||
          trimmed.startsWith("- ") ||
          trimmed.startsWith("• ");
        const isNumbered = /^\d+\.\s/.test(trimmed);

        const cleanText = isBullet
          ? trimmed.slice(2)
          : isNumbered
          ? trimmed.replace(/^\d+\.\s/, "")
          : line;

        const parts = cleanText.split(/(\*\*.*?\*\*)/g);

        return (
          <View
            key={idx}
            style={
              isBullet || isNumbered
                ? {
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 6,
                    marginVertical: 1,
                  }
                : undefined
            }
          >
            {isBullet && (
              <Text
                style={{
                  color: accentColor,
                  fontSize: 14,
                  lineHeight: 20,
                  fontWeight: "700",
                }}
              >
                •
              </Text>
            )}
            {isNumbered && (
              <Text
                style={{
                  color: accentColor,
                  fontSize: 13,
                  lineHeight: 20,
                  fontWeight: "700",
                }}
              >
                {trimmed.match(/^\d+\./)?.[0] || "•"}
              </Text>
            )}
            <Text
              style={{
                flex: isBullet || isNumbered ? 1 : undefined,
                fontSize: 14,
                lineHeight: 22,
                color: textColor,
              }}
            >
              {parts.map((part, pIdx) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <Text key={pIdx} style={{ fontWeight: "700" }}>
                      {part.slice(2, -2)}
                    </Text>
                  );
                }
                return <Text key={pIdx}>{part}</Text>;
              })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function AiCoachTab() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // State
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState<string>("Iness AI");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<LocalAttachment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [personalize, setPersonalize] = useState<boolean>(true);
  const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);
  const [attachSheetVisible, setAttachSheetVisible] = useState<boolean>(false);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState<AiConfigData | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(30);
  const [quotaLimit, setQuotaLimit] = useState<number>(30);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const flatListRef = useRef<FlatList>(null);
  const bottomTabBarClearance = 60 + Math.max(insets.bottom, 8);

  // Monitor keyboard to adjust input container clearance
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Theme Colors (Purple & clean neutral palette - No harsh neon green)
  const colors = {
    bg: theme.colors.background,
    bgSecondary: theme.colors.backgroundSecondary,
    bgCard: theme.colors.backgroundCard,
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textMuted: theme.colors.textMuted,
    border: theme.colors.border,
    divider: theme.colors.divider,
    brandPurple: "#9747FF",
    brandPurpleDark: "#7C3AED",
    brandPurpleLight: isDark ? "rgba(151, 71, 255, 0.15)" : "rgba(151, 71, 255, 0.1)",
    brandPurpleBorder: isDark ? "rgba(151, 71, 255, 0.35)" : "rgba(151, 71, 255, 0.25)",
    bubbleUser: "#9747FF",
    inputCardBg: isDark ? "#1C1F26" : "#FFFFFF",
    inputBorder: isDark ? "#2D313D" : "#E2E5EC",
    sendBtnBgDisabled: isDark ? "#282B34" : "#E5E7EB",
    sendBtnIconDisabled: isDark ? "#555A66" : "#9CA3AF",
    iconBtnBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
    feedAddBtnBg: theme.colors.success || "#67C694",
  };

  // Load Initial Config and Conversations
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      const [configRes, convsRes] = await Promise.all([
        aiCoachService.getAiConfigAndQuota(),
        aiCoachService.getConversations(),
      ]);

      if (configRes.success && configRes.data) {
        setAiConfig(configRes.data);
        if (configRes.data.quota) {
          setQuotaRemaining(configRes.data.quota.remaining);
          setQuotaLimit(configRes.data.quota.limit);
        }
      }

      if (convsRes.success && convsRes.data.length > 0) {
        setConversations(convsRes.data);
        const latest = convsRes.data[0];
        setCurrentConversationId(latest._id);
        setCurrentConversationTitle(latest.title || "Iness AI");
        loadMessages(latest._id);
      } else {
        setConversations([]);
        setCurrentConversationId(null);
        setCurrentConversationTitle("Iness AI");
        setMessages([]);
      }
    } catch (error) {
      console.error("loadInitialData error:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await aiCoachService.getConversationMessages(convId);
      if (res.success && res.messages) {
        setMessages(res.messages);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 80);
      }
    } catch (error) {
      console.error("loadMessages error:", error);
    }
  };

  const handleSelectConversation = (conv: AiConversation) => {
    setCurrentConversationId(conv._id);
    setCurrentConversationTitle(conv.title || "Iness AI");
    setHistoryModalVisible(false);
    loadMessages(conv._id);
  };

  // New Chat handler (starts fresh empty state with recommended questions)
  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCurrentConversationId(null);
    setCurrentConversationTitle("Iness AI");
    setMessages([]);
    setAttachedFiles([]);
    setInputText("");
    setHistoryModalVisible(false);
  };

  const handleDeleteConversation = async (convId: string) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await aiCoachService.deleteConversation(convId);
          setConversations((prev) => prev.filter((c) => c._id !== convId));
          if (currentConversationId === convId) {
            handleNewChat();
          }
        },
      },
    ]);
  };

  // Camera Picker
  const handleTakePhoto = async () => {
    setAttachSheetVisible(false);
    if (attachedFiles.length >= 2) {
      Alert.alert("Limit Reached", "You can attach a maximum of 2 items per message.");
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Camera access is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          const newImg: LocalAttachment = {
            uri: asset.uri,
            base64: `data:${mimeType};base64,${asset.base64}`,
            mimeType,
            name: asset.fileName || `camera_${Date.now()}.jpg`,
            size: asset.fileSize,
            type: "image",
          };
          setAttachedFiles((prev) => [...prev, newImg].slice(0, 2));
        }
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not capture photo: " + err.message);
    }
  };

  // Gallery Picker
  const handlePickGallery = async () => {
    setAttachSheetVisible(false);
    if (attachedFiles.length >= 2) {
      Alert.alert("Limit Reached", "You can attach a maximum of 2 items per message.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || "image/jpeg";
          const newImg: LocalAttachment = {
            uri: asset.uri,
            base64: `data:${mimeType};base64,${asset.base64}`,
            mimeType,
            name: asset.fileName || "photo.jpg",
            size: asset.fileSize,
            type: "image",
          };
          setAttachedFiles((prev) => [...prev, newImg].slice(0, 2));
        }
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not pick image: " + err.message);
    }
  };

  // Document / PDF Picker
  const handlePickDocument = async () => {
    setAttachSheetVisible(false);
    if (attachedFiles.length >= 2) {
      Alert.alert("Limit Reached", "You can attach a maximum of 2 items per message.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain", "text/csv"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const rawBase64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: "base64",
        });

        const mimeType =
          asset.mimeType ||
          (asset.name.endsWith(".pdf") ? "application/pdf" : "text/plain");
        const newDoc: LocalAttachment = {
          uri: asset.uri,
          base64: `data:${mimeType};base64,${rawBase64}`,
          mimeType,
          name: asset.name || "document.pdf",
          size: asset.size,
          type: "document",
        };
        setAttachedFiles((prev) => [...prev, newDoc].slice(0, 2));
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not pick document: " + err.message);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy AI response to clipboard
  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Send Message
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText.trim();
    if (!textToSend && attachedFiles.length === 0) return;

    if (quotaRemaining <= 0) {
      Alert.alert(
        "Daily Limit Reached",
        `You have used your ${quotaLimit} free questions for today. Your daily quota will reset tomorrow!`
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const tempAttachments: AiAttachment[] = attachedFiles.map((f) => ({
      url: f.uri,
      mimeType: f.mimeType,
      name: f.name,
      size: f.size,
    }));

    const tempUserMsg: AiChatMessage = {
      _id: "temp-" + Date.now(),
      conversationId: currentConversationId || "",
      role: "user",
      content: textToSend,
      attachments: tempAttachments,
      images: tempAttachments.filter((a) => a.mimeType.startsWith("image/")),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputText("");
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const response = await aiCoachService.sendMessage({
        conversationId: currentConversationId || undefined,
        message: textToSend,
        attachments: filesToSend.map((f) => ({
          base64: f.base64,
          mimeType: f.mimeType,
          name: f.name,
          size: f.size,
        })),
        personalize,
      });

      if (response.success && response.modelMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempUserMsg._id),
          {
            ...tempUserMsg,
            _id: "user-" + Date.now(),
          },
          response.modelMessage!,
        ]);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);

        if (response.conversationId) {
          setCurrentConversationId(response.conversationId);
          if (response.conversationTitle) {
            setCurrentConversationTitle(response.conversationTitle);
          }
          aiCoachService.getConversations().then((res) => {
            if (res.success) setConversations(res.data);
          });
        }

        if (response.quota) {
          setQuotaRemaining(response.quota.remaining);
          setQuotaLimit(response.quota.limit);
        }
      } else if (response.limitReached) {
        Alert.alert("Daily Limit Reached", response.message || "Daily question limit reached.");
        setQuotaRemaining(0);
        setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
      } else {
        Alert.alert("AI Coach", response.message || "Failed to get response. Please try again.");
        setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setLoading(false);
    }
  };

  const handleReportMessage = (messageId: string) => {
    Alert.alert(
      "Report Response",
      "Is this response inaccurate, unsafe, or inappropriate?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            await aiCoachService.reportMessage(messageId, "User flagged for review");
            Alert.alert("Reported", "Thank you. Our team will review this response.");
          },
        },
      ]
    );
  };

  const defaultSuggestions = [
    {
      icon: "dumbbell" as const,
      title: "15-Minute HIIT Workout",
      desc: "Quick full-body high-intensity routine",
      prompt: "Suggest a 15-minute quick full-body HIIT routine for fat burn",
    },
    {
      icon: "food-apple" as const,
      title: "High-Protein Snack Ideas",
      desc: "3 nutritious snacks under 200 kcal",
      prompt: "Give me 3 high-protein snack ideas under 200 kcal with macros",
    },
    {
      icon: "shield-alert" as const,
      title: "Squat Swaps & Form",
      desc: "Lower-back friendly knee-safe alternatives",
      prompt: "Substitute barbell squats for lower back stiffness with safe form tips",
    },
    {
      icon: "chart-line" as const,
      title: "Review 10-Day Progress",
      desc: "Analyze recent step, sleep, and workouts",
      prompt: "How is my 10-day workout, step, and sleep progress looking?",
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* TOP HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        {/* Left: Chat History Icon */}
        <TouchableOpacity
          style={[styles.headerCircleBtn, { backgroundColor: colors.iconBtnBg }]}
          onPress={() => setHistoryModalVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel="Chat History"
        >
          <Ionicons name="time-outline" size={20} color={colors.text} />
          {conversations.length > 0 && <View style={styles.historyDot} />}
        </TouchableOpacity>

        {/* Center: AI Title (Purple branding, NO GREEN) */}
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitleRow}>
            <LinearGradient
              colors={["#9747FF", "#7C3AED"]}
              style={styles.headerAiBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {currentConversationTitle}
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Iness AI • Personalized Coach
          </Text>
        </View>

        {/* Right: New Chat Button (Exactly like Feed Add Icon) */}
        <TouchableOpacity
          style={[
            styles.feedAddButton,
            { backgroundColor: colors.feedAddBtnBg },
          ]}
          onPress={handleNewChat}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="New Chat"
          accessibilityHint="Starts a new conversation"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SUB-HEADER: SLEEK CAPSULE BAR (PERSONALIZATION + QUOTA) */}
      <View
        style={[
          styles.subHeader,
          {
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            borderBottomColor: colors.divider,
          },
        ]}
      >
        <View style={styles.subHeaderPillRow}>
          {/* Personalize toggle pill */}
          <View
            style={[
              styles.capsulePill,
              {
                backgroundColor: colors.bgCard,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-details-outline"
              size={14}
              color={personalize ? colors.brandPurple : colors.textMuted}
            />
            <Text style={[styles.capsulePillText, { color: colors.text }]}>
              {personalize ? "10-Day Health Context" : "General Mode"}
            </Text>
            <Switch
              value={personalize}
              onValueChange={setPersonalize}
              trackColor={{
                false: isDark ? "#3A3A3A" : "#D5D5D5",
                true: colors.brandPurple,
              }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }], marginLeft: 2 }}
            />
          </View>

          {/* Daily Quota pill */}
          <View
            style={[
              styles.capsulePill,
              {
                backgroundColor:
                  quotaRemaining > 5
                    ? colors.brandPurpleLight
                    : "rgba(244, 67, 54, 0.12)",
                borderColor:
                  quotaRemaining > 5
                    ? colors.brandPurpleBorder
                    : "rgba(244, 67, 54, 0.3)",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={13}
              color={quotaRemaining > 5 ? colors.brandPurple : "#F44336"}
            />
            <Text
              style={[
                styles.quotaPillText,
                { color: quotaRemaining > 5 ? colors.brandPurple : "#F44336" },
              ]}
            >
              {quotaRemaining}/{quotaLimit} left
            </Text>
          </View>
        </View>
      </View>

      {/* MAIN CHAT CONTENT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {initialLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.brandPurple} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Opening Iness AI...
            </Text>
          </View>
        ) : messages.length === 0 ? (
          /* EMPTY STATE: CHATGPT-STYLE HERO + RECOMMENDED QUESTIONS */
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.emptyContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Centered AI Emblem */}
            <LinearGradient
              colors={["#9747FF", "#6825C9"]}
              style={styles.heroBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </LinearGradient>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              What can I help you with today?
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Ask about workout plans, macro nutrition, form checks, or attach meal photos and blood/diet report PDFs.
            </Text>

            {/* Recommended Prompts Grid (Shown only at the beginning of a new chat) */}
            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsHeader, { color: colors.textMuted }]}>
                RECOMMENDED QUESTIONS
              </Text>

              <View style={styles.promptsGrid}>
                {defaultSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.promptCard,
                      {
                        backgroundColor: colors.bgCard,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleSendMessage(item.prompt)}
                  >
                    <View style={styles.promptCardHeader}>
                      <View
                        style={[
                          styles.promptIconBox,
                          { backgroundColor: colors.brandPurpleLight },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={18}
                          color={colors.brandPurple}
                        />
                      </View>
                      <Ionicons
                        name="arrow-forward"
                        size={15}
                        color={colors.textMuted}
                      />
                    </View>
                    <Text
                      style={[styles.promptTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[styles.promptDesc, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        ) : (
          /* ACTIVE CONVERSATION: MESSAGES FLATLIST */
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[styles.messageList, { paddingBottom: 20 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              const allItemAttachments =
                item.attachments ||
                (item.images || []).map((img: { url: string; mimeType?: string }) => ({
                  url: img.url,
                  mimeType: img.mimeType || "image/jpeg",
                  name: "photo.jpg",
                }));

              return (
                <View style={[styles.messageRow, isUser ? styles.userRow : styles.modelRow]}>
                  {/* AI Avatar (Purple, NO GREEN) */}
                  {!isUser && (
                    <LinearGradient
                      colors={["#9747FF", "#7C3AED"]}
                      style={styles.aiAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                    </LinearGradient>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isUser
                        ? [styles.userBubble, { backgroundColor: colors.bubbleUser }]
                        : [
                            styles.modelBubble,
                            {
                              backgroundColor: colors.bgCard,
                              borderColor: colors.border,
                            },
                          ],
                    ]}
                  >
                    {/* Render User Attachments (Images & Documents) */}
                    {allItemAttachments.length > 0 && (
                      <View style={{ marginBottom: 8, gap: 6 }}>
                        {allItemAttachments.map((att: any, i: number) => {
                          const isImg = att.mimeType?.startsWith("image/");
                          if (isImg) {
                            return (
                              <TouchableOpacity
                                key={i}
                                activeOpacity={0.9}
                                onPress={() => setPreviewImageUri(att.url)}
                              >
                                <Image
                                  source={{ uri: att.url }}
                                  style={styles.chatImage}
                                  resizeMode="cover"
                                />
                              </TouchableOpacity>
                            );
                          }
                          return (
                            <View
                              key={i}
                              style={[
                                styles.chatDocPill,
                                {
                                  backgroundColor: isUser
                                    ? "rgba(255,255,255,0.2)"
                                    : isDark
                                    ? "#1E1E28"
                                    : "#EFEFF4",
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="file-pdf-box"
                                size={22}
                                color="#F44336"
                              />
                              <Text
                                style={[
                                  styles.chatDocText,
                                  { color: isUser ? "#FFF" : colors.text },
                                ]}
                                numberOfLines={1}
                              >
                                {att.name || "Attached PDF Document"}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {isUser ? (
                      <Text style={[styles.messageText, { color: "#FFFFFF" }]} selectable>
                        {item.content}
                      </Text>
                    ) : (
                      <FormattedAiText
                        content={item.content}
                        textColor={colors.text}
                        accentColor={colors.brandPurple}
                      />
                    )}

                    {/* AI Bubble Footer */}
                    {!isUser && (
                      <View style={[styles.aiFooter, { borderTopColor: colors.divider }]}>
                        <Text style={[styles.aiDisclaimerTiny, { color: colors.textMuted }]}>
                          Iness AI guidance
                        </Text>
                        <View style={styles.aiActionBtnsRow}>
                          <TouchableOpacity
                            onPress={() => handleCopyMessage(item._id, item.content)}
                            style={styles.actionIconBtn}
                            accessibilityLabel="Copy response"
                          >
                            <Ionicons
                              name={copiedId === item._id ? "checkmark" : "copy-outline"}
                              size={14}
                              color={copiedId === item._id ? colors.brandPurple : colors.textMuted}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleReportMessage(item._id)}
                            style={styles.actionIconBtn}
                            accessibilityLabel="Report response"
                          >
                            <Feather name="flag" size={13} color={colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              loading ? (
                <View style={[styles.messageRow, styles.modelRow]}>
                  <LinearGradient
                    colors={["#9747FF", "#7C3AED"]}
                    style={styles.aiAvatar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                  </LinearGradient>
                  <View
                    style={[
                      styles.bubble,
                      styles.modelBubble,
                      { backgroundColor: colors.bgCard, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.typingRow}>
                      <ActivityIndicator size="small" color={colors.brandPurple} />
                      <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                        Iness AI is thinking...
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* CHATGPT-STYLE INPUT BAR CONTAINER */}
        <View
          style={[
            styles.inputContainerOuter,
            {
              backgroundColor: colors.bg,
              borderTopColor: colors.divider,
              marginBottom: isKeyboardVisible ? 0 : bottomTabBarClearance,
              paddingBottom: isKeyboardVisible
                ? Platform.OS === "ios"
                  ? Math.max(insets.bottom, 8)
                  : 8
                : 8,
            },
          ]}
        >
          {/* Main ChatGPT-style Capsule */}
          <View
            style={[
              styles.inputCapsule,
              {
                backgroundColor: colors.inputCardBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            {/* Attachment preview tray (if any file is selected) */}
            {attachedFiles.length > 0 && (
              <View style={styles.attachmentTray}>
                {attachedFiles.map((file, idx) => (
                  <View key={idx} style={styles.trayItem}>
                    {file.type === "image" ? (
                      <Image source={{ uri: file.uri }} style={styles.trayThumb} />
                    ) : (
                      <View
                        style={[
                          styles.trayDocBox,
                          { backgroundColor: isDark ? "#282B34" : "#F3F4F6" },
                        ]}
                      >
                        <MaterialCommunityIcons name="file-pdf-box" size={20} color="#F44336" />
                        <Text
                          style={[styles.trayDocName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {file.name}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.removeTrayBtn}
                      onPress={() => handleRemoveAttachment(idx)}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={[styles.trayCount, { color: colors.textMuted }]}>
                  {attachedFiles.length}/2
                </Text>
              </View>
            )}

            {/* Input Row */}
            <View style={styles.inputRow}>
              {/* Plus/Attachment Button */}
              <TouchableOpacity
                style={[
                  styles.plusAttachBtn,
                  {
                    backgroundColor: isDark ? "#2A2E38" : "#F0F2F6",
                    opacity: attachedFiles.length >= 2 ? 0.4 : 1,
                  },
                ]}
                onPress={() => setAttachSheetVisible(true)}
                disabled={attachedFiles.length >= 2}
                accessibilityLabel="Attach photo or PDF"
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={isDark ? "#FFFFFF" : "#1F2937"}
                />
              </TouchableOpacity>

              {/* Multiline TextInput */}
              <TextInput
                style={[
                  styles.chatTextInput,
                  { color: colors.text },
                ]}
                placeholder={
                  quotaRemaining > 0
                    ? "Message Iness AI..."
                    : "Daily limit reached (30/30)"
                }
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                editable={quotaRemaining > 0 && !loading}
              />

              {/* Circular Send Button (ChatGPT-style upward arrow) */}
              <TouchableOpacity
                style={[
                  styles.sendArrowBtn,
                  {
                    backgroundColor:
                      (!inputText.trim() && attachedFiles.length === 0) ||
                      loading ||
                      quotaRemaining <= 0
                        ? colors.sendBtnBgDisabled
                        : colors.brandPurple,
                  },
                ]}
                onPress={() => handleSendMessage()}
                disabled={
                  (!inputText.trim() && attachedFiles.length === 0) ||
                  loading ||
                  quotaRemaining <= 0
                }
                accessibilityLabel="Send message"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={
                      (!inputText.trim() && attachedFiles.length === 0) ||
                      quotaRemaining <= 0
                        ? colors.sendBtnIconDisabled
                        : "#FFFFFF"
                    }
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ATTACHMENT ACTION SHEET (CAMERA / GALLERY / PDF) */}
      <Modal
        visible={attachSheetVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAttachSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAttachSheetVisible(false)}
        >
          <View
            style={[
              styles.attachSheet,
              {
                backgroundColor: colors.bg,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={[styles.attachSheetTitle, { color: colors.text }]}>
              Add to Conversation
            </Text>
            <Text style={[styles.attachSheetSubtitle, { color: colors.textSecondary }]}>
              Attach meal/workout photos or medical/diet report PDFs (max 2 items)
            </Text>

            <View style={styles.attachOptionsRow}>
              {/* Take Photo */}
              <TouchableOpacity
                style={[
                  styles.attachOptionBox,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                ]}
                onPress={handleTakePhoto}
              >
                <LinearGradient
                  colors={["#9747FF", "#7C3AED"]}
                  style={styles.attachIconCircle}
                >
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachOptionTitle, { color: colors.text }]}>Camera</Text>
                <Text style={[styles.attachOptionHint, { color: colors.textSecondary }]}>
                  Take photo
                </Text>
              </TouchableOpacity>

              {/* Gallery */}
              <TouchableOpacity
                style={[
                  styles.attachOptionBox,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                ]}
                onPress={handlePickGallery}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  style={styles.attachIconCircle}
                >
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachOptionTitle, { color: colors.text }]}>Photos</Text>
                <Text style={[styles.attachOptionHint, { color: colors.textSecondary }]}>
                  From gallery
                </Text>
              </TouchableOpacity>

              {/* Document / PDF */}
              <TouchableOpacity
                style={[
                  styles.attachOptionBox,
                  { backgroundColor: colors.bgCard, borderColor: colors.border },
                ]}
                onPress={handlePickDocument}
              >
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  style={styles.attachIconCircle}
                >
                  <Ionicons name="document-text" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[styles.attachOptionTitle, { color: colors.text }]}>PDF Report</Text>
                <Text style={[styles.attachOptionHint, { color: colors.textSecondary }]}>
                  Diet / Labs
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CHAT HISTORY MODAL */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.bg,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="time-outline" size={22} color={colors.brandPurple} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Chat History
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Start New Chat in Modal */}
            <TouchableOpacity
              style={[styles.modalNewBtn, { backgroundColor: colors.brandPurple }]}
              onPress={handleNewChat}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.modalNewBtnText}>Start New Conversation</Text>
            </TouchableOpacity>

            {/* List of past conversations */}
            {conversations.length === 0 ? (
              <View style={styles.modalEmpty}>
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={42}
                  color={colors.textMuted}
                />
                <Text style={[styles.modalEmptyText, { color: colors.textSecondary }]}>
                  No past conversations yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingVertical: 8 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item._id === currentConversationId;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.historyItem,
                        {
                          backgroundColor: isSelected
                            ? colors.brandPurpleLight
                            : colors.bgCard,
                          borderColor: isSelected
                            ? colors.brandPurple
                            : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectConversation(item)}
                    >
                      <MaterialCommunityIcons
                        name="message-text-outline"
                        size={20}
                        color={isSelected ? colors.brandPurple : colors.textMuted}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[
                            styles.historyTitle,
                            {
                              color: colors.text,
                              fontWeight: isSelected ? "700" : "500",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.title || "Untitled Conversation"}
                        </Text>
                        <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                          {new Date(
                            item.lastMessageAt || item.createdAt
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteConversation(item._id)}
                        style={styles.deleteBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Delete chat"
                      >
                        <Ionicons name="trash-outline" size={18} color="#F44336" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* FULL-SCREEN IMAGE VIEWER MODAL */}
      <Modal
        visible={!!previewImageUri}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImageUri(null)}
      >
        <View style={styles.fullImageOverlay}>
          <TouchableOpacity
            style={styles.closeFullImageBtn}
            onPress={() => setPreviewImageUri(null)}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImageUri && (
            <Image
              source={{ uri: previewImageUri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  historyDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#9747FF",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "100%",
  },
  headerAiBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  feedAddButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subHeaderPillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  capsulePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  capsulePillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quotaPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  heroBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 320,
  },
  suggestionsContainer: {
    width: "100%",
  },
  suggestionsHeader: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  promptsGrid: {
    gap: 10,
  },
  promptCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  promptCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  promptIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  promptDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  messageList: {
    paddingHorizontal: 14,
    paddingTop: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  modelRow: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    maxWidth: "84%",
    padding: 13,
    borderRadius: 18,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  chatImage: {
    width: Math.min(SCREEN_WIDTH * 0.62, 220),
    height: Math.min(SCREEN_WIDTH * 0.62, 220),
    borderRadius: 12,
    backgroundColor: "#333",
  },
  chatDocPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
    maxWidth: Math.min(SCREEN_WIDTH * 0.65, 240),
  },
  chatDocText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  aiFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  aiDisclaimerTiny: {
    fontSize: 10,
    flex: 1,
  },
  aiActionBtnsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    padding: 4,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  inputContainerOuter: {
    paddingHorizontal: 14,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputCapsule: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  attachmentTray: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 10,
  },
  trayItem: {
    position: "relative",
  },
  trayThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  trayDocBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    maxWidth: 160,
  },
  trayDocName: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  removeTrayBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#EF4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  trayCount: {
    fontSize: 11,
    marginLeft: "auto",
    paddingRight: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  plusAttachBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  chatTextInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 120,
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 6,
    lineHeight: 20,
  },
  sendArrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  attachSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(128,128,128,0.4)",
    alignSelf: "center",
    marginBottom: 16,
  },
  attachSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  attachSheetSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  attachOptionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  attachOptionBox: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  attachIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  attachOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  attachOptionHint: {
    fontSize: 10,
    textAlign: "center",
  },
  modalSheet: {
    height: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    marginVertical: 12,
    gap: 6,
  },
  modalNewBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  modalEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modalEmptyText: {
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  historyTitle: {
    fontSize: 13,
  },
  historyDate: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeFullImageBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  fullImage: {
    width: SCREEN_WIDTH * 0.95,
    height: "75%",
  },
});
