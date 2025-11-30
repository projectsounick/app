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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;
const SPACING = 12;

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
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
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
          <MaterialCommunityIcons
            name="calendar-clock"
            size={22}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontFamily: theme.fonts.bold,
              color: theme.colors.dark,
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
                color: "#000",
                marginRight: 4,
              }}
            >
              See All
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel or Empty State */}
      {latestSessions.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 40,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: theme.fonts.bold,
              color: "#333",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            You do not have any sessions with us right now
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/dashboard/plan")} // replace with your booking screen
            style={{
              backgroundColor: "#67C694",
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontFamily: theme.fonts.bold,
              }}
            >
              Get Now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ height: 140 }}>
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
                  <View
                    style={{
                      flexDirection: "row",
                      backgroundColor: "#736AD6",
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: "#736AD6",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 3,
                      justifyContent: "flex-start",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {/* Session Status Tag */}
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 16,
                        backgroundColor:
                          session.sessionStatus === "completed"
                            ? "#4CAF50"
                            : session.sessionStatus === "missed"
                              ? "#F44336"
                              : "#FFC107",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderBottomLeftRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontFamily: theme.fonts.bold,
                          textTransform: "uppercase",
                        }}
                      >
                        {session.sessionStatus}
                      </Text>
                    </View>

                    {/* Left Info Section */}
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "space-between",
                        width: "60%",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: theme.fonts.bold,
                          color: "#fff",
                          marginBottom: 4,
                        }}
                      >
                        {session.trainer.name}
                      </Text>
                      <Text
                        style={{ fontSize: 14, color: "#fff", marginBottom: 2 }}
                      >
                        {session.sessionType.toUpperCase()}
                      </Text>
                      <Text
                        style={{ fontSize: 14, color: "#fff", marginBottom: 8 }}
                      >
                        {formatDateTime(session.sessionDate)}
                      </Text>

                      <TouchableOpacity
                        style={{
                          backgroundColor: "#67C694",
                          paddingVertical: 6,
                          paddingHorizontal: 20,
                          borderRadius: 16,
                          alignSelf: "flex-start",
                        }}
                        onPress={() => dispatch(setCalendarSheetOpen(true))}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontFamily: theme.fonts.bold,
                            fontSize: 14,
                          }}
                        >
                          View More
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Trainer Image */}
                    <View
                      style={{
                        justifyContent: "flex-end",
                        alignItems: "center",
                        width: "40%",
                        height: "100%",
                      }}
                    >
                      <Image
                        source={
                          session.trainer?.profilePic
                            ? { uri: session.trainer.profilePic }
                            : require("../../../assets/images/track.png")
                        }
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          resizeMode: "cover",
                        }}
                      />
                    </View>
                  </View>
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
