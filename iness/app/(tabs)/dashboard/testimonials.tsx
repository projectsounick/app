import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { AntDesign, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import NormalHeader from "@/app/modules/NormalHeader";

const { width, height } = Dimensions.get("window");
const topPadding = height * 0.05;

interface Testimonial {
  imageUrl: string;
  reviewerName: string;
  review: string;
  rating: number;
}

export default function TestimonialsScreen() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (selectedTestimonialIndex !== null && scrollRef.current) {
      scrollRef.current.scrollTo({
        x: selectedTestimonialIndex * width,
        animated: false,
      });
      setActiveIndex(selectedTestimonialIndex);
    }
  }, [selectedTestimonialIndex]);

  const fetchTestimonials = async () => {
    try {
      const cacheBuster = Date.now();
      const res = await fetch(
        `https://inessstorage.blob.core.windows.net/admin-data/Jsons/testimonial?cb=${cacheBuster}`
      );
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (index: number) => {
    // Index is already from validTestimonials array
    setSelectedTestimonialIndex(index);
    setActiveIndex(index);
  };

  const closeModal = () => {
    setSelectedTestimonialIndex(null);
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  // Filter valid testimonials
  const validTestimonials = testimonials.filter(
    (t) => t && t.reviewerName && t.imageUrl
  );

  // Calculate statistics based on valid testimonials
  const totalTestimonials = validTestimonials.length;
  const averageRating =
    validTestimonials.length > 0
      ? (
          validTestimonials.reduce((sum, t) => sum + t.rating, 0) /
          validTestimonials.length
        ).toFixed(1)
      : "0.0";
  const fiveStarCount = validTestimonials.filter((t) => t.rating === 5).length;

  // Group valid testimonials into rows of 2
  const groupedTestimonials = [];
  for (let i = 0; i < validTestimonials.length; i += 2) {
    groupedTestimonials.push(validTestimonials.slice(i, i + 2));
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <ImageBackground
          source={require("../../../assets/images/basicBackground.jpg")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Testimonials" />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9747FF" />
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={{
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Testimonials" />
        </View>

        {/* Statistics Card - Fixed at Top */}
        {validTestimonials.length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="account-star"
                  size={18}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.statValue}>{totalTestimonials}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="star"
                  size={18}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.statValue}>{averageRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <MaterialCommunityIcons
                  name="star-circle"
                  size={18}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.statValue}>{fiveStarCount}</Text>
              <Text style={styles.statLabel}>5 Star Reviews</Text>
            </View>
          </View>
        )}

        {/* Testimonials Grid - Scrollable */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {validTestimonials.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                  name="account-star-outline"
                  size={64}
                  color="#CCC"
                />
              </View>
              <Text style={styles.emptyText}>No testimonials available</Text>
            </View>
          ) : (
            <View style={styles.testimonialsContainer}>
              {groupedTestimonials.map((row, rowIndex) => {
                const startIndex = rowIndex * 2;
                return (
                  <View key={rowIndex} style={styles.testimonialRow}>
                    {row.map((testimonial, index) => {
                      const globalIndex = startIndex + index;
                      return (
                        <TouchableOpacity
                          key={`${testimonial.reviewerName}-${rowIndex}-${index}`}
                          style={styles.testimonialCard}
                          activeOpacity={0.8}
                          onPress={() => openModal(globalIndex)}
                        >
                          {/* Image - Full image without cropping */}
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: testimonial.imageUrl }}
                              style={styles.image}
                              resizeMode="contain"
                            />
                            {/* Expand Icon */}
                            <View style={styles.expandIcon}>
                              <Ionicons name="expand" size={14} color="#9747FF" />
                            </View>
                          </View>

                          {/* Content */}
                          <View style={styles.cardContent}>
                            <Text
                              style={styles.reviewerName}
                              numberOfLines={1}
                            >
                              {testimonial.reviewerName}
                            </Text>

                            {/* Rating */}
                            <View style={styles.ratingContainer}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <AntDesign
                                  key={i}
                                  name={i < testimonial.rating ? "star" : "staro"}
                                  size={11}
                                  color="#FFD700"
                                  style={{ marginRight: 1 }}
                                />
                              ))}
                            </View>

                            {/* Review Text - Only 2 lines */}
                            <Text
                              style={styles.reviewText}
                              numberOfLines={2}
                            >
                              {testimonial.review}
                            </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {/* Only show empty space if row has exactly 1 valid item */}
                  {row.length === 1 && (
                    <View style={styles.testimonialCard} />
                  )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Bottom Sheet Modal */}
        <Modal
          visible={selectedTestimonialIndex !== null}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeModal}
            />
            <View style={styles.modalSheet}>
              {/* Handle Bar */}
              <View style={styles.dashHandle} />

              {/* Close Button */}
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#000" />
              </TouchableOpacity>

              {/* Carousel */}
              {validTestimonials.length > 0 && (
                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  style={styles.modalCarousel}
                  contentContainerStyle={styles.modalCarouselContent}
                >
                  {validTestimonials.map((testimonial, index) => (
                      <View key={index} style={styles.modalSlide}>
                        {/* Image */}
                        <View style={styles.modalImageContainer}>
                          <Image
                            source={{ uri: testimonial.imageUrl }}
                            style={styles.modalImage}
                            resizeMode="contain"
                          />
                        </View>

                        {/* Content */}
                        <View style={styles.modalContent}>
                          {/* Header with Icon */}
                          <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderIconContainer}>
                              <MaterialCommunityIcons
                                name="account-star"
                                size={24}
                                color="#9747FF"
                              />
                            </View>
                            <View style={styles.modalHeaderText}>
                              <Text style={styles.modalReviewerName}>
                                {testimonial.reviewerName}
                              </Text>
                              {/* Rating */}
                              <View style={styles.modalRatingContainer}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <AntDesign
                                    key={i}
                                    name={i < testimonial.rating ? "star" : "staro"}
                                    size={16}
                                    color="#FFD700"
                                    style={{ marginRight: 2 }}
                                  />
                                ))}
                                <Text style={styles.modalRatingText}>
                                  {testimonial.rating}/5
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Divider */}
                          <View style={styles.modalDivider} />

                          {/* Review Text with Icon */}
                          <View style={styles.modalReviewSection}>
                            <View style={styles.modalReviewIconContainer}>
                              <MaterialCommunityIcons
                                name="format-quote-open"
                                size={20}
                                color="#9747FF"
                              />
                            </View>
                            <Text style={styles.modalReviewText}>
                              {testimonial.review}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                </ScrollView>
              )}

              {/* Dots Indicator */}
              {validTestimonials.length > 1 && (
                <View style={styles.dotsContainer}>
                  {validTestimonials.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              index === activeIndex ? "#9747FF" : "#E0E0E0",
                          },
                        ]}
                      />
                    ))}
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Statistics Card
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#9747FF",
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: theme.fonts.regular,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
  },
  // Testimonials Grid - 2 cards per row
  testimonialsContainer: {
    marginTop: 8,
  },
  testimonialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    maxWidth: (width - 48) / 2, // 2 cards with padding and gaps
    minHeight: 200, // Reduced height
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 305 / 130, // Maintain testimonial image aspect ratio (305x130)
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Show full image without cropping
  },
  expandIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 10,
    flex: 1,
  },
  reviewerName: {
    fontSize: 13,
    fontFamily: theme.fonts.bold,
    color: "#000",
    fontWeight: "700",
    marginBottom: 3,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 10,
    fontFamily: theme.fonts.regular,
    color: "#666",
    lineHeight: 14,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: "#999",
  },
  // Modal Styles - Bottom Sheet
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    maxHeight: height * 0.85,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "android" ? 20 : 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  modalCarousel: {
    flexGrow: 0,
  },
  modalCarouselContent: {
    alignItems: "flex-start",
  },
  modalSlide: {
    width: width - 40,
    paddingBottom: 20,
  },
  modalImageContainer: {
    width: width - 40,
    height: height * 0.35,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalContent: {
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalHeaderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalReviewerName: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: "#000",
    fontWeight: "700",
    marginBottom: 8,
  },
  modalRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalRatingText: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: "#666",
    marginLeft: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  modalReviewSection: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modalReviewIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  modalReviewText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.fonts.regular,
    color: "#666",
    lineHeight: 22,
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
