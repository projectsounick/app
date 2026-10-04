import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import { Product } from "@/src/interfaces/ecommerceInterface";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as NavigationBar from "expo-navigation-bar";
import SystemNavigationBar from "react-native-system-navigation-bar";
import AnimatedSubmitButton from "@/src/modules/AnimatedSubmitButton";
import { cartService } from "@/src/services/cart.service";
import { addToCart } from "@/Slices/cartSlice";
import {
  convertToProductCartItem,
  isEcomProductAddableToCart,
} from "@/utils/cartUtils";
import { RootState } from "@/store";
import CustomSnackbar from "@/src/modules/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { withAuthGuard } from "@/src/Hoc/WithAuthGuardButton";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import { communityService } from "@/src/services/community.service";

const ProtectedAnimatedSubmitButton = withAuthGuard(AnimatedSubmitButton);
const { width, height } = Dimensions.get("window");

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  bgColor: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  onClose,
  selectedProduct,
  bgColor,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [selectedVariationId, setSelectedVariationId] = useState<
    string | null
  >();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const imageScrollRef = useRef<ScrollView>(null);
  const [cartLoading, setCardLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    if (
      selectedProduct &&
      selectedProduct.variations &&
      selectedProduct.variations.length > 0
    )
      setSelectedVariationId(selectedProduct.variations[0]._id);
  }, [selectedProduct]);

  useEffect(() => {
    if (!visible || !selectedProduct?._id) return;
    void communityService.trackEngagement({ targetType: "product", targetId: selectedProduct._id, kind: "view", source: "product_modal" }).catch(() => undefined);
  }, [selectedProduct?._id, visible]);

  // Hide navigation bar when modal opens - keep it hidden continuously
  useEffect(() => {
    if (Platform.OS === "android") {
      if (visible) {
        // When modal is visible, aggressively hide navigation bar
        NavigationBar.setVisibilityAsync("hidden");
        SystemNavigationBar.stickyImmersive();

        // Set up interval to continuously hide it (Android sometimes shows it automatically)
        const interval = setInterval(() => {
          NavigationBar.setVisibilityAsync("hidden");
          SystemNavigationBar.stickyImmersive();
        }, 100);

        return () => clearInterval(interval);
      } else {
        // When modal closes, ensure it stays hidden
        NavigationBar.setVisibilityAsync("hidden");
        SystemNavigationBar.stickyImmersive();
      }
    }
  }, [visible]);

  if (!selectedProduct) return null;

  const productImages = Array.isArray(selectedProduct.images)
    ? selectedProduct.images.filter(
        (imageUrl): imageUrl is string =>
          typeof imageUrl === "string" && imageUrl.trim().length > 0
      )
    : [];

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const variationType = selectedProduct.variationType;
  const variations = selectedProduct.variations;
  const price =
    variationType && variations && variations.length > 0
      ? variations[selectedVariation]?.price ?? variations[0]?.price
      : selectedProduct.basePrice;

  const toggleDescription = () => setShowFullDescription((prev) => !prev);

  const addingIntoToCart = async () => {
    try {
      setCardLoading(true);

      if (variations?.length && !selectedVariationId) {
        setSnackbarOpen(true);
        setSnackbarMessage("Please select a product option");
        return;
      }

      const alreadyExistsInCart = isEcomProductAddableToCart(
        cartItems,
        selectedProduct._id,
        selectedVariationId
      );
      if (alreadyExistsInCart) {
        setSnackbarOpen(true);
        setSnackbarMessage("Already added to the cart");
        return;
      }

      let apiObject = {
        product: {
          productId: selectedProduct._id,
          variationId: selectedVariationId,
        },
      };

      const cartDbResponse = await cartService.addCartItems(apiObject);
      const updatedCartItem = convertToProductCartItem(
        selectedProduct,
        selectedVariationId
      );
      if (!cartDbResponse.success) {
        throw new Error(cartDbResponse.message);
      } else {
        let finalItem = {
          ...updatedCartItem,
          _id: cartDbResponse.data._id,
        };

        dispatch(addToCart(finalItem));
        void communityService.trackEngagement({ targetType: "product", targetId: selectedProduct._id, kind: "add_to_cart", source: "product_modal" }).catch(() => undefined);
        setSnackbarOpen(true);
        setSnackbarMessage("Added to cart successfully");
      }
    } catch (error: any) {
      setSnackbarMessage(error?.message || "Unable to add this item to the cart");
      setSnackbarOpen(true);
    } finally {
      setCardLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        {/* Dash Handle */}
        <View style={styles.dashHandle} />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={imageScrollRef}
          >
            {productImages.length > 0 ? (
              productImages.map((imgUrl, index) => (
                <Image
                  key={`${imgUrl}-${index}`}
                  source={{ uri: imgUrl }}
                  resizeMode="contain"
                  style={styles.carouselImage}
                />
              ))
            ) : (
              <View style={[styles.carouselImage, styles.missingImage]}>
                <MaterialCommunityIcons
                  name="image-off-outline"
                  size={52}
                  color={theme.colors.textMuted}
                />
                <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>
                  Image unavailable
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Dots */}
          <View style={styles.dotsContainer}>
            {productImages.map((_, index) => (
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
        </View>

        {/* Product Info */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.productName}>{selectedProduct.name}</Text>

          {/* Description */}
          <Pressable onPress={toggleDescription}>
            <Text
              numberOfLines={showFullDescription ? undefined : 3}
              style={styles.description}
            >
              {selectedProduct.description}
            </Text>
            {!showFullDescription && (
              <Text style={styles.readMore}>Read more</Text>
            )}
          </Pressable>

          {/* Variations */}
          {variationType && variations && variations.length > 0 && (
            <View style={styles.variationSection}>
              <View style={styles.variationHeader}>
                <View style={styles.variationIconContainer}>
                  <MaterialCommunityIcons
                    name="format-list-bulleted"
                    size={16}
                    color={theme.colors.secondPrimary}
                  />
                </View>
                <Text style={styles.variationTitle}>{variationType}</Text>
              </View>
              <View style={styles.variationList}>
                {variations.map((v, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setSelectedVariation(idx);
                      setSelectedVariationId(v._id);
                    }}
                    style={[
                      styles.variationChip,
                      selectedVariation === idx && styles.variationChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variationChipText,
                        selectedVariation === idx &&
                        styles.variationChipTextSelected,
                      ]}
                    >
                      {v.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceSection}>
            <View style={styles.priceIconContainer}>
              <MaterialCommunityIcons
                name="tag-outline"
                size={18}
                color={theme.colors.success}
              />
            </View>
            <Text style={styles.priceLabel}>Total Price</Text>
            <Text style={styles.priceValue}>
              ₹{((price ?? 0) * quantity).toFixed(2)}
            </Text>
          </View>
        </ScrollView>

        {/* Add to Cart Button */}
        <ProtectedAnimatedSubmitButton
          loading={cartLoading}
          title="Add to Cart"
          onPress={addingIntoToCart}
          height={50}
        />

        <CustomSnackbar
          visible={snackbarOpen}
          message={snackbarMessage}
          onDismiss={() => setSnackbarOpen(false)}
          bgColor={theme.colors.success}
        />
      </View>
    </Modal>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    height: height * 0.9,
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.mediumGrey,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  imageCarousel: {
    height: 180,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: theme.colors.backgroundSecondary,
  },
  carouselImage: {
    width: width - 40,
    height: 180,
  },
  missingImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.backgroundSecondary,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  productName: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    marginBottom: 10,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  readMore: {
    color: theme.colors.secondPrimary,
    marginBottom: 16,
    fontWeight: theme.fontWeights.medium as "500",
    fontSize: theme.fontSizes.regularSmall,
    fontFamily: theme.fonts.medium,
  },
  variationSection: {
    marginBottom: 16,
  },
  variationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  variationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  variationTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  variationList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
  },
  variationChipSelected: {
    backgroundColor: theme.colors.backgroundCardLight,
    borderColor: theme.colors.secondPrimary,
  },
  variationChipText: {
    fontSize: theme.fontSizes.regularSmall,
    color: isDark ? theme.colors.textWhite : theme.colors.textSecondary,
    fontWeight: theme.fontWeights.medium as "500",
    fontFamily: theme.fonts.medium,
  },
  variationChipTextSelected: {
    color: isDark ? theme.colors.textWhite : theme.colors.secondPrimary,
    fontWeight: "600",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  priceLabel: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  priceValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: isDark ? theme.colors.textWhite : theme.colors.success,
    fontFamily: theme.fonts.bold,
  },
});

export default ProductModal;
