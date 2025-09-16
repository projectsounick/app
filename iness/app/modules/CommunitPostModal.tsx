import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import { ActivityIndicator } from "react-native-paper";

import theme from "../Theme/globalTheme";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";
import { Post } from "../interfaces/communityService";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import { communityService } from "../services/community.service";

const screenWidth = Dimensions.get("window").width;

const CustomPostModal = ({ setPosts, communityId }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [postType, setPostType] = useState<"text" | "image" | "video" | null>(
    null
  );
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const { loading, callService, setLoading } = useServiceWithSnackbar(
    communityService.createPost
  );

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentMediaIndex(index);
  };

  const handleUploadMedia = async () => {
    // ✅ Only ask for permission on Android
    if (Platform.OS === "android") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "We need access to your gallery.");
        return;
      }
    }

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
        communityId: communityId || "68866c50cf2f2ea93541e6f5",
        type: postType,
        media: uploadedUrls,
        text: caption,
        isActive: true,
        isApproved: true,
        createdBy: userId,
      };

      let response = await callService(post);

      if (response.success) {
        const newPost = {
          ...response.data,
          likeCount: 0,
          likedByUser: false,
          commentCount: 0,
        };

        setPosts((prev: any) => [newPost, ...prev]);
      }
    } catch (err) {
      console.error("Post error:", err);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setMedia([]);
      setCaption("");
      setPostType(null);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={54} color="#19002E" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Dash Handle */}
              <View style={styles.dash} />

              <Text style={styles.modalTitle}>Create a Post</Text>

              {/* Post Type Options */}
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

              {/* Caption for text post */}
              {postType === "text" && (
                <TextInput
                  placeholder="Write your caption..."
                  multiline
                  style={styles.captionInput}
                  value={caption}
                  onChangeText={setCaption}
                />
              )}

              {/* Media Preview */}
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

                    <FlatList
                      data={media}
                      keyExtractor={(_, index) => index.toString()}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      scrollEventThrottle={14}
                      renderItem={({ item }) => (
                        <View style={styles.mediaItem}>
                          {postType === "video" ? (
                            <Video
                              source={{ uri: item }}
                              style={styles.media}
                              useNativeControls
                              resizeMode={ResizeMode.COVER}
                            />
                          ) : (
                            <Pressable>
                              <Image
                                source={{ uri: item }}
                                style={styles.media}
                                resizeMode="cover"
                              />
                            </Pressable>
                          )}
                        </View>
                      )}
                    />

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

              {/* Upload Button */}
              {(postType === "image" || postType === "video") && (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUploadMedia}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.uploadButtonText}>Upload {postType}</Text>
                </TouchableOpacity>
              )}

              {/* Action Buttons */}
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
                  <ActivityIndicator color="#19002E" />
                ) : (
                  <TouchableOpacity
                    style={styles.postButton}
                    onPress={handlePost}
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
    alignSelf: "center",
    zIndex: 99,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  dash: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    fontFamily: theme.fonts.bold,
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
    fontFamily: theme.fonts.bold,
  },
  captionInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sliderContainer: {
    marginBottom: 12,
  },
  mediaItem: {
    width: screenWidth - 60,
    height: 240,
    borderRadius: 15,
    marginHorizontal: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  media: {
    width: "100%",
    height: "100%",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19002E",
    padding: 12,
    borderRadius: 20,
    justifyContent: "center",
    marginTop: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 20,
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
    borderRadius: 20,
    flex: 1,
  },
  postButtonText: {
    color: "#000",
    textAlign: "center",
    fontFamily: theme.fonts.bold,
  },
});
