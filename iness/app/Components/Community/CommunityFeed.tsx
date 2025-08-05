import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { communityService } from "@/app/services/community.service";
import { useFocusEffect } from "expo-router";
import theme from "@/app/Theme/globalTheme";
import ImageViewerModal from "@/app/modules/ImageModel";

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
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [activeMediaIndex, setActiveMediaIndex] = useState<
    Record<string, number>
  >({});
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
      console.log("called");

      setIsLoading(true);
      try {
        let allPost = showMyPosts ? false : true;
        const response = await communityService.getCommunityPosts(
          communityId,
          pageToFetch,
          20,
          allPost
        );
        console.log(response);

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

  useEffect(() => {
    fetchPosts(page);
  }, [page, showMyPosts]);

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
    const text = newComments[postId];
    if (!text?.trim()) return;

    try {
      const response = await communityService.createPostComment(postId, text);
      if (response.success) {
        await fetchComments(postId); // refresh list
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

  const handleToggleLike = async (postId: string) => {
    try {
      let response = await communityService.togglePostLike(postId);
      console.log("this is like response");

      console.log(response);

      setPosts((prevPosts: any) =>
        prevPosts.map((post: any) =>
          post._id === postId
            ? {
                ...post,
                likedByUser: !post.likedByUser,
                likeCount: post.likedByUser
                  ? post.likeCount - 1
                  : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
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

  const renderMedia = (postId: string, media: string[]) => {
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
              mediaUrl.endsWith(".mp4") || mediaUrl.includes("video");

            return (
              <View
                style={{
                  width: screenWidth,
                  height: 300,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isVideo ? (
                  <Video
                    source={{ uri: mediaUrl }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                    }}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                  />
                ) : (
                  <Pressable onPress={() => openModal(mediaUrl, "image")}>
                    <Image
                      source={{ uri: mediaUrl }}
                      resizeMode="contain"
                      style={{
                        width: screenWidth,
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
      </View>

      {item.text && <Text style={styles.text}>{item.text}</Text>}
      {renderMedia(item._id, item.media)}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleToggleLike(item._id)}>
          <Ionicons
            name={item.likedByUser ? "heart" : "heart-outline"}
            size={20}
            color={item.likedByUser ? "red" : "#333"}
          />
        </TouchableOpacity>
        <Text style={styles.iconText}>{item.likeCount ?? 0}</Text>

        <TouchableOpacity
          style={{ marginLeft: 16 }}
          onPress={() => toggleCommentSection(item._id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.iconText}>{item.commentCount ?? 0}</Text>
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
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: 10,
              paddingHorizontal: 16,
            }}
          >
            {/* Community Name with Icon */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="people"
                size={18}
                color="#19002E"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#19002E",
                }}
              >
                {communityName}
              </Text>
            </View>

            {/* Toggle Button */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#e0e0e0",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  backgroundColor: !showMyPosts ? "#19002E" : "transparent",
                }}
                onPress={() => setShowMyPosts(false)}
              >
                <Text
                  style={{
                    color: !showMyPosts ? "#fff" : "#000",
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  All Posts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  backgroundColor: showMyPosts ? "#19002E" : "transparent",
                }}
                onPress={() => setShowMyPosts(true)}
              >
                <Text
                  style={{
                    color: showMyPosts ? "#fff" : "#000",
                    fontWeight: "bold",
                  }}
                >
                  My Posts
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
});
