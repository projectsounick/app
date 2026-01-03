import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // make sure you have this installed
import {
  MediaComponentModalProps,
  PodcastInterface,
} from "@/app/interfaces/podcastsInterface";
import CustomSnackbar from "@/app/modules/Snackbar";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

// Functional Component
const MediaComponentModal: React.FC<MediaComponentModalProps> = ({
  commentModalVisible,
  setCommentModalVisible,
  podcast,

  handleAddComment,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [commentInput, setCommentInput] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  function addingComment(podcast: PodcastInterface) {
    if (commentInput.trim() === "") {
      setSnackbarVisible(true);
      setSnackbarMessage("Comment can not be empty");
      return;
    }
    if (!podcast?._id) {
      setSnackbarVisible(true);
      setSnackbarMessage("Invalid podcast");
      return;
    }
    let comment = commentInput.trim();
    setCommentInput("");

    handleAddComment({ podcastId: podcast._id, comment: comment });
  }
  return (
    <>
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 16,
              padding: 20,
              maxHeight: "80%",
              position: "relative",
            }}
          >
            <TouchableOpacity
              onPress={() => setCommentModalVisible(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 20,
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: theme.fontSizes.medium,
                fontWeight: theme.fontWeights.bold as "700",
                marginBottom: 12,
                color: theme.colors.text,
              }}
            >
              Comments
            </Text>

            <ScrollView
              style={{ flexGrow: 0, maxHeight: 250, marginBottom: 16 }}
              nestedScrollEnabled
            >
              {podcast?.interactions && Array.isArray(podcast.interactions) && podcast.interactions.length > 0 ? (
                podcast.interactions.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      marginBottom: 8,
                      backgroundColor: theme.colors.border,
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: theme.fontWeights.bold as "700",
                        color: theme.colors.text,
                        marginRight: 4,
                      }}
                    >
                      {item.userName}:
                    </Text>
                    <Text style={{ color: theme.colors.text, flex: 1 }}>{item.comment}</Text>
                  </View>
                ))
              ) : (
                <View
                  style={{
                    padding: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes.regularSmall }}>
                    No comments yet. Be the first to comment!
                  </Text>
                </View>
              )}
            </ScrollView>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: theme.colors.divider,
                paddingTop: 10,
              }}
            >
              <TextInput
                placeholder="Add a comment..."
                value={commentInput}
                onChangeText={setCommentInput}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: theme.colors.divider,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  fontSize: theme.fontSizes.regularSmall,
                  marginRight: 10,
                }}
              />
              <TouchableOpacity
                onPress={() => addingComment(podcast)}
                style={{
                  backgroundColor: theme.colors.success,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: theme.colors.textWhite, fontWeight: theme.fontWeights.bold as "700" }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </>
  );
};

export default MediaComponentModal;
