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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const screenWidth = Dimensions.get("window").width;

const CommunityPosts = ({
  communityId,
  posts,
  communityName,
  setPosts,
  onCreatePost,
}: {
  communityId: string;
  communityName: string;
  posts: any[];
  setPosts: any;
  onCreatePost?: () => void;
}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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
    async (pageToFetch: number = 1, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        
        let allPost = showMyPosts ? false : true;
        const response = await communityService.getCommunityPosts(
          communityId,
          pageToFetch,
          10,
          allPost
        );

        if (response.success) {
          if (append) {
            setPosts((prev: any[]) => [...prev, ...response.data]);
          } else {
            setPosts(response.data);
          }
          const totalPages = response.pagination?.totalPages || 0;
          setHasMore(pageToFetch < totalPages);
          setPage(pageToFetch);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
      }
    },
    [communityId, showMyPosts]
  );

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchPosts(1, false);
      return () => {
        // Screen is unfocused (navigated away)
        if (videoRef.current) {
          videoRef.current.stopAsync?.();
        }
      };
    }, [showMyPosts])
  );

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore && !isLoading) {
      fetchPosts(page + 1, true);
    }
  }, [page, hasMore, loadingMore, isLoading, fetchPosts]);

  const handleEndReached = useCallback(() => {
    if (!onEndReachedCalledDuringMomentum) {
      loadMorePosts();
      setOnEndReachedCalledDuringMomentum(true);
    }
  }, [onEndReachedCalledDuringMomentum, loadMorePosts]);
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


  const renderMedia = (postId: string, media: string[], type: string) => {
    if (!media?.length) return null;

    const handleScroll = (event: any) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
      setActiveMediaIndex((prev) => ({ ...prev, [postId]: index }));
    };

    return (
      <View style={styles.mediaContainer}>
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
              <View style={styles.mediaItemWrapper}>
                {isVideo ? (
                  <Video
                    ref={videoRef}
                    source={{ uri: mediaUrl }}
                    style={styles.mediaImage}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay
                  />
                ) : (
                  <Pressable onPress={() => openModal(mediaUrl, "image")}>
                    <Image
                      source={{ uri: mediaUrl }}
                      resizeMode="cover"
                      style={styles.mediaImage}
                    />
                  </Pressable>
                )}
              </View>
            );
          }}
        />
        {media.length > 1 && (
          <View style={styles.dotsContainer}>
            {media.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  (activeMediaIndex[postId] || 0) === idx && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Header - Instagram style */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {item.createdBy?.profilePic ? (
            <Image
              source={{ uri: item.createdBy.profilePic }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#999" />
            </View>
          )}
          <View>
            <Text style={styles.username}>
              {item.createdBy?.name || "Anonymous"}
            </Text>
            {item.createdAt && (
              <Text style={styles.timeText}>
                {dayjs(item.createdAt).fromNow()}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowMenuForPost((prev) =>
              prev === item._id ? null : item._id
            );
          }}
          style={styles.menuButton}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Media - Full width Instagram style */}
      {renderMedia(item._id, item.media, item.type)}

      {/* Actions Row */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity 
            onPress={() => handleToggleLike(item)}
            style={styles.actionButton}
          >
            <Ionicons
              name={item.likedByUser ? "heart" : "heart-outline"}
              size={28}
              color={item.likedByUser ? "#FF3040" : "#000"}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => toggleCommentSection(item._id)}
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      {item.likeCount > 0 && (
        <Text style={styles.likesText}>
          {item.likeCount} {item.likeCount === 1 ? "like" : "likes"}
        </Text>
      )}

      {/* Caption */}
      {item.text && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>
              {item.createdBy?.name || "Anonymous"}{" "}
            </Text>
            {item.text}
          </Text>
        </View>
      )}

      {/* View Comments */}
      {item.commentCount > 0 && (
        <TouchableOpacity 
          onPress={() => toggleCommentSection(item._id)}
          style={styles.viewCommentsButton}
        >
          <Text style={styles.viewCommentsText}>
            View all {item.commentCount} {item.commentCount === 1 ? "comment" : "comments"}
          </Text>
        </TouchableOpacity>
      )}

      {visibleComments[item._id] && (
        <View style={styles.commentSection}>
          {commentsMap[item._id]?.slice(0, 2).map((comment, idx) => (
            <View key={idx} style={styles.commentItem}>
              <Text style={styles.commentText}>
                <Text style={styles.commentUser}>
                  {comment.user?.name || "User"}{" "}
                </Text>
                {comment.text}
              </Text>
            </View>
          ))}
          {commentsMap[item._id]?.length > 2 && (
            <TouchableOpacity 
              onPress={() => toggleCommentSection(item._id)}
              style={styles.viewAllComments}
            >
              <Text style={styles.viewAllCommentsText}>
                View all {commentsMap[item._id].length} comments
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.commentInputWrapper}>
            <TextInput
              value={newComments[item._id] || ""}
              onChangeText={(text) =>
                setNewComments((prev) => ({ ...prev, [item._id]: text }))
              }
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              style={styles.commentInput}
            />
            <TouchableOpacity 
              onPress={() => handleCommentAdd(item._id)}
              disabled={!newComments[item._id]?.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={newComments[item._id]?.trim() ? "#67C694" : "#999"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showMenuForPost === item._id && (
        <View
          style={{
            position: "absolute",
            right: "10%",
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
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
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={() => setOnEndReachedCalledDuringMomentum(false)}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingFooter}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Loading more posts...</Text>
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
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
  listContent: {
    paddingBottom: 0,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.mutedText,
    fontFamily: theme.fonts.regular,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: 0,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 12,
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
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
    color: "#000",
    fontFamily: theme.fonts.bold,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    fontFamily: theme.fonts.regular,
    marginTop: 2,
  },
  menuButton: {
    padding: 4,
  },
  mediaContainer: {
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
  },
  mediaItemWrapper: {
    width: screenWidth,
    height: screenWidth,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaImage: {
    width: screenWidth,
    height: screenWidth,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#FFFFFF",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  likesText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#000",
    paddingHorizontal: 12,
    marginTop: 4,
    fontFamily: theme.fonts.bold,
  },
  captionContainer: {
    paddingHorizontal: 12,
    marginTop: 6,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    color: "#000",
    fontFamily: theme.fonts.regular,
  },
  captionUsername: {
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: "#000",
  },
  viewCommentsButton: {
    paddingHorizontal: 12,
    marginTop: 4,
  },
  viewCommentsText: {
    fontSize: 14,
    color: "#999",
    fontFamily: theme.fonts.regular,
  },
  commentSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  commentItem: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
    color: "#000",
    fontFamily: theme.fonts.regular,
  },
  commentUser: {
    fontWeight: "600",
    fontFamily: theme.fonts.bold,
    color: "#000",
  },
  viewAllComments: {
    marginTop: 4,
    marginBottom: 8,
  },
  viewAllCommentsText: {
    fontSize: 14,
    color: "#999",
    fontFamily: theme.fonts.regular,
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    fontFamily: theme.fonts.regular,
    paddingVertical: 4,
    marginRight: 8,
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
