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
import theme from "@/app/Theme/globalTheme";

// Functional Component
const MediaComponentModal: React.FC<MediaComponentModalProps> = ({
  commentModalVisible,
  setCommentModalVisible,
  podcast,

  handleAddComment,
}) => {
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
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              backgroundColor: "#fff",
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
                backgroundColor: "#eee",
                borderRadius: 20,
                width: 32,
                height: 32,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 12,
                color: "#333",
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
                      backgroundColor: "#F5F5F5",
                      padding: 8,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: "#333",
                        marginRight: 4,
                      }}
                    >
                      {item.userName}:
                    </Text>
                    <Text style={{ color: "#444", flex: 1 }}>{item.comment}</Text>
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
                  <Text style={{ color: "#999", fontSize: 14 }}>
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
                borderTopColor: "#ccc",
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
                  borderColor: "#ccc",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  fontSize: 14,
                  marginRight: 10,
                }}
              />
              <TouchableOpacity
                onPress={() => addingComment(podcast)}
                style={{
                  backgroundColor: "#34A853",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Post</Text>
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
