import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { Filter } from "bad-words";

const filter = new Filter();
import { communityService } from "@/app/services/community.service";
import { useFocusEffect } from "expo-router";
import theme from "@/app/Theme/globalTheme";
import ImageViewerModal from "@/app/modules/ImageModel";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import { Post } from "@/app/interfaces/communityService";

const screenWidth = Dimensions.get("window").width;

const CommunityPosts = ({
  communityId,
  posts,
  communityName,
  setPosts,
}: {
  communityId: string;
  communityName: string;
  posts: any[];
  setPosts: any;
}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleComments, setVisibleComments] = useState<
    Record<string, boolean>
  >({});
  const [
    onEndReachedCalledDuringMomentum,
    setOnEndReachedCalledDuringMomentum,
  ] = useState(false);
  const [deleteloading, setDeleteLoading] = useState<any>({
    _id: null,
    loading: true,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
  } | null>(null);
  const videoRef: any = useRef(null);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [activeMediaIndex, setActiveMediaIndex] = useState<
    Record<string, number>
  >({});
  const [showMenuForPost, setShowMenuForPost] = useState<string | null>(null);
  const [showTooltipForPost, setShowTooltipForPost] = useState<string | null>(
    null
  );
  const [selected, setSelected] = useState("All Posts"); // default
  const [open, setOpen] = useState(false);

  const options = ["All Posts", "My Posts"];

  const handleSelect = (option: string) => {
    setSelected(option);
    setOpen(false);
  };
  const [toolTipActionType, setToolTipActionType] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  async function handleDelete(_id: any) {
    try {
      setDeleteLoading({ _id: _id, loading: true });
      const response = await communityService.deletePost(_id);

      if (response.success) {
        setPosts((prevPosts: any[]) =>
          prevPosts.filter((post) => post._id !== _id)
        );
      } else {
        alert("Unable to delete the post");
      }
    } catch (error) {
      alert("Unable to delete the post");
    } finally {
      setDeleteLoading({ _id: null, loading: false });
    }
  }

  const fetchPosts = useCallback(
    async (pageToFetch: number = 1) => {
      try {
        let allPost = showMyPosts ? false : true;
        const response = await communityService.getCommunityPosts(
          communityId,
          pageToFetch,
          20,
          allPost
        );

        if (response.success) {
          setPosts(response.data);
          const totalPages = response.pagination.totalPages;
          setHasMore(pageToFetch < totalPages);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [communityId, setPosts, showMyPosts]
  );

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchPosts(page);
      return () => {
        // Screen is unfocused (navigated away)

        if (videoRef.current) {
          videoRef.current.stopAsync?.();
        }
      };
    }, [page, showMyPosts])
  );
  async function toolTipAction(postDetails: any, type: string) {
    try {
      if (type === "complain") {
        setShowTooltipForPost(postDetails._id);

        let complainerId;
        setToolTipActionType(type);
        let loggedUser =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
        if (loggedUser.exists) {
          complainerId = loggedUser.data._id;
        }
        const response = await userService.addUserComplain({
          complainType: "feed",
          complainedId: postDetails.createdBy._id,
          complainerId: complainerId,
          postId: postDetails._id,
        });
        setShowTooltipForPost(null);
        alert(
          type === "complain"
            ? "Your complain has been recived by us ,we will have a look"
            : "You have successfully blocked this user"
        );
        setShowMenuForPost(null);
      } else {
        setBlockLoading(true);

        if (!postDetails?.createdBy?._id) {
          alert("Block request has been sent");
        } else {
          //// Blocking the user -------------------------/
          setShowTooltipForPost(postDetails._id);
          let response = await userService.blockUser({
            blockedUserId: postDetails.createdBy._id || null,
          });

          setShowTooltipForPost(null);
          alert(
            type === "complain"
              ? "Your complain has been recived by us ,we will have a look"
              : "You have successfully blocked this user"
          );
          setBlockLoading(false);
          setShowMenuForPost(null);
          fetchPosts(page);
        }
      }

      return;
    } catch (error) {
      setShowTooltipForPost(null);
      alert(
        type === "complain"
          ? "Your complain has been recived by us ,we will have a look"
          : "You have successfully blocked this user"
      );
      setShowMenuForPost(null);
    } finally {
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await communityService.getPostComment(postId);
      if (response.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: response.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const openModal = (url: string, type: "image" | "video") => {
    setSelectedMedia({ url, type });
    setModalVisible(true);
  };
  const toggleCommentSection = async (postId: string) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
    if (!commentsMap[postId]) await fetchComments(postId);
  };

  const handleCommentAdd = async (postId: string) => {
    let text = newComments[postId];
    if (!text?.trim()) return;

    text = filter.clean(text); // 👈 Censoring bad words

    try {
      const response = await communityService.createPostComment(postId, text);
      if (response.success) {
        await fetchComments(postId);
        setPosts((prevPosts: any) =>
          prevPosts.map((post: any) =>
            post._id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post
          )
        );
        setNewComments((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleToggleLike = async (post: Post) => {
    let { _id: postId, createdBy } = post;

    if (!postId) {
      alert("Some error has happened");
      return;
    }
    const loggedUser =
      await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
    const notificationData = {
      reciverId: createdBy._id || null,
      senderId: loggedUser.exists ? loggedUser.data._id : null,
    };

    communityService
      .togglePostLike(postId, notificationData)
      .then((response) => {
        console.log("this is like response", response);

        setPosts((prevPosts: any) =>
          prevPosts.map((p: any) =>
            p._id === postId
              ? {
                  ...p,
                  likedByUser: !p.likedByUser,
                  likeCount: p.likedByUser ? p.likeCount - 1 : p.likeCount + 1,
                }
              : p
          )
        );
      })
      .catch((error) => {
        console.error("Error toggling like:", error);
        alert("Failed to toggle like. Please try again.");
      });
  };

  const PaginationControls = () => (
    <View style={styles.paginationControls}>
      <TouchableOpacity
        style={[styles.pageButton, page === 1 && styles.disabledButton]}
        onPress={() => setPage((prev) => Math.max(1, prev - 1))}
        disabled={page === 1}
      >
        <Ionicons name="arrow-back" size={18} color="#000" />
        <Text style={styles.pageButtonText}>Prev</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.pageButton, !hasMore && styles.disabledButton]}
        onPress={() => setPage((prev) => prev + 1)}
        disabled={!hasMore}
      >
        <Text style={styles.pageButtonText}>Next</Text>
        <Ionicons name="arrow-forward" size={18} color="#000" />
      </TouchableOpacity>
    </View>
  );

  const renderMedia = (postId: string, media: string[], type: string) => {
    if (!media?.length) return null;

    const handleScroll = (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
      setActiveMediaIndex((prev) => ({ ...prev, [postId]: index }));
    };

    return (
      <View style={{ width: "100%", alignItems: "center", marginBottom: 10 }}>
        <FlatList
          data={media}
          keyExtractor={(uri, idx) => `${uri}-${idx}`}
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item: mediaUrl }) => {
            const isVideo =
              mediaUrl.endsWith(".mp4") ||
              mediaUrl.includes("video") ||
              type === "video";

            return (
              <View
                style={{
                  width: 340,

                  height: 300,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {isVideo ? (
                  <Video
                    ref={videoRef}
                    source={{ uri: mediaUrl }}
                    style={{
                      width: 300,
                      height: 300,
                      borderRadius: 10,
                    }}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay
                  />
                ) : (
                  <Pressable onPress={() => openModal(mediaUrl, "image")}>
                    <Image
                      source={{ uri: mediaUrl }}
                      resizeMode="cover"
                      style={{
                        width: 300,
                        height: 300,
                        borderRadius: 10,
                      }}
                    />
                  </Pressable>
                )}
              </View>
            );
          }}
        />
        {media.length > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            {media.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor:
                    (activeMediaIndex[postId] || 0) === idx ? "#333" : "#bbb",
                }}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View
        style={[
          styles.header,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {item.createdBy?.profilePic ? (
            <Image
              source={{ uri: item.createdBy.profilePic }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={40}
              color="gray"
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={styles.username}>
            {item.createdBy?.name || "Anonymous"}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {showMyPosts && (
            <>
              {deleteloading.loading && deleteloading._id === item._id ? (
                <View>
                  <ActivityIndicator />
                </View>
              ) : (
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                  <Ionicons name="trash-outline" size={24} color="#000" />
                </TouchableOpacity>
              )}
            </>
          )}
          <TouchableOpacity
            onPress={() => {
              setShowMenuForPost((prev) =>
                prev === item._id ? null : item._id
              );
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {item.text && <Text style={styles.text}>{item.text}</Text>}
      {renderMedia(item._id, item.media, item.type)}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleToggleLike(item)}>
          <Ionicons
            name={item.likedByUser ? "heart" : "heart-outline"}
            size={20}
            color={item.likedByUser ? "red" : "#333"}
          />
        </TouchableOpacity>
        <Text style={styles.iconText}>{item.likeCount ?? 0}</Text>
        {/* 
        <TouchableOpacity
          style={{ marginLeft: 16 }}
          onPress={() => toggleCommentSection(item._id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.iconText}>{item.commentCount ?? 0}</Text> */}
      </View>

      {visibleComments[item._id] && (
        <View style={styles.commentSection}>
          {commentsMap[item._id]?.map((comment, idx) => (
            <Text key={idx} style={styles.commentText}>
              <Text style={styles.commentUser}>
                {comment.user?.name || "User"}:{" "}
              </Text>
              {comment.text}
            </Text>
          ))}

          <View style={styles.commentInputWrapper}>
            <TextInput
              value={newComments[item._id] || ""}
              onChangeText={(text) =>
                setNewComments((prev) => ({ ...prev, [item._id]: text }))
              }
              placeholder="Add a comment..."
              style={styles.commentInput}
            />
            <TouchableOpacity onPress={() => handleCommentAdd(item._id)}>
              <Ionicons name="send" size={20} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showMenuForPost === item._id && (
        <View
          style={{
            position: "absolute",
            right: "6%",
            top: "5%",
            backgroundColor: "#fff",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 6,
            elevation: 5,
            paddingVertical: 8,
            width: 180,
            zIndex: 1300,
          }}
        >
          {showTooltipForPost === item._id ? (
            <ActivityIndicator style={{ paddingVertical: 12 }} />
          ) : (
            <TouchableOpacity
              onPress={() => toolTipAction(item, "complain")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 15,
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                Complain
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View
            style={{
              height: 1,
              backgroundColor: "#eee",
              marginHorizontal: 10,
            }}
          />

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Block User",
                "Are you sure you want to block this user? You won't be able to see their content from now on.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Yes, Block",
                    onPress: async () => {
                      let loggedUser =
                        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage(
                          "user"
                        );
                      let currentUser = loggedUser.exists
                        ? loggedUser.data._id
                        : null;

                      if (item.createdBy._id === currentUser) {
                        Alert.alert(
                          "Action not allowed",
                          "You can't block yourself"
                        );
                      } else {
                        toolTipAction(item, "block");
                      }
                    },
                  },
                ]
              );
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            {blockLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="red" />
                <Text
                  style={{
                    marginLeft: 10,
                    fontSize: 15,
                    color: "red",
                    fontWeight: "600",
                  }}
                >
                  Block User
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",

          marginVertical: 10,
          paddingHorizontal: 16,
        }}
      >
        {/* Community Name with Icon */}
      </View>
      {isLoading && posts.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.noPostText}>No Posts Available Yet</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={renderPost}
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator style={{ marginVertical: 10 }} />
              ) : null
            }
          />
          <PaginationControls />
        </>
      )}
      {selectedMedia?.type === "image" && (
        <ImageViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          imageUrl={selectedMedia.url}
        />
      )}
    </View>
  );
};

export default CommunityPosts;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginVertical: 10,
    padding: 12,
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  noPostText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    fontWeight: "600",
    fontSize: 16,
  },
  text: {
    marginVertical: 8,
    fontSize: 14,
  },
  mediaWrapper: {
    position: "relative",
  },
  mediaItem: {
    width: 300,
    height: 250,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    margin: 4,
  },
  activeDot: {
    backgroundColor: "#000",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  iconText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#333",
  },
  commentSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  commentText: {
    marginBottom: 4,
    fontSize: 13,
  },
  commentUser: {
    fontWeight: "600",
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 0.5,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },

  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,

    paddingVertical: 8,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  disabledButton: {
    backgroundColor: "#bbb",
    opacity: 0.6,
  },

  pageButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 6,
  },

  pageNumberWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  pageNumber: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },

  pageNumberHighlight: {
    backgroundColor: theme.colors.primary,
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 8,
  },
  activeToggleButton: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  menuDropdown: {
    position: "absolute",
    right: 12,
    top: 50,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    zIndex: 10,
  },

  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#000",
  },

  tooltipBox: {
    backgroundColor: "#333",
    padding: 8,
    marginTop: 4,
    borderRadius: 6,
    alignSelf: "center", // center horizontally
    maxWidth: "50%",
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});
