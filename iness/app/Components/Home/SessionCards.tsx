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
// Responsive card height based on screen size - slightly increased for better spacing
const CARD_HEIGHT = height < 700 ? height * 0.17 : height < 900 ? height * 0.19 : height * 0.21;

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

  const { height: screenHeight } = Dimensions.get("window");
  const mainCardPadding = screenHeight < 700 ? 12 : screenHeight < 900 ? 14 : 16;

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: mainCardPadding,
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
          marginBottom: screenHeight < 700 ? 12 : screenHeight < 900 ? 14 : 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: screenHeight < 700 ? 30 : screenHeight < 900 ? 32 : 34,
              height: screenHeight < 700 ? 30 : screenHeight < 900 ? 32 : 34,
              borderRadius: 10,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={screenHeight < 700 ? 18 : screenHeight < 900 ? 19 : 20}
              color="#9747FF"
            />
          </View>
          <Text
            style={{
              fontSize: screenHeight < 700 ? 16 : screenHeight < 900 ? 17 : 18,
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
                fontSize: screenHeight < 700 ? 13 : 14,
                fontFamily: theme.fonts.medium,
                color: "#666",
                marginRight: 4,
                fontWeight: "600",
              }}
            >
              See All
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={screenHeight < 700 ? 14 : 16} 
              color="#666" 
            />
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
        <View style={{ height: CARD_HEIGHT - (height < 700 ? 16 : height < 900 ? 18 : 20) + 20 }}>
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
                      backgroundColor: session.sessionStatus === "completed" ? "#F5F5F5" : "#FFFFFF",
                      borderRadius: 20,
                      paddingVertical: height < 700 ? 12 : height < 900 ? 14 : 16,
                      paddingHorizontal: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: session.sessionStatus === "completed" ? "#E0E0E0" : "#F5F5F5",
                      position: "relative",
                      height: CARD_HEIGHT - (height < 700 ? 16 : height < 900 ? 18 : 20),
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Session Status Badge */}
                    <View
                      style={{
                        position: "absolute",
                        top: height < 700 ? 10 : 14,
                        right: height < 700 ? 10 : 14,
                        backgroundColor:
                          session.sessionStatus === "completed"
                            ? "#E0E0E0"
                            : session.sessionStatus === "missed"
                              ? "#FFEBEE"
                              : "#FFF3E0",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        zIndex: 1,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            session.sessionStatus === "completed"
                              ? "#000000"
                              : session.sessionStatus === "missed"
                                ? "#F44336"
                                : "#FF9800",
                          fontSize: 10,
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
                        alignItems: "flex-start",
                        flex: 1,
                        paddingTop: 2,
                      }}
                    >
                      {/* Trainer Image */}
                      <View
                        style={{
                          width: height < 700 ? 50 : height < 900 ? 55 : 60,
                          height: height < 700 ? 50 : height < 900 ? 55 : 60,
                          borderRadius: height < 700 ? 25 : height < 900 ? 27.5 : 30,
                          marginRight: 12,
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
                      <View 
                        style={{ 
                          flex: 1, 
                          justifyContent: "space-between",
                          minHeight: height < 700 ? 50 : height < 900 ? 55 : 60,
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: height < 700 ? 14 : height < 900 ? 15 : 16,
                              fontFamily: theme.fonts.bold,
                              color: session.sessionStatus === "completed" ? "#000000" : "#000",
                              marginBottom: height < 700 ? 6 : height < 900 ? 8 : 10,
                              fontWeight: "700",
                              lineHeight: height < 700 ? 18 : 20,
                            }}
                            numberOfLines={2}
                          >
                            {session.trainer.name}
                          </Text>
                          
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: height < 700 ? 4 : 6,
                            }}
                          >
                            <Ionicons
                              name={
                                session.sessionType === "online"
                                  ? "videocam-outline"
                                  : "location-outline"
                              }
                              size={14}
                              color={session.sessionStatus === "completed" ? "#333" : "#666"}
                              style={{ marginRight: 6 }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: session.sessionStatus === "completed" ? "#000000" : "#666",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              {session.sessionType}
                            </Text>
                          </View>
                          
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={session.sessionStatus === "completed" ? "#333" : "#666"}
                              style={{ marginRight: 6 }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: session.sessionStatus === "completed" ? "#000000" : "#666",
                                fontWeight: "500",
                              }}
                              numberOfLines={1}
                            >
                              {formatDateTime(session.sessionDate)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* View Button - Fixed at bottom */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#67C694",
                        paddingVertical: height < 700 ? 8 : height < 900 ? 9 : 10,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        alignSelf: "flex-start",
                        marginTop: height < 700 ? 6 : height < 900 ? 8 : 10,
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
                          fontSize: height < 700 ? 13 : 14,
                          fontWeight: "700",
                        }}
                      >
                        View
                      </Text>
                    </TouchableOpacity>
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
