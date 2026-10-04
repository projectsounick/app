import { safeRouter } from "@/src/utils/safeRouter";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { fetchJsonWithTimeout } from "@/utils/fetchJsonWithTimeout";
import { apiCache, CacheTTL } from "@/utils/apiCache";
import CachedRemoteImage from "./CachedRemoteImage";
import { useDashboardActivity } from "./DashboardActivityContext";

interface Testimonial {
  imageUrl: string;
  reviewerName: string;
  review: string;
  rating: number;
}

const TestimonialsCarousel = () => {
  const theme = useGlobalTheme();
  const { width } = useWindowDimensions();
  const { reduceMotion } = useDashboardActivity();
  const cardWidth = Math.min(Math.max(width * 0.68, 200), Math.max(width - 52, 200), 420);
  const imageHeight = Math.min(Math.max(cardWidth * 0.62, 140), 220);
  const cardHeight = imageHeight + 105;
  const styles = useMemo(
    () => getStyles(theme, cardWidth, cardHeight, imageHeight),
    [cardHeight, cardWidth, imageHeight, theme]
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatedValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    const fetchTestimonials = async () => {
      try {
        const data = await apiCache.get(
          "dashboard:testimonials",
          () =>
            fetchJsonWithTimeout<Testimonial[]>(
              "https://inessstorage.blob.core.windows.net/admin-data/Jsons/testimonial"
            ),
          {
            ttl: CacheTTL.THIRTY_MINUTES,
            staleWhileRevalidate: true,
            key: "dashboard-testimonials",
          }
        );
        const limitedData = Array.isArray(data)
          ? data.filter((t) => t && t.reviewerName && t.imageUrl).slice(0, 3)
          : [];
        if (active) setTestimonials(limitedData);
      } catch (error) {
        if (__DEV__) console.error("Error fetching testimonials:", error);
        if (active) setTestimonials([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTestimonials();
    return () => {
      active = false;
    };
  }, []);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        // Only capture horizontal swipes, allow vertical scrolling
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderTerminationRequest: () => false, // Don't allow parent to take over
      onPanResponderRelease: (_, { dx, vx }) => {
        if (testimonials.length === 0) return;
        if (Math.abs(dx) > 50 || Math.abs(vx) > 0.5) {
          const direction = dx < 0 ? 1 : -1;
          // Rotate carousel
          Animated.timing(animatedValue, {
            toValue: direction,
            duration: reduceMotion ? 0 : 300,
            useNativeDriver: true,
          }).start(() => {
            setCurrentIndex((prev) => {
              const len = testimonials.length;
              if (len === 0) return 0;
              if (direction > 0) {
                return (prev + 1) % len;
              } else {
                return (prev - 1 + len) % len;
              }
            });
            animatedValue.setValue(0);
          });
        }
      },
    }),
    [animatedValue, reduceMotion, testimonials.length]
  );

  const mainCardPadding = 10; // Fixed reduced padding

  if (loading) {
    return (
      <View style={[styles.container, { paddingVertical: mainCardPadding }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </View>
    );
  }

  if (loading || testimonials.length === 0) {
    return null;
  }

  // Get card indices for circular arrangement
  const getIndex = (offset: number) => {
    if (testimonials.length === 0) return 0;
    return (currentIndex + offset + testimonials.length) % testimonials.length;
  };

  // Get testimonial safely
  const getTestimonial = (offset: number): Testimonial | null => {
    if (testimonials.length === 0) return null;
    const index = getIndex(offset);
    return testimonials[index] || null;
  };

  // Get card style based on position
  const getCardStyle = (position: number) => {
    // Position: -1 = left, 0 = center, 1 = right
    const baseOffset = cardWidth * 0.55;
    
    const translateX = animatedValue.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        position === -1 ? -baseOffset * 2 : position === 0 ? -baseOffset : 0,
        position * baseOffset,
        position === -1 ? 0 : position === 0 ? baseOffset : baseOffset * 2,
      ],
    });

    const scale = animatedValue.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        position === -1 ? 0.7 : position === 0 ? 0.8 : 1,
        position === 0 ? 1 : 0.8,
        position === -1 ? 1 : position === 0 ? 0.8 : 0.7,
      ],
    });

    const rotateY = animatedValue.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        position === -1 ? "50deg" : position === 0 ? "30deg" : "0deg",
        position === -1 ? "30deg" : position === 0 ? "0deg" : "-30deg",
        position === -1 ? "0deg" : position === 0 ? "-30deg" : "-50deg",
      ],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        position === -1 ? 0.5 : position === 0 ? 0.7 : 1,
        position === 0 ? 1 : 0.7,
        position === -1 ? 1 : position === 0 ? 0.7 : 0.5,
      ],
    });

    return {
      transform: [
        { perspective: 800 },
        { translateX },
        { scale },
        { rotateY },
      ],
      opacity,
    };
  };

  const renderCard = (position: number, zIndex: number) => {
    const testimonial = getTestimonial(position);
    if (!testimonial) return null;

    const cardStyle = getCardStyle(position);

    return (
      <Animated.View
        key={`card-${position}-${getIndex(position)}`}
        style={[
          styles.cardWrapper,
          cardStyle,
          { zIndex },
        ]}
      >
        <View style={styles.card}>
          {/* Image - Starts from top */}
          <View style={styles.imageContainer}>
            <CachedRemoteImage
              uri={testimonial.imageUrl}
              style={styles.image}
              contentFit="contain"
              accessibilityLabel={`${testimonial.reviewerName} testimonial`}
              recyclingKey={testimonial.imageUrl}
            />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.reviewerName} numberOfLines={1}>
              {testimonial.reviewerName}
            </Text>

            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < testimonial.rating ? "star" : "star-outline"}
                  size={12}
                  color="#FFB800"
                  style={{ marginRight: 2 }}
                />
              ))}
              {testimonial.rating > 0 && (
                <Text style={styles.ratingText}>
                  {testimonial.rating.toFixed(1)}
                </Text>
              )}
            </View>

            <View style={styles.reviewContainer}>
              <Text style={styles.reviewText} numberOfLines={2} ellipsizeMode="tail">
                {testimonial.review}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.mainContainer, { paddingVertical: mainCardPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="account-star" size={20} color="#9747FF" />
          </View>
          <Text style={styles.title}>Testimonials</Text>
        </View>

        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => safeRouter.navigate("/(tabs)/dashboard/testimonials")}
          accessibilityRole="button"
          accessibilityLabel="See all testimonials"
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 3D Circular Carousel */}
      <View {...panResponder.panHandlers} style={styles.carouselContainer}>
        {/* Left card (behind) */}
        {testimonials.length > 2 && renderCard(-1, 1)}
        
        {/* Right card (behind) */}
        {testimonials.length > 1 && renderCard(1, 1)}
        
        {/* Center card (front) - rendered last to be on top */}
        {renderCard(0, 10)}
      </View>

      {/* Dots - Removed */}
    </View>
  );
};

const getStyles = (
  theme: any,
  cardWidth: number,
  cardHeight: number,
  imageHeight: number
) => {
  return StyleSheet.create({
  mainContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 16,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold as "700",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginRight: 4,
    fontWeight: theme.fontWeights.medium as "500",
  },
  carouselContainer: {
    height: cardHeight,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    marginBottom: 4,
  },
  cardWrapper: {
    position: "absolute",
    width: cardWidth,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 0, // Remove padding so image can start from top
    overflow: "hidden", // Ensure image respects border radius
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  imageContainer: {
    width: "100%",
    height: imageHeight,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 12,
    paddingTop: 10,
  },
  reviewerName: {
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    fontWeight: "700",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ratingText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: "600",
  },
  reviewContainer: {
    maxHeight: 32, // Constrain review text height to prevent overflow
    overflow: "hidden",
  },
  reviewText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 16,
  },
  });
};

export default TestimonialsCarousel;
