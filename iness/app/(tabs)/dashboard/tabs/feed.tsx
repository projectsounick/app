import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, TouchableOpacity, Text, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import SmallHeader from "@/app/modules/SmallHeader";
import ImageSelectorModal from "@/app/Modals/CommunitPostModal";
import PostFeed from "@/app/Components/Community/CommunityFeed";
import { communityService } from "@/app/services/community.service";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";
import FeedShimmer from "@/app/modules/Shimmer/FeedShimmer";
import { useGlobalTheme } from "@/app/Theme/ThemeContext";

function YourComponent() {
  const theme = useGlobalTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<any>(null);
  const [communitName, setCommunityName] = useState("");
  const [communities, setCommunities] = useState<any[]>([]);
  const [showCommunitySelector, setShowCommunitySelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const createPostModalRef = useRef<{ openModal: () => void } | null>(null);

  const openCreatePost = () => {
    if (!communityId) {
      Alert.alert("Community unavailable", "You can't create a post right now.");
      return;
    }
    createPostModalRef.current?.openModal();
  };

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await communityService.getUserCommunityById();

        if (res.success && res.communityId) {
          setCommunityId(res.communityId);
          setCommunityName(res.communityName);

          // Store all communities if user has access to multiple
          if (res.communities && res.communities.length > 0) {
            setCommunities(res.communities);
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

  const handleCommunityChange = (community: any) => {
    setCommunityId(community._id);
    setCommunityName(community.name);
    setPosts([]); // Clear posts when switching communities
    setShowCommunitySelector(false);
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

      {/* Community Selector - Show if trainer/admin has multiple communities */}
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
            <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
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
          <ImageSelectorModal
            ref={createPostModalRef}
            setPosts={setPosts}
            communityId={communityId}
          />
        </>
      )}

      {/* Community Selector Modal */}
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
