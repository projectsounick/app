import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import SmallHeader from "@/app/modules/SmallHeader";
import CommunityPostModal from "@/app/Modals/CommunitPostModal";
import PostFeed from "@/app/Components/Community/CommunityFeed";
import { communityService } from "@/app/services/community.service";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import FeedShimmer from "@/app/modules/Shimmer/FeedShimmer";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { uploadToAzureFromExpo } from "@/utils/azureUtils";
import { userService } from "@/app/services/user.service";
import CommunityUploadOverlay from "@/app/modules/CommunityUploadOverlay";
import {
  CommunityPostDraft,
  CommunityPostDraftPayload,
  CommunityUploadJob,
} from "@/app/interfaces/communityComposer";

const FEED_COMMUNITY_STORAGE_KEY = "selectedFeedCommunityId";

const EXTENSION_MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  webm: "video/webm",
  "3gp": "video/3gpp",
};

type FeedCommunity = {
  _id: string;
  name: string;
};

const getFileExtension = (value?: string | null) => {
  if (!value) return null;

  const cleanValue = value.split("?")[0]?.split("#")[0] ?? "";
  const match = cleanValue.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : null;
};

const createDraftId = () =>
  `community-upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getQueuedMessage = (draft: CommunityPostDraft) => {
  if (draft.type === "text") {
    return "Post queued";
  }

  return draft.type === "video" ? "Video upload queued" : "Photo upload queued";
};

function YourComponent() {
  const theme = useGlobalTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<any>(null);
  const [communitName, setCommunityName] = useState("");
  const [communities, setCommunities] = useState<FeedCommunity[]>([]);
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<CommunityUploadJob[]>([]);
  const createPostModalRef = useRef<{ openModal: () => void } | null>(null);
  const uploadQueueRef = useRef<CommunityUploadJob[]>([]);
  const activeUploadJobIdRef = useRef<string | null>(null);
  const communityIdRef = useRef<any>(null);
  const completionTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    uploadQueueRef.current = uploadQueue;
  }, [uploadQueue]);

  useEffect(() => {
    communityIdRef.current = communityId;
  }, [communityId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      Object.values(completionTimeoutsRef.current).forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
    };
  }, []);

  const updateUploadJob = useCallback(
    (jobId: string, updater: (job: CommunityUploadJob) => CommunityUploadJob) => {
      setUploadQueue((prevJobs) =>
        prevJobs.map((job) => (job.id === jobId ? updater(job) : job))
      );
    },
    []
  );

  const removeUploadJob = useCallback((jobId: string) => {
    const existingTimeout = completionTimeoutsRef.current[jobId];
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      delete completionTimeoutsRef.current[jobId];
    }

    setUploadQueue((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  }, []);

  const scheduleUploadJobRemoval = useCallback(
    (jobId: string, delayMs: number = 2600) => {
      const existingTimeout = completionTimeoutsRef.current[jobId];
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      completionTimeoutsRef.current[jobId] = setTimeout(() => {
        delete completionTimeoutsRef.current[jobId];
        setUploadQueue((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      }, delayMs);
    },
    []
  );

  const openCreatePost = () => {
    if (!communityId) {
      Alert.alert("Community unavailable", "You can't create a post right now.");
      return;
    }
    createPostModalRef.current?.openModal();
  };

  const enqueueDraftUpload = useCallback((payload: CommunityPostDraftPayload) => {
    const draft: CommunityPostDraft = {
      ...payload,
      id: createDraftId(),
      createdAt: Date.now(),
    };

    setUploadQueue((prevJobs) => [
      ...prevJobs,
      {
        id: draft.id,
        draft,
        status: "queued",
        progress: 0,
        message: getQueuedMessage(draft),
        error: null,
      },
    ]);
  }, []);

  const runUploadJob = useCallback(
    async (jobId: string) => {
      const currentJob = uploadQueueRef.current.find((job) => job.id === jobId);
      if (!currentJob) {
        return;
      }

      const { draft } = currentJob;

      try {
        const userResponse =
          await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");

        if (!userResponse.exists || !userResponse.data?._id) {
          throw new Error("User not found. Please sign in again.");
        }

        const userId = userResponse.data._id;
        let uploadedUrls = currentJob.uploadedUrls || [];

        if (!uploadedUrls.length && draft.media.length > 0) {
          const storageDetails = await userService.getStorageAccountDetails(
            draft.type === "video" ? "community/raw" : "community"
          );

          if (!storageDetails.success) {
            throw new Error(
              storageDetails.message || "Unable to prepare the upload right now."
            );
          }

          const { storageAccountName, sasToken } = storageDetails.data;
          uploadedUrls = [];

          updateUploadJob(jobId, (job) => ({
            ...job,
            status: "uploading",
            progress: 1,
            message:
              draft.type === "video"
                ? "Uploading video to the community..."
                : "Uploading your media...",
            error: null,
          }));

          for (let index = 0; index < draft.media.length; index += 1) {
            const mediaItem = draft.media[index];
            const extension =
              getFileExtension(mediaItem.fileName) ||
              getFileExtension(mediaItem.uri) ||
              (mediaItem.kind === "video" ? "mp4" : "jpg");
            const originalFileName =
              mediaItem.fileName?.split("?")[0] ||
              mediaItem.uri.split("/").pop()?.split("?")[0] ||
              `file-${Date.now()}.${extension}`;
            const safeFileName = originalFileName.replace(/\s+/g, "-");
            const fileName = `${userId}_${Date.now()}_${index}_${safeFileName}`;

            const uploadedUrl = await uploadToAzureFromExpo(
              mediaItem.uri,
              fileName,
              sasToken,
              storageAccountName,
              "admin-data",
              draft.type === "video" ? "community/raw" : "community",
              (fileProgress) => {
                const overallProgress =
                  ((index + fileProgress / 100) / draft.media.length) * 100;

                updateUploadJob(jobId, (job) => ({
                  ...job,
                  status: "uploading",
                  progress: Math.max(1, Math.round(overallProgress)),
                  message:
                    draft.type === "video"
                      ? "Uploading video to the community..."
                      : "Uploading your media...",
                }));
              },
              mediaItem.mimeType ||
                EXTENSION_MIME_MAP[extension] ||
                undefined
            );

            uploadedUrls.push(uploadedUrl);
            updateUploadJob(jobId, (job) => ({
              ...job,
              uploadedUrls: [...uploadedUrls],
            }));
          }
        }

        updateUploadJob(jobId, (job) => ({
          ...job,
          status: "creating",
          progress: 100,
          uploadedUrls,
          message:
            draft.type === "video"
              ? "Publishing post and starting optimization..."
              : "Publishing your post...",
          error: null,
        }));

        const response = await communityService.createPost({
          communityId: draft.communityId,
          type: draft.type,
          media: uploadedUrls,
          text: draft.text,
          isActive: true,
          isApproved: true,
          createdBy: userId,
        });

        if (!response.success) {
          throw new Error(response.message || "Unable to create the post.");
        }

        const createdPost = {
          ...response.data,
          likeCount: response.data?.likeCount || 0,
          likedByUser: response.data?.likedByUser || false,
          commentCount: response.data?.commentCount || 0,
        };

        if (String(communityIdRef.current || "") === draft.communityId) {
          setPosts((prevPosts: any[]) => [
            createdPost,
            ...prevPosts.filter((post) => post._id !== createdPost._id),
          ]);
        }

        updateUploadJob(jobId, (job) => ({
          ...job,
          status: "completed",
          progress: 100,
          message:
            draft.type === "video"
              ? "Video post published"
              : "Post published",
          error: null,
        }));
        scheduleUploadJobRemoval(jobId);
      } catch (error: any) {
        const hasUploadedMedia =
          (uploadQueueRef.current.find((job) => job.id === jobId)?.uploadedUrls
            ?.length || 0) > 0;
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message || "Something went wrong while posting.";

        updateUploadJob(jobId, (job) => ({
          ...job,
          status: "failed",
          message: hasUploadedMedia ? "Post creation failed" : "Upload failed",
          error: errorMessage,
        }));
      }
    },
    [scheduleUploadJobRemoval, updateUploadJob]
  );

  const startNextQueuedUpload = useCallback(() => {
    if (activeUploadJobIdRef.current) {
      return;
    }

    const nextQueuedJob = uploadQueueRef.current.find(
      (job) => job.status === "queued"
    );
    if (!nextQueuedJob) {
      return;
    }

    activeUploadJobIdRef.current = nextQueuedJob.id;
    void runUploadJob(nextQueuedJob.id).finally(() => {
      activeUploadJobIdRef.current = null;
      startNextQueuedUpload();
    });
  }, [runUploadJob]);

  useEffect(() => {
    startNextQueuedUpload();
  }, [startNextQueuedUpload, uploadQueue]);

  const retryUploadJob = useCallback((jobId: string) => {
    updateUploadJob(jobId, (job) => ({
      ...job,
      status: "queued",
      progress: job.uploadedUrls?.length ? 100 : 0,
      message: job.uploadedUrls?.length
        ? "Retrying post creation..."
        : getQueuedMessage(job.draft),
      error: null,
    }));
  }, [updateUploadJob]);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await communityService.getUserCommunityById();

        if (res.success && res.communityId) {
          const availableCommunities: FeedCommunity[] = Array.isArray(
            res.communities
          )
            ? (res.communities as FeedCommunity[])
            : [];
          const savedCommunity =
            await asyncStorageUtils.checkIfKeyExistsInAsyncStorage<string>(
              FEED_COMMUNITY_STORAGE_KEY
            );
          const savedCommunityId = savedCommunity.exists
            ? savedCommunity.data
            : null;
          const selectedCommunity =
            availableCommunities.find(
              (community) => community._id === savedCommunityId
            ) ||
            availableCommunities.find(
              (community) => community._id === res.communityId
            ) ||
            availableCommunities[0] ||
            null;

          if (selectedCommunity) {
            setCommunityId(selectedCommunity._id);
            setCommunityName(selectedCommunity.name);
            await asyncStorageUtils.storeDataInAsyncStorage(
              selectedCommunity._id,
              FEED_COMMUNITY_STORAGE_KEY
            );
          } else {
            setCommunityId(res.communityId);
            setCommunityName(res.communityName);
          }

          if (availableCommunities.length > 0) {
            setCommunities(availableCommunities);
          }
        } else {
          setCommunityId(null);
        }
      } catch (err) {
        console.error("Failed to fetch community:", err);
        setCommunityId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, []);

  const handleCommunityChange = async (community: FeedCommunity) => {
    setCommunityId(community._id);
    setCommunityName(community.name);
    setPosts([]);
    setShowCommunitySelector(false);
    await asyncStorageUtils.storeDataInAsyncStorage(
      community._id,
      FEED_COMMUNITY_STORAGE_KEY
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <SmallHeader
        weightShow={false}
        title={communitName || "Fitness Hub"}
        onCreatePost={openCreatePost}
        showCart={false}
        showBell={false}
      />

      {communities.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: theme.colors.backgroundCard,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Ionicons name="filter" size={20} color={theme.colors.textMuted} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 14,
              color: theme.colors.textMuted,
              fontFamily: theme.fonts.medium,
            }}
          >
            Community:
          </Text>
          <TouchableOpacity
            onPress={() => setShowCommunitySelector(true)}
            style={{
              marginLeft: 8,
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: theme.colors.background,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.text,
                fontFamily: theme.fonts.medium,
              }}
            >
              {communitName}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <FeedShimmer />
      ) : (
        <>
          <PostFeed
            communityId={communityId}
            posts={posts}
            communityName={communitName}
            setPosts={setPosts}
            onCreatePost={openCreatePost}
          />
          <CommunityPostModal
            ref={createPostModalRef}
            communityId={communityId}
            onSubmitDraft={enqueueDraftUpload}
          />
          {uploadQueue.length > 0 ? (
            <CommunityUploadOverlay
              jobs={uploadQueue}
              onRetry={retryUploadJob}
              onDismiss={removeUploadJob}
            />
          ) : null}
        </>
      )}

      <Modal
        visible={showCommunitySelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCommunitySelector(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setShowCommunitySelector(false)}
        >
          <View
            style={{
              backgroundColor: theme.colors.backgroundCard,
              borderRadius: 16,
              width: "85%",
              maxHeight: "70%",
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                Select Community
              </Text>
              <TouchableOpacity onPress={() => setShowCommunitySelector(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {communities.map((community) => (
                <TouchableOpacity
                  key={community._id}
                  onPress={() => handleCommunityChange(community)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    marginBottom: 8,
                    backgroundColor:
                      communityId === community._id
                        ? theme.colors.primary + "20"
                        : theme.colors.background,
                    borderWidth: 2,
                    borderColor:
                      communityId === community._id
                        ? theme.colors.primary
                        : "transparent",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: theme.fonts.medium,
                        color: theme.colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {community.name}
                    </Text>
                  </View>
                  {communityId === community._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default LoginWrapper(YourComponent);
