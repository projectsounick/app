import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SmallHeader from "@/app/modules/SmallHeader";
import ImageSelectorModal from "@/app/Modals/CommunitPostModal";
import PostFeed from "@/app/Components/Community/CommunityFeed";
import { communityService } from "@/app/services/community.service";
import { LoginWrapper } from "@/app/Hoc/LoginWrapper";

function YourComponent() {
  const [posts, setPosts] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<any>(null);
  const [communitName, setCommunityName] = useState("");
  const [loading, setLoading] = useState(true);
  const createPostModalRef = useRef<{ openModal: () => void } | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await communityService.getUserCommunityById();

        if (res.success && res.communityId) {
          setCommunityId(res.communityId);
          setCommunityName(res.communityName);
        } else {
          setCommunityId(null); // No community found
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

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      edges={["left", "right"]}
    >
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <>
          <SmallHeader
            weightShow={false}
            title={communitName || "Fitness Hub"}
            onCreatePost={() => createPostModalRef.current?.openModal()}
            showCart={false}
            showBell={false}
          />
          <PostFeed
            communityId={communityId}
            posts={posts}
            communityName={communitName}
            setPosts={setPosts}
            onCreatePost={() => createPostModalRef.current?.openModal()}
          />
          <ImageSelectorModal 
            ref={createPostModalRef}
            setPosts={setPosts} 
            communityId={communityId} 
          />
        </>
      )}
    </SafeAreaView>
  );
}

export default LoginWrapper(YourComponent);
