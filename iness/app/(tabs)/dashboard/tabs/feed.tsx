import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SmallHeader from "@/app/modules/SmallHeader";
import ImageSelectorModal from "@/app/modules/CommunitPostModal";
import PostFeed from "@/app/Components/Community/CommunityFeed";
import { communityService } from "@/app/services/community.service";

const YourComponent = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [communityId, setCommunityId] = useState<any>(null);
  const [communitName, setCommunityName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await communityService.getUserCommunityById();
        console.log("this is res");

        console.log(res);

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
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right", "top"]}
    >
      <SmallHeader title="Community" />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      ) : (
        <>
          <PostFeed
            communityId={communityId}
            posts={posts}
            communityName={communitName}
            setPosts={setPosts}
          />
          <ImageSelectorModal setPosts={setPosts} communityId={communityId} />
        </>
      )}
    </SafeAreaView>
  );
};

export default YourComponent;
