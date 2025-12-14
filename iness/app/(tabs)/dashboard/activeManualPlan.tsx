import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  WorkoutPlanInterface,
  EachexerciseItem,
} from "@/app/interfaces/activeManualPlan";
import SmallHeader from "@/app/modules/SmallHeader";
import { ResizeMode, Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import BackHeader from "@/app/modules/BackHeader";
import { LinearGradient } from "expo-linear-gradient";
import ImageViewerModal from "@/app/Modals/ImageViewerModal";
import VideoViewerModal from "@/app/Modals/VideoViewerModal";

const dayKeys: (keyof WorkoutPlanInterface)[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

const getTodayKey = (): keyof WorkoutPlanInterface => {
  const day = new Date().getDay();
  return dayKeys[day];
};

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ManualPlanViewer = () => {
  const activeManualPlan = useSelector(
    (state: RootState) => state.plan.activeManualPlan
  );
  const plan: WorkoutPlanInterface | undefined =
    activeManualPlan?.workoutPlanId;

  const [selectedDay, setSelectedDay] =
    useState<keyof WorkoutPlanInterface>(getTodayKey());
  const [expandedImages, setExpandedImages] = useState<number | null>(null);
  const [expandedVideos, setExpandedVideos] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const todayIndex = new Date().getDay();

  useEffect(() => {
    if (plan) setSelectedDay(getTodayKey());
  }, [plan]);

  if (!plan) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: "center" }}>
          No active manual plan found.
        </Text>
      </View>
    );
  }

  const exercises: EachexerciseItem[] = Array.isArray(plan[selectedDay])
    ? (plan[selectedDay] as EachexerciseItem[])
    : [];

  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SmallHeader title="Manual Plan" />
      <BackHeader />

      <View style={{ paddingHorizontal: 16, paddingTop: 2 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#1A1A1A" }}>
          {plan.planName}
        </Text>
        <Text style={{ fontSize: 15, color: "#666", marginTop: 4 }}>
          {plan.description || "No description available."}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
        style={{ maxHeight: 48 }}
      >
        {dayKeys.map((key, index) => {
          const isActive = selectedDay === key;
          const isDisabled = index > todayIndex;

          return (
            <TouchableOpacity
              key={key}
              disabled={isDisabled}
              onPress={() => setSelectedDay(key)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: isActive ? "#19002E" : "#F0F0F0",
                marginRight: 10,
                opacity: isDisabled ? 0.5 : 1,
                height: 36,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  color: isActive ? "#fff" : "#222",
                  fontSize: 14,
                }}
              >
                {key.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {exercises.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#999", marginTop: 30 }}>
            No exercises for this day.
          </Text>
        ) : (
          exercises.map((item, idx) => (
            <LinearGradient
              key={idx}
              colors={["#9C56F6", "#3A1B63"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginHorizontal: 16,
                marginTop: 16,
                padding: 16,
                borderRadius: 14,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
                {item.exercise.name}
              </Text>

              {item.sets.map((set, i) => (
                <Text
                  key={i}
                  style={{ fontSize: 14, color: "#f0f0f0", marginTop: 4 }}
                >
                  • Set {i + 1}: {set.repRange} reps{" "}
                  {set.timer && `| Timer: ${set.timer}`}
                </Text>
              ))}

              {/* Images Toggle */}
              {item.exercise.images.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                      );
                      setExpandedImages(expandedImages === idx ? null : idx);
                    }}
                    style={{
                      marginTop: 14,
                      backgroundColor: "#ffffff50",
                      padding: 10,
                      borderRadius: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Images
                    </Text>
                    <Ionicons
                      name={
                        expandedImages === idx
                          ? "chevron-up"
                          : "chevron-forward"
                      }
                      size={18}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  {expandedImages === idx && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 10 }}
                    >
                      {item.exercise.images.map((img, i) => (
                        <TouchableOpacity
                          key={img}
                          onPress={() => {
                            setModalVisible(true);
                            setSelectedImage(img);
                          }}
                        >
                          <Image
                            source={{ uri: img }}
                            style={{
                              width: 100,
                              height: 80,
                              marginRight: 10,
                              borderRadius: 8,
                              backgroundColor: "#ddd",
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}

              {/* Videos Toggle */}
              {item.exercise.videos.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut
                      );
                      setExpandedVideos(expandedVideos === idx ? null : idx);
                    }}
                    style={{
                      marginTop: 14,
                      backgroundColor: "#ffffff50",
                      padding: 10,
                      borderRadius: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Videos
                    </Text>
                    <Ionicons
                      name={
                        expandedVideos === idx
                          ? "chevron-up"
                          : "chevron-forward"
                      }
                      size={18}
                      color="#fff"
                    />
                  </TouchableOpacity>
                  {expandedVideos === idx && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{ marginTop: 10 }}
                    >
                      {item.exercise.videos.map((vid, i) => (
                        <TouchableOpacity
                          key={vid}
                          style={{
                            width: 160,
                            height: 90,
                            borderRadius: 10,
                            marginRight: 10,
                            overflow: "hidden",
                            backgroundColor: "#000",
                          }}
                          onPress={() => {
                            setSelectedVideoUrl(vid);
                            setVideoModalVisible(true);
                          }}
                        >
                          <Video
                            source={{ uri: vid }}
                            useNativeControls={false}
                            resizeMode={ResizeMode.COVER}
                            style={{ width: "100%", height: "100%" }}
                            shouldPlay={false}
                            isMuted
                          />
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "rgba(0,0,0,0.3)",
                            }}
                          >
                            <Ionicons
                              name="play-circle"
                              size={32}
                              color="#fff"
                            />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              )}
            </LinearGradient>
          ))
        )}
      </ScrollView>
      {modalVisible ? (
        <ImageViewerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          imageUrl={selectedImage}
        />
      ) : null}
      {videoModalVisible ? (
        <VideoViewerModal
          visible={videoModalVisible}
          videoUrl={selectedVideoUrl}
          onClose={() => setVideoModalVisible(false)}
        />
      ) : null}
    </ImageBackground>
  );
};

export default ManualPlanViewer;
