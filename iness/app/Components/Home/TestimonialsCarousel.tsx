import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.6;
const CARD_HEIGHT = height < 700 ? height * 0.19 : height < 900 ? height * 0.21 : height * 0.23;

interface Testimonial {
  imageUrl: string;
  reviewerName: string;
  review: string;
  rating: number;
}

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const testimonialsRef = useRef<Testimonial[]>([]);
  
  // Keep ref updated with latest testimonials
  testimonialsRef.current = testimonials;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const cacheBuster = Date.now();
      const res = await fetch(
        `https://inessstorage.blob.core.windows.net/admin-data/Jsons/testimonial?cb=${cacheBuster}`
      );
      const data = await res.json();
      const limitedData = Array.isArray(data)
        ? data.filter((t) => t && t.reviewerName && t.imageUrl).slice(0, 3)
        : [];
      setTestimonials(limitedData);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const rotateCarousel = (direction: number) => {
    if (testimonialsRef.current.length === 0) return;
    
    Animated.timing(animatedValue, {
      toValue: direction,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex((prev) => {
        const len = testimonialsRef.current.length;
        if (len === 0) return 0;
        if (direction > 0) {
          return (prev + 1) % len;
        } else {
          return (prev - 1 + len) % len;
        }
      });
      animatedValue.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        // Only capture horizontal swipes, allow vertical scrolling
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
      },
      onPanResponderTerminationRequest: () => false, // Don't allow parent to take over
      onPanResponderRelease: (_, { dx, vx }) => {
        if (testimonialsRef.current.length === 0) return;
        if (Math.abs(dx) > 50 || Math.abs(vx) > 0.5) {
          const direction = dx < 0 ? 1 : -1;
          // Rotate carousel
          Animated.timing(animatedValue, {
            toValue: direction,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setCurrentIndex((prev) => {
              const len = testimonialsRef.current.length;
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
    })
  ).current;

  const { height: screenHeight } = Dimensions.get("window");
  const mainCardPadding = screenHeight < 700 ? 12 : screenHeight < 900 ? 14 : 16;

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
    const baseOffset = CARD_WIDTH * 0.55;
    
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
        <View style={[styles.card, { height: CARD_HEIGHT }]}>
          {/* Image */}
          <View style={[styles.imageContainer, { height: CARD_HEIGHT * 0.45 }]}>
            <Image
              source={{ uri: testimonial.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.reviewerName} numberOfLines={1}>
              {testimonial.reviewerName}
            </Text>

            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }).map((_, i) => (
                <AntDesign
                  key={i}
                  name={i < testimonial.rating ? "star" : "staro"}
                  size={12}
                  color="#FFD700"
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>

            <Text style={styles.reviewText} numberOfLines={2}>
              {testimonial.review}
            </Text>
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
          onPress={() => router.push("/(tabs)/dashboard/testimonials")}
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

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {testimonials.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? "#9747FF" : "#E0E0E0" },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: "#000",
    fontWeight: "700",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: "#666",
    marginRight: 4,
    fontWeight: "600",
  },
  carouselContainer: {
    height: CARD_HEIGHT + 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  cardWrapper: {
    position: "absolute",
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  imageContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cardContent: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontFamily: theme.fonts.bold,
    color: "#000",
    fontWeight: "700",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: "#666",
    lineHeight: 16,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default TestimonialsCarousel;
