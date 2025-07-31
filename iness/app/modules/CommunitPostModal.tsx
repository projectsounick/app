import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import theme from "../Theme/globalTheme";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import { Post } from "../interfaces/communityService";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { communityService } from "../services/community.service";
import { ActivityIndicator } from "react-native-paper";

const screenWidth = Dimensions.get("window").width;

const CustomPostModal = ({ setPosts }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [postType, setPostType] = useState<"text" | "image" | "video" | null>(
    null
  );
  const {
    loading,
    data,
    setLoading,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(communityService.createPost);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentMediaIndex(index);
  };

  const handleUploadMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        postType === "video"
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setMedia((prev) => [...prev, ...selectedUris]);
    }
  };
  const handlePost = async () => {
    if (!postType || (!caption && media.length === 0)) return;
    setLoading(true);
    try {
      const storageDetails =
        await userService.getStorageAccountDetails("community");
      if (!storageDetails.success) {
        alert("Server error, try again.");
        return;
      }

      const { storageAccountName, sasToken } = storageDetails.data;
      const userData =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

      if (!userData.exists) {
        alert("User not found.");
        return;
      }

      const userId = userData.data._id;

      let uploadedUrls: string[] = [];

      if (postType !== "text" && media.length > 0) {
        uploadedUrls = await Promise.all(
          media.map(async (fileUri) => {
            const type = fileUri.endsWith(".mp4") ? "video" : "image";
            const ext =
              fileUri.split(".").pop() || (type === "video" ? "mp4" : "jpg");
            const originalFileName =
              fileUri.split("/").pop() || `file-${Date.now()}.${ext}`;
            const fileName = `${userId}_${originalFileName}`;

            const uploadedUrl = await uploadToAzureFromExpo(
              fileUri,
              fileName,
              sasToken,
              storageAccountName,
              "admin-data",
              "community"
            );

            return uploadedUrl;
          })
        );
      }

      const post: Post = {
        communityId: "68866c50cf2f2ea93541e6f5",
        type: postType,
        media: uploadedUrls,
        text: caption,
        isActive: true,
        isApproved: true,

        createdBy: userId,
      };
      let response = await callService(post);
      if (response.success) {
        setPosts((prev: any) => [response.data, ...prev]);
      }
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setMedia([]);
      setCaption("");
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="images" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Choose your post type</Text>

              <View style={styles.optionContainer}>
                {["text", "image", "video"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      postType === type && styles.optionButtonSelected,
                    ]}
                    onPress={() => {
                      setPostType(type as any);
                      setMedia([]);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        postType === type && styles.optionButtonTextSelected,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {postType === "text" && (
                <TextInput
                  placeholder="Write your caption..."
                  multiline
                  style={styles.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                />
              )}

              {(postType === "image" || postType === "video") &&
                media.length > 0 && (
                  <View style={styles.sliderContainer}>
                    <TextInput
                      placeholder="Write your caption..."
                      multiline
                      style={styles.captionInput}
                      value={caption}
                      onChangeText={setCaption}
                    />
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      scrollEventThrottle={16}
                    >
                      {media.map((uri, index) =>
                        postType === "video" ? (
                          <Video
                            key={index}
                            source={{ uri }}
                            style={styles.slideImage}
                            useNativeControls
                          />
                        ) : (
                          <Image
                            key={index}
                            source={{ uri }}
                            style={styles.slideImage}
                          />
                        )
                      )}
                    </ScrollView>

                    <View style={styles.dotsContainer}>
                      {media.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dot,
                            i === currentMediaIndex && styles.activeDot,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}

              {(postType === "image" || postType === "video") && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUploadMedia}
                >
                  <Text style={styles.uploadButtonText}>Upload {postType}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    setPostType(null);
                    setMedia([]);
                    setCaption("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                {loading ? (
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.postButton}
                    onPress={() => {
                      handlePost();
                    }}
                  >
                    <Text style={styles.postButtonText}>Post</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default CustomPostModal;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: "3%",
    left: "50%",
    transform: [{ translateX: -30 }], // adjust based on button width
    backgroundColor: "#19002E",
    borderRadius: 30,
    padding: 16,
    zIndex: 99,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionButtonSelected: {
    backgroundColor: "#19002E",
    borderColor: "#19002E",
  },
  optionButtonText: {
    color: "#333",
  },
  optionButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  captionInput: {
    height: 100,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 15,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  slideImage: {
    width: screenWidth - 40,

    height: 150,
    resizeMode: "contain", // for Image
    borderRadius: 15,
    marginRight: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#19002E",
  },
  uploadButton: {
    backgroundColor: "#19002E",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#555",
    textAlign: "center",
  },
  postButton: {
    padding: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    flex: 1,
  },
  postButtonText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "600",
  },
});
