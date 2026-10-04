import { safeRouter } from "@/src/utils/safeRouter";
import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { setCalendarSheetOpen, setCalendarInitialDate } from "@/Slices/componentOpenSlice";
import { RootState } from "@/store";
import CachedRemoteImage from "./CachedRemoteImage";
import { useDashboardActivity } from "./DashboardActivityContext";

const SPACING = 12;

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
  const theme = useGlobalTheme();
  const { reduceMotion } = useDashboardActivity();
  const sessionsData = useSelector(
    (state: RootState) => state.session.sessions
  );
  const dispatch = useDispatch();
  const { width, height: screenHeight } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width * 0.75, 220), 520);
  const cardHeight = Math.min(
    Math.max(screenHeight < 700 ? screenHeight * 0.2 : screenHeight * 0.19, 165),
    210
  );
  const sizeScale = Math.min(Math.max(width / 375, 0.8), 1.1);
  const responsiveFontSize = (size: number) => size * Math.min(sizeScale, 1.15);
  const responsiveWidth = (size: number) => size * sizeScale;
  const responsiveSpacing = (size: number) => size * sizeScale;
  const [layoutReady, setLayoutReady] = useState(false);
  const [scrollX] = useState(() => new Animated.Value(0));
  const scrollRef = useRef<ScrollView>(null);

  // Sort by date (newest first) and take 5
  const latestSessions = useMemo(
    () =>
      [...sessionsData]
        .sort(
          (a, b) =>
            new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
        )
        .slice(0, 5),
    [sessionsData]
  );

  // Scroll to middle card after layout is ready (especially important for Android)
  useEffect(() => {
    if (layoutReady && latestSessions.length > 0 && scrollRef.current) {
      const middleIndex = Math.floor(latestSessions.length / 2);
      const initialScrollX = middleIndex * (cardWidth + SPACING);
      
      // Initialize scrollX value immediately so cards render with correct scale
      scrollX.setValue(initialScrollX);
      
      // Use requestAnimationFrame for Android to ensure layout is complete
      if (Platform.OS === 'android') {
        // Double RAF for Android to ensure layout is fully complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
            }, 100);
          });
        });
      } else {
        // For iOS, a single RAF is usually enough
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
        });
      }
    }
  }, [cardWidth, layoutReady, latestSessions.length, scrollX]);
  const mainCardPadding = screenHeight < 700 ? 12 : screenHeight < 900 ? 14 : 16;

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingVertical: mainCardPadding,
        paddingHorizontal: 16,
        marginBottom: 16,
        shadowColor: theme.colors.dark,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={screenHeight < 700 ? 18 : screenHeight < 900 ? 19 : 20}
              color={theme.colors.secondPrimary}
            />
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontFamily: theme.fonts.bold,
              color: theme.colors.text,
              fontWeight: theme.fontWeights.bold as "700",
            }}
          >
            Upcoming Sessions
          </Text>
        </View>

        {latestSessions.length > 0 && (
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => {
              dispatch(setCalendarInitialDate(null));
              dispatch(setCalendarSheetOpen(true));
            }}
            accessibilityRole="button"
            accessibilityLabel="See all upcoming sessions"
          >
            <Text
              style={{
                fontSize: theme.fontSizes.regularSmall,
                fontFamily: theme.fonts.medium,
                color: theme.colors.textSecondary,
                marginRight: 4,
                fontWeight: theme.fontWeights.medium as "500",
              }}
            >
              See All
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={screenHeight < 700 ? 14 : 16} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel or Empty State */}
      {latestSessions.length === 0 ? (
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: 20,
            padding: 40,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              backgroundColor: theme.colors.backgroundCardLight,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={26}
              color={theme.colors.secondPrimary}
            />
          </View>
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontFamily: theme.fonts.bold,
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
              fontWeight: theme.fontWeights.medium as "500",
            }}
          >
            You do not have any sessions with us right now
          </Text>

          <TouchableOpacity
            onPress={() => safeRouter.navigate("/(tabs)/dashboard/tabs/train")}
            style={{
              backgroundColor: theme.colors.success,
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 16,
              shadowColor: theme.colors.success,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            }}
            accessibilityRole="button"
            accessibilityLabel="Find a training session"
          >
            
            <Text
              style={{
                color: theme.colors.textWhite,
                fontSize: theme.fontSizes.regularSmall,
                fontFamily: theme.fonts.bold,
                fontWeight: theme.fontWeights.bold as "700",
              }}
            >
              Get Now
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View 
          style={{ height: cardHeight }}
          onLayout={() => {
            if (!layoutReady) {
              setLayoutReady(true);
            }
          }}
        >
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + SPACING}
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: Math.max((width - cardWidth) / 2 - 16, 0),
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          >
            {latestSessions.map((session, index) => {
              const inputRange = [
                (index - 1) * (cardWidth + SPACING),
                index * (cardWidth + SPACING),
                (index + 1) * (cardWidth + SPACING),
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: reduceMotion ? [1, 1, 1] : [0.85, 1, 0.85],
                extrapolate: "clamp",
              });

              const translateY = scrollX.interpolate({
                inputRange,
                outputRange: reduceMotion ? [0, 0, 0] : [20, 0, 20],
                extrapolate: "clamp",
              });

              const openCalendarWithSessionDate = () => {
                try {
                  const dateStr = new Date(session.sessionDate).toLocaleDateString("en-CA", {
                    timeZone: "Asia/Kolkata",
                  });
                  dispatch(setCalendarInitialDate(dateStr));
                  dispatch(setCalendarSheetOpen(true));
                } catch {
                  dispatch(setCalendarSheetOpen(true));
                }
              };

              return (
                <Animated.View
                  key={session._id}
                  style={{
                    width: cardWidth,
                    marginRight: SPACING,
                    transform: [{ scale }, { translateY }],
                  }}
                >
                  <View
                    style={{
                      backgroundColor: session.sessionStatus === "completed" ? theme.colors.backgroundSecondary : theme.colors.backgroundCard,
                      borderRadius: responsiveSpacing(20),
                      paddingVertical: responsiveSpacing(12),
                      paddingHorizontal: responsiveSpacing(16),
                      shadowColor: theme.colors.black,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: session.sessionStatus === "completed" ? theme.colors.border : theme.colors.border,
                      position: "relative",
                      height: cardHeight - responsiveSpacing(16),
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Session Status Badge */}
                    <View
                      style={{
                        position: "absolute",
                        top: responsiveSpacing(10),
                        right: responsiveSpacing(10),
                        backgroundColor:
                          session.sessionStatus === "completed"
                            ? "#E0E0E0"
                            : session.sessionStatus === "missed"
                              ? "#FFEBEE"
                              : "#FFF3E0",
                        paddingHorizontal: responsiveSpacing(8),
                        paddingVertical: responsiveSpacing(3),
                        borderRadius: responsiveSpacing(10),
                        zIndex: 1,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            session.sessionStatus === "completed"
                              ? theme.colors.text
                              : session.sessionStatus === "missed"
                                ? theme.colors.error
                                : theme.colors.warning,
                          fontSize: responsiveFontSize(9),
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
                          width: responsiveWidth(50),
                          height: responsiveWidth(50),
                          borderRadius: responsiveWidth(25),
                          marginRight: responsiveSpacing(12),
                          overflow: "hidden",
                          backgroundColor: theme.colors.backgroundSecondary,
                        }}
                      >
                        {session.trainer?.profilePic ? (
                          <CachedRemoteImage
                            uri={session.trainer.profilePic}
                            style={{ width: "100%", height: "100%" }}
                            accessibilityLabel={`${session.trainer.name} profile photo`}
                          />
                        ) : (
                          <Image
                            source={require("../../../assets/images/track.png")}
                            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                            accessibilityLabel="Trainer placeholder"
                          />
                        )}
                      </View>

                      {/* Info Section */}
                      <View 
                        style={{ 
                          flex: 1, 
                          justifyContent: "space-between",
                          minHeight: responsiveWidth(50),
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              fontSize: theme.fontSizes.regularSmall,
                              fontFamily: theme.fonts.bold,
                              color: theme.colors.text,
                              marginBottom: responsiveSpacing(6),
                              fontWeight: "700",
                              lineHeight: responsiveFontSize(18),
                            }}
                            numberOfLines={2}
                          >
                            {session.trainer.name}
                          </Text>
                          
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: responsiveSpacing(4),
                            }}
                          >
                            <Ionicons
                              name={
                                session.sessionType === "online"
                                  ? "videocam-outline"
                                  : "location-outline"
                              }
                              size={responsiveFontSize(13)}
                              color={theme.colors.textSecondary}
                              style={{ marginRight: responsiveSpacing(6) }}
                            />
                            <Text
                              style={{
                                fontSize: theme.fontSizes.small,
                                color: theme.colors.textSecondary,
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
                              size={responsiveFontSize(13)}
                              color={theme.colors.textSecondary}
                              style={{ marginRight: responsiveSpacing(6) }}
                            />
                            <Text
                              style={{
                                fontSize: theme.fontSizes.small,
                                color: theme.colors.textSecondary,
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
                        backgroundColor: theme.colors.success,
                        paddingVertical: responsiveSpacing(7),
                        paddingHorizontal: responsiveSpacing(16),
                        borderRadius: responsiveSpacing(10),
                        alignSelf: "flex-start",
                        marginTop: responsiveSpacing(6),
                        shadowColor: theme.colors.success,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                        minWidth: responsiveWidth(60),
                      }}
                      onPress={openCalendarWithSessionDate}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${session.trainer.name} session on ${formatDateTime(session.sessionDate)}`}
                    >
                      <Text
                        style={{
                          color: theme.colors.textWhite,
                          fontFamily: theme.fonts.bold,
                          fontSize: theme.fontSizes.small,
                          fontWeight: "700",
                        }}
                      >
                        View
                      </Text>
                    </TouchableOpacity>
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
