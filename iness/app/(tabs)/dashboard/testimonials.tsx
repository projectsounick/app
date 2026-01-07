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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
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
      <>
        {isDark ? (
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["left", "right"]}>
              <View
                style={{
                  paddingLeft: 20,
                  marginTop: Platform.OS === "ios" ? topPadding : "4%",
                }}
              >
                <NormalHeader screenName="Testimonials" />
              </View>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.secondPrimary} />
              </View>
            </SafeAreaView>
          </View>
        ) : (
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
        )}
      </>
    );
  }

  return (
    <>
      {isDark ? (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["left", "right"]}>
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
                              <Ionicons name="expand" size={14} color={isDark ? theme.colors.textWhite : "#9747FF"} />
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

                            {/* Review Text - Properly constrained */}
                            <Text
                              style={styles.reviewText}
                              numberOfLines={3}
                              ellipsizeMode="tail"
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
                <Ionicons name="close" size={20} color={isDark ? theme.colors.textWhite : "#000"} />
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

              {/* Dots Indicator - Removed */}
            </View>
          </KeyboardAvoidingView>
        </Modal>
          </SafeAreaView>
        </View>
      ) : (
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
                                  <Ionicons name="expand" size={14} color={isDark ? theme.colors.textWhite : "#9747FF"} />
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

                                {/* Review Text - Properly constrained */}
                                <Text
                                  style={styles.reviewText}
                                  numberOfLines={3}
                                  ellipsizeMode="tail"
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

                  {/* Dots Indicator - Removed */}
                </View>
              </KeyboardAvoidingView>
            </Modal>
          </ImageBackground>
        </SafeAreaView>
      )}
    </>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
    backgroundColor: isDark ? theme.colors.background : theme.colors.background,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    ...(isDark ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: isDark ? theme.colors.textWhite : theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSizes.small,
    color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: theme.colors.divider,
    marginHorizontal: 8,
  },
  // Testimonials Grid - 2 cards per row
  testimonialsContainer: {
    marginTop: 8,
  },
  testimonialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: isDark ? theme.colors.background : theme.colors.background,
    borderRadius: 20,
    overflow: "hidden",
    ...(isDark ? {} : {
      shadowColor: "#9747FF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    }),
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: (width - 48) / 2, // 2 cards with padding and gaps
  },
  imageContainer: {
    width: "100%",
    height: 120, // Reduced height for better proportion
    overflow: "hidden",
    position: "relative",
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Show full image without cropping
  },
  expandIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: isDark ? theme.colors.backgroundCard : "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...(isDark ? {} : {
      shadowColor: "#9747FF",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    }),
    borderWidth: 1,
    borderColor: isDark ? theme.colors.border : "rgba(151, 71, 255, 0.1)",
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: "flex-start",
  },
  reviewerName: {
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.bold,
    color: isDark ? theme.colors.textWhite : theme.colors.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.medium,
    color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
    marginLeft: 4,
    fontWeight: "600",
  },
  reviewText: {
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.regular,
    color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
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
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.regular,
    color: isDark ? theme.colors.textWhite : theme.colors.textMuted,
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
    backgroundColor: isDark ? theme.colors.background : theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "android" ? 20 : 40,
    ...(isDark ? {} : {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 10,
    }),
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: theme.colors.divider,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
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
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.border,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalReviewerName: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fonts.bold,
    color: isDark ? theme.colors.textWhite : theme.colors.black,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalRatingText: {
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.medium,
    color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
    marginLeft: 8,
  },
  modalDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  modalReviewText: {
    flex: 1,
    fontSize: theme.fontSizes.regular,
    fontFamily: theme.fonts.regular,
    color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
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
