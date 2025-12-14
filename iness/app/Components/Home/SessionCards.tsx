import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { useDispatch, useSelector } from "react-redux";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";
import { RootState } from "@/store";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SPACING = 12;
const CARD_HEIGHT = height * 0.22; // Responsive card height

interface Trainer {
  _id: string;
  name: string;
  profilePic: string;
}

interface Session {
  _id: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: "online" | "offline";
  trainer: Trainer;
  sessionStatus: "completed" | "missed" | "scheduled";
}
const formatDateTime = (isoString: string) => {
  try {
    const dateObj = new Date(isoString);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const formattedTime = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} • ${formattedTime}`;
  } catch {
    return isoString;
  }
};

const UpcomingSessionsCard = () => {
  const sessionsData = useSelector(
    (state: RootState) => state.session.sessions
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Sort by date (newest first) and take 5
  const latestSessions = [...sessionsData]
    .sort(
      (a, b) =>
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    )
    .slice(0, 5);

  useEffect(() => {
    if (latestSessions.length > 0) {
      const middleIndex = Math.floor(latestSessions.length / 2);
      const initialScrollX = middleIndex * (CARD_WIDTH + SPACING);
      scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
    }
  }, [latestSessions]);

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color="#9747FF"
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: theme.fonts.bold,
              color: "#000",
              fontWeight: "700",
            }}
          >
            Upcoming Sessions
          </Text>
        </View>

        {latestSessions.length > 0 && (
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => dispatch(setCalendarSheetOpen(true))}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: theme.fonts.medium,
                color: "#666",
                marginRight: 4,
                fontWeight: "600",
              }}
            >
              See All
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel or Empty State */}
      {latestSessions.length === 0 ? (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 40,
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#F5F5F5",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={26}
              color="#9747FF"
            />
          </View>
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.fonts.bold,
              color: "#666",
              textAlign: "center",
              marginBottom: 16,
              fontWeight: "600",
            }}
          >
            You do not have any sessions with us right now
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard/tabs/train")}
            style={{
              backgroundColor: "#67C694",
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 16,
              shadowColor: "#67C694",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: theme.fonts.bold,
                fontWeight: "700",
              }}
            >
              Get Now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ height: CARD_HEIGHT }}>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: (width - CARD_WIDTH) / 2,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {latestSessions.map((session, index) => {
              const inputRange = [
                (index - 1) * (CARD_WIDTH + SPACING),
                index * (CARD_WIDTH + SPACING),
                (index + 1) * (CARD_WIDTH + SPACING),
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.85, 1, 0.85],
                extrapolate: "clamp",
              });

              const translateY = scrollX.interpolate({
                inputRange,
                outputRange: [20, 0, 20],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={session._id}
                  style={{
                    width: CARD_WIDTH,
                    marginRight: SPACING,
                    transform: [{ scale }, { translateY }],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => dispatch(setCalendarSheetOpen(true))}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 20,
                      padding: width * 0.04, // Responsive padding (4% of screen width)
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                      position: "relative",
                      height: CARD_HEIGHT - 20, // Ensure card fits in container
                    }}
                  >
                    {/* Session Status Badge */}
                    <View
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        backgroundColor:
                          session.sessionStatus === "completed"
                            ? "#E8F5E9"
                            : session.sessionStatus === "missed"
                              ? "#FFEBEE"
                              : "#FFF3E0",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            session.sessionStatus === "completed"
                              ? "#4CAF50"
                              : session.sessionStatus === "missed"
                                ? "#F44336"
                                : "#FF9800",
                          fontSize: 9,
                          fontFamily: theme.fonts.bold,
                          textTransform: "uppercase",
                          fontWeight: "700",
                        }}
                      >
                        {session.sessionStatus}
                      </Text>
                    </View>

                    {/* Content Section */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      {/* Trainer Image */}
                      <View
                        style={{
                          width: width * 0.18, // Responsive image size (18% of screen width)
                          height: width * 0.18,
                          borderRadius: (width * 0.18) / 2,
                          marginRight: width * 0.03, // Responsive margin
                          overflow: "hidden",
                          backgroundColor: "#F8F8F8",
                        }}
                      >
                        <Image
                          source={
                            session.trainer?.profilePic
                              ? { uri: session.trainer.profilePic }
                              : require("../../../assets/images/track.png")
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
                          }}
                        />
                      </View>

                      {/* Info Section */}
                      <View style={{ flex: 1, paddingRight: width * 0.18 }}>
                        <Text
                          style={{
                            fontSize: width * 0.04, // Responsive font size (4% of screen width)
                            fontFamily: theme.fonts.bold,
                            color: "#000",
                            marginBottom: 4,
                            fontWeight: "700",
                          }}
                          numberOfLines={2}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.8}
                        >
                          {session.trainer.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 3,
                          }}
                        >
                          <Ionicons
                            name={
                              session.sessionType === "online"
                                ? "videocam-outline"
                                : "location-outline"
                            }
                            size={width * 0.03}
                            color="#666"
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={{
                              fontSize: width * 0.03,
                              color: "#666",
                              fontWeight: "500",
                              textTransform: "uppercase",
                            }}
                          >
                            {session.sessionType}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 6,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={width * 0.03}
                            color="#666"
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={{
                              fontSize: width * 0.03,
                              color: "#666",
                              fontWeight: "500",
                            }}
                            numberOfLines={1}
                          >
                            {formatDateTime(session.sessionDate)}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={{
                            backgroundColor: "#67C694",
                            paddingVertical: 5,
                            paddingHorizontal: width * 0.04,
                            borderRadius: 10,
                            alignSelf: "flex-start",
                            shadowColor: "#67C694",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                          onPress={() => dispatch(setCalendarSheetOpen(true))}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontFamily: theme.fonts.bold,
                              fontSize: width * 0.033,
                              fontWeight: "700",
                            }}
                          >
                            View
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
        </View>
      )}
    </View>
  );
};

export default UpcomingSessionsCard;
