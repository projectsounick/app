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
import { useDispatch } from "react-redux";
import { setCalendarSheetOpen } from "@/Slices/componentOpenSlice";

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
}

const demoSessions: Session[] = [
  {
    _id: "1",
    sessionDate: "2025-09-17",
    sessionTime: "10:00 AM",
    sessionType: "online",
    trainer: {
      _id: "t1",
      name: "John Doe",
      profilePic:
        "https://images.unsplash.com/photo-1603415526960-f8f0d1c16c49?crop=faces&fit=crop&w=200&h=200",
    },
  },
  {
    _id: "2",
    sessionDate: "2025-09-18",
    sessionTime: "2:00 PM",
    sessionType: "offline",
    trainer: {
      _id: "t2",
      name: "Jane Smith",
      profilePic:
        "https://images.unsplash.com/photo-1603415526960-f8f0d1c16c49?crop=faces&fit=crop&w=200&h=200",
    },
  },
  {
    _id: "3",
    sessionDate: "2025-09-19",
    sessionTime: "6:00 PM",
    sessionType: "online",
    trainer: {
      _id: "t3",
      name: "Mike Johnson",
      profilePic:
        "https://images.unsplash.com/photo-1603415526960-f8f0d1c16c49?crop=faces&fit=crop&w=200&h=200",
    },
  },
];
///// Main functional component for the Upcoming session card --------------------------------/
const UpcomingSessionsCard = () => {
  const dispatch = useDispatch();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const middleIndex = Math.floor(demoSessions.length / 2);
    const initialScrollX = middleIndex * (CARD_WIDTH + SPACING);
    scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
  }, []);

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
      </View>

      {/* Carousel */}
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
          {demoSessions.map((session, index) => {
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
                  }}
                >
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
                      {session.sessionDate} | {session.sessionTime}
                    </Text>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#67C694",
                        paddingVertical: 6,
                        paddingHorizontal: 20,
                        borderRadius: 16,
                        alignSelf: "flex-start",
                      }}
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
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "40%",
                      height: "100%",
                      borderRadius: 12,
                    }}
                  >
                    {/* Right Image Section */}
                    <Image
                      source={require("../../../assets/images/track.png")}
                      style={{
                        height: "100%",

                        width: "100%",
                      }}
                    />
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </View>
    </View>
  );
};

export default UpcomingSessionsCard;
