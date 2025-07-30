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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { communityService } from "@/app/services/community.service";
import { useFocusEffect } from "expo-router";
import theme from "@/app/Theme/globalTheme";

const screenWidth = Dimensions.get("window").width;

const CommunityPosts = ({
  communityId,
  posts,
  setPosts,
}: {
  communityId: string;
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

  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [activeMediaIndex, setActiveMediaIndex] = useState<
    Record<string, number>
  >({});

  const fetchPosts = useCallback(
    async (pageToFetch: number = 1) => {
      setIsLoading(true);
      try {
        const response = await communityService.getCommunityPosts(
          communityId,
          pageToFetch,
          20
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
    [communityId, setPosts]
  );

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

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
      <View style={styles.mediaWrapper}>
        <FlatList
          data={media}
          keyExtractor={(uri, idx) => `${uri}-${idx}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item: mediaUrl }) => {
            const isVideo =
              mediaUrl.endsWith(".mp4") || mediaUrl.includes("video");
            return (
              <View style={styles.mediaItem}>
                {isVideo ? (
                  <Video
                    source={{ uri: mediaUrl }}
                    style={styles.media}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                  />
                ) : (
                  <Image source={{ uri: mediaUrl }} style={styles.media} />
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
      <View style={styles.header}>
        {item.createdBy?.profilePic ? (
          <Image
            source={{ uri: item.createdBy.profilePic }}
            style={styles.avatar}
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
});
