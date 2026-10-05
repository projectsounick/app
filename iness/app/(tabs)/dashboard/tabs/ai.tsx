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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import {
  aiCoachService,
  AiChatMessage,
  AiConversation,
  AiConfigData,
  AiAttachment,
} from "@/src/services/aiCoach.service";

interface LocalAttachment {
  uri: string;
  base64: string;
  mimeType: string;
  name: string;
  size?: number;
  type: "image" | "document";
}

// Helper component to render formatted AI text (bullet points, bold text)
function FormattedAiText({ content, textColor }: { content: string; textColor: string }) {
  const lines = content.split("\n");

  return (
    <View style={{ gap: 4 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={idx} style={{ height: 4 }} />;
        }

        const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ");
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
                ? { flexDirection: "row", alignItems: "flex-start", gap: 6, marginVertical: 1 }
                : undefined
            }
          >
            {isBullet && (
              <Text style={{ color: "#BDFF84", fontSize: 14, lineHeight: 20 }}>•</Text>
            )}
            {isNumbered && (
              <Text style={{ color: "#BDFF84", fontSize: 13, lineHeight: 20, fontWeight: "700" }}>
                {trimmed.match(/^\d+\./)?.[0] || "•"}
              </Text>
            )}
            <Text style={{ flex: isBullet || isNumbered ? 1 : undefined, fontSize: 14, lineHeight: 21, color: textColor }}>
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
  const [currentConversationTitle, setCurrentConversationTitle] = useState<string>("Iness AI Coach");
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<LocalAttachment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [personalize, setPersonalize] = useState<boolean>(true);
  const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);
  const [attachSheetVisible, setAttachSheetVisible] = useState<boolean>(false);
  const [aiConfig, setAiConfig] = useState<AiConfigData | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(30);
  const [quotaLimit, setQuotaLimit] = useState<number>(30);

  const flatListRef = useRef<FlatList>(null);

  // Dynamic Theme Colors
  const colors = {
    bg: theme.colors.background,
    bgSecondary: theme.colors.backgroundSecondary,
    bgCard: theme.colors.backgroundCard,
    text: theme.colors.text,
    textSecondary: theme.colors.textSecondary,
    textMuted: theme.colors.textMuted,
    border: theme.colors.border,
    divider: theme.colors.divider,
    accentPrimary: "#BDFF84",
    accentPurple: "#9747FF",
    bubbleUser: "#9747FF",
    inputBg: isDark ? "#22252B" : "#F0F1F5",
    quotaPositiveBg: isDark ? "rgba(189, 255, 132, 0.15)" : "rgba(52, 168, 83, 0.12)",
    quotaPositiveText: isDark ? "#BDFF84" : "#1B5E20",
    badgeBg: isDark ? "rgba(151, 71, 255, 0.2)" : "rgba(151, 71, 255, 0.1)",
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
        setCurrentConversationTitle(latest.title);
        loadMessages(latest._id);
      } else {
        setConversations([]);
        setCurrentConversationId(null);
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
      }
    } catch (error) {
      console.error("loadMessages error:", error);
    }
  };

  const handleSelectConversation = (conv: AiConversation) => {
    setCurrentConversationId(conv._id);
    setCurrentConversationTitle(conv.title);
    setHistoryModalVisible(false);
    loadMessages(conv._id);
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setCurrentConversationTitle("Iness AI Coach");
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

  // Image Picker
  const handlePickImage = async () => {
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

        const mimeType = asset.mimeType || (asset.name.endsWith(".pdf") ? "application/pdf" : "text/plain");
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

  const defaultSuggestions = aiConfig?.suggestedPrompts || [
    "How is my 10-day workout and step progress?",
    "Suggest a 15-minute quick full-body HIIT routine",
    "Substitute barbell squats for lower back stiffness",
    "Give me 3 high-protein snack ideas under 200 kcal",
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* TOP HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setHistoryModalVisible(true)}
          accessibilityLabel="Chat History"
        >
          <MaterialCommunityIcons name="history" size={24} color={colors.text} />
          {conversations.length > 0 && <View style={styles.historyBadgeDot} />}
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons name="robot" size={20} color={colors.accentPrimary} />
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {currentConversationTitle}
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Iness AI • Powered by Gemini
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.newChatBtn, { backgroundColor: colors.badgeBg }]}
          onPress={handleNewChat}
          accessibilityLabel="New Chat"
        >
          <MaterialCommunityIcons name="plus" size={18} color={isDark ? colors.accentPrimary : colors.accentPurple} />
          <Text style={[styles.newChatText, { color: isDark ? colors.accentPrimary : colors.accentPurple }]}>
            New
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUB-HEADER: PERSONALIZE TOGGLE + DAILY QUOTA BADGE */}
      <View style={[styles.subHeader, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.divider }]}>
        <View style={styles.toggleRow}>
          <Switch
            value={personalize}
            onValueChange={setPersonalize}
            trackColor={{ false: isDark ? "#3A3A3A" : "#D5D5D5", true: colors.accentPrimary }}
            thumbColor={personalize ? "#121212" : "#FFF"}
          />
          <View style={styles.toggleTextCol}>
            <View style={styles.toggleLabelRow}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={14} color={colors.accentPrimary} />
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                Personalize (10-Day Data)
              </Text>
            </View>
            <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
              {personalize ? "Uses your real steps, sleep, & workouts" : "General fitness mode"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.quotaBadge,
            {
              backgroundColor: quotaRemaining > 5 ? colors.quotaPositiveBg : "rgba(244, 67, 54, 0.12)",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={13}
            color={quotaRemaining > 5 ? colors.quotaPositiveText : "#F44336"}
          />
          <Text
            style={[
              styles.quotaText,
              { color: quotaRemaining > 5 ? colors.quotaPositiveText : "#F44336" },
            ]}
          >
            {quotaRemaining}/{quotaLimit} left
          </Text>
        </View>
      </View>

      {/* CHAT MESSAGES OR STARTER CARDS */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {initialLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.accentPrimary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Starting Iness AI Coach...
            </Text>
          </View>
        ) : messages.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={isDark ? ["#411D6E", "#1F1335"] : ["#9747FF", "#6825C9"]}
              style={styles.heroBadge}
            >
              <MaterialCommunityIcons name="robot-excited" size={46} color="#BDFF84" />
            </LinearGradient>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Your Personal AI Fitness Coach
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Ask about workout swaps, quick routines, nutrition, form checks, or attach a photo or medical/diet report PDF.
            </Text>

            <View style={styles.suggestionsContainer}>
              <Text style={[styles.suggestionsHeader, { color: colors.textSecondary }]}>
                Quick Prompts:
              </Text>
              {defaultSuggestions.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.suggestionCard,
                    {
                      backgroundColor: colors.bgCard,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleSendMessage(prompt)}
                >
                  <MaterialCommunityIcons name="chat-question" size={18} color={colors.accentPrimary} />
                  <Text
                    style={[styles.suggestionText, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {prompt}
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              const allItemAttachments = item.attachments || (item.images || []).map((img: { url: string; mimeType?: string }) => ({
                url: img.url,
                mimeType: img.mimeType || "image/jpeg",
                name: "photo.jpg",
              }));

              return (
                <View style={[styles.messageRow, isUser ? styles.userRow : styles.modelRow]}>
                  {!isUser && (
                    <View style={styles.aiAvatar}>
                      <MaterialCommunityIcons name="robot" size={15} color="#000" />
                    </View>
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
                            return <Image key={i} source={{ uri: att.url }} style={styles.chatImage} />;
                          }
                          return (
                            <View
                              key={i}
                              style={[
                                styles.chatDocPill,
                                {
                                  backgroundColor: isUser
                                    ? "rgba(255,255,255,0.18)"
                                    : isDark
                                    ? "#1E1E28"
                                    : "#EFEFF4",
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="file-document-outline"
                                size={18}
                                color={isUser ? "#FFF" : colors.accentPrimary}
                              />
                              <Text
                                style={[
                                  styles.chatDocText,
                                  { color: isUser ? "#FFF" : colors.text },
                                ]}
                                numberOfLines={1}
                              >
                                {att.name || "Attached Document"}
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
                      <FormattedAiText content={item.content} textColor={colors.text} />
                    )}

                    {/* AI Bubble Footer */}
                    {!isUser && (
                      <View style={[styles.aiFooter, { borderTopColor: colors.divider }]}>
                        <Text style={[styles.aiDisclaimerTiny, { color: colors.textMuted }]}>
                          AI-generated for guidance
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleReportMessage(item._id)}
                          style={styles.flagBtn}
                          accessibilityLabel="Report message"
                        >
                          <MaterialCommunityIcons name="flag-outline" size={14} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              loading ? (
                <View style={[styles.messageRow, styles.modelRow]}>
                  <View style={styles.aiAvatar}>
                    <MaterialCommunityIcons name="robot" size={15} color="#000" />
                  </View>
                  <View
                    style={[
                      styles.bubble,
                      styles.modelBubble,
                      { backgroundColor: colors.bgCard, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.typingRow}>
                      <ActivityIndicator size="small" color={colors.accentPrimary} />
                      <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                        Iness AI is analyzing...
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* ATTACHED FILES PREVIEWS (BEFORE SENDING) */}
        {attachedFiles.length > 0 && (
          <View style={[styles.previewContainer, { backgroundColor: colors.bgSecondary }]}>
            {attachedFiles.map((file, idx) => (
              <View key={idx} style={styles.previewItem}>
                {file.type === "image" ? (
                  <Image source={{ uri: file.uri }} style={styles.previewImage} />
                ) : (
                  <View style={[styles.previewDocBox, { backgroundColor: colors.bgCard }]}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color="#F44336" />
                    <Text style={[styles.previewDocName, { color: colors.text }]} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => handleRemoveAttachment(idx)}
                >
                  <MaterialCommunityIcons name="close" size={12} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            <Text style={[styles.previewCount, { color: colors.textSecondary }]}>
              {attachedFiles.length}/2 attached
            </Text>
          </View>
        )}

        {/* INPUT BAR */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.bgSecondary,
              borderTopColor: colors.divider,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.attachBtn,
              {
                backgroundColor: colors.bgCard,
                opacity: attachedFiles.length >= 2 ? 0.4 : 1,
              },
            ]}
            onPress={() => setAttachSheetVisible(true)}
            disabled={attachedFiles.length >= 2}
            accessibilityLabel="Attach photo or document"
          >
            <MaterialCommunityIcons
              name="paperclip"
              size={22}
              color={isDark ? colors.accentPrimary : colors.accentPurple}
            />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
              },
            ]}
            placeholder={
              quotaRemaining > 0
                ? "Ask about workouts, form, or diet..."
                : "Daily limit reached (30/30)"
            }
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={quotaRemaining > 0 && !loading}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  (!inputText.trim() && attachedFiles.length === 0) || loading || quotaRemaining <= 0
                    ? isDark ? "#2A2D30" : "#D6D6DD"
                    : colors.accentPrimary,
              },
            ]}
            onPress={() => handleSendMessage()}
            disabled={(!inputText.trim() && attachedFiles.length === 0) || loading || quotaRemaining <= 0}
            accessibilityLabel="Send message"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={
                  (!inputText.trim() && attachedFiles.length === 0) || quotaRemaining <= 0
                    ? colors.textMuted
                    : "#000"
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ATTACHMENT ACTION SHEET (IMAGE OR DOCUMENT) */}
      <Modal
        visible={attachSheetVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAttachSheetVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
          activeOpacity={1}
          onPress={() => setAttachSheetVisible(false)}
        >
          <View
            style={[
              styles.attachSheet,
              {
                backgroundColor: colors.bg,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            <Text style={[styles.attachSheetTitle, { color: colors.text }]}>Add Attachment</Text>
            <Text style={[styles.attachSheetSubtitle, { color: colors.textSecondary }]}>
              Upload a meal/workout photo or medical/diet report PDF (max 2)
            </Text>

            <View style={styles.attachOptionsRow}>
              <TouchableOpacity
                style={[styles.attachOptionBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                onPress={handlePickImage}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: "rgba(189, 255, 132, 0.15)" }]}>
                  <MaterialCommunityIcons name="camera" size={26} color="#BDFF84" />
                </View>
                <Text style={[styles.attachOptionTitle, { color: colors.text }]}>Upload Photo</Text>
                <Text style={[styles.attachOptionHint, { color: colors.textSecondary }]}>
                  Meal, Gym Equipment, Posture
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attachOptionBox, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                onPress={handlePickDocument}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: "rgba(151, 71, 255, 0.15)" }]}>
                  <MaterialCommunityIcons name="file-pdf-box" size={26} color="#9747FF" />
                </View>
                <Text style={[styles.attachOptionTitle, { color: colors.text }]}>Upload Document</Text>
                <Text style={[styles.attachOptionHint, { color: colors.textSecondary }]}>
                  Blood Report, Diet Plan PDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CHAT HISTORY MODAL (DRAWER) */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.65)" }]}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.bg,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <View style={styles.modalTitleRow}>
                <MaterialCommunityIcons name="history" size={22} color={colors.accentPrimary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Chat History
                </Text>
              </View>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Start New Chat in Modal */}
            <TouchableOpacity
              style={[styles.modalNewBtn, { backgroundColor: colors.accentPurple }]}
              onPress={handleNewChat}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
              <Text style={styles.modalNewBtnText}>Start New Conversation</Text>
            </TouchableOpacity>

            {/* List of past conversations */}
            {conversations.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={[styles.modalEmptyText, { color: colors.textSecondary }]}>
                  No past conversations yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={conversations}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item }) => {
                  const isSelected = item._id === currentConversationId;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.historyItem,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? "rgba(151, 71, 255, 0.2)"
                              : "#F0E7FF"
                            : colors.bgCard,
                          borderColor: isSelected ? colors.accentPurple : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectConversation(item)}
                    >
                      <MaterialCommunityIcons
                        name="message-text-outline"
                        size={20}
                        color={isSelected ? colors.accentPrimary : colors.textMuted}
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
                          {item.title}
                        </Text>
                        <Text style={[styles.historyDate, { color: colors.textMuted }]}>
                          {new Date(item.lastMessageAt || item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteConversation(item._id)}
                        style={styles.deleteBtn}
                        accessibilityLabel="Delete chat"
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={18} color="#F44336" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 6,
    position: "relative",
  },
  historyBadgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#BDFF84",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    maxWidth: 200,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  newChatText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTextCol: {
    marginLeft: 8,
    flex: 1,
  },
  toggleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  toggleHint: {
    fontSize: 10,
    marginTop: 1,
  },
  quotaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  quotaText: {
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  heroBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 26,
  },
  suggestionsContainer: {
    width: "100%",
  },
  suggestionsHeader: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
    backgroundColor: "#BDFF84",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 2,
  },
  bubble: {
    maxWidth: "82%",
    padding: 14,
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
    lineHeight: 20,
  },
  chatImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  chatDocPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
    maxWidth: 220,
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
    fontSize: 9,
    flex: 1,
  },
  flagBtn: {
    padding: 4,
    marginLeft: 6,
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
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  previewItem: {
    position: "relative",
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  previewDocBox: {
    width: 80,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  previewDocName: {
    fontSize: 9,
    marginTop: 2,
  },
  removeImageBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F44336",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  previewCount: {
    fontSize: 11,
    marginLeft: "auto",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  attachSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  attachIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  attachOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  attachOptionHint: {
    fontSize: 10,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    height: "75%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
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
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  modalEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  historyTitle: {
    fontSize: 13,
  },
  historyDate: {
    fontSize: 10,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
});
