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
} from "react-native";
import { Product } from "@/app/interfaces/ecommerceInterface";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { cartService } from "@/app/services/cart.service";
import { addToCart } from "@/Slices/cartSlice";
import {
  convertToProductCartItem,
  isEcomProductAddableToCart,
} from "@/utils/cartUtils";
import { RootState } from "@/store";
import CustomSnackbar from "@/app/modules/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { withAuthGuard } from "@/app/Hoc/WithAuthGuardButton";
import theme from "@/app/Theme/globalTheme";

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

  if (!selectedProduct) return null;

  useEffect(() => {
    if (
      selectedProduct &&
      selectedProduct.variations &&
      selectedProduct.variations.length > 0
    )
      setSelectedVariationId(selectedProduct.variations[0]._id);
  }, []);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const variationType = selectedProduct.variationType;
  const variations = selectedProduct.variations;
  const price =
    variationType && variations && variations.length > 0
      ? variations[selectedVariation]?.price
      : selectedProduct.basePrice;

  const toggleDescription = () => setShowFullDescription((prev) => !prev);

  const addingIntoToCart = async () => {
    try {
      setCardLoading(true);

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
        setSnackbarOpen(true);
        setSnackbarMessage("Added to cart successfully");
      }
    } catch (error: any) {
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    } finally {
      setCardLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContent}>
        {/* Dash Handle */}
        <View style={styles.dashHandle} />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={20} color="#1A1A1A" />
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
            {selectedProduct.images.map((imgUrl, index) => (
              <Image
                key={index}
                source={{ uri: imgUrl }}
                resizeMode="contain"
                style={styles.carouselImage}
              />
            ))}
          </ScrollView>

          {/* Dots */}
          <View style={styles.dotsContainer}>
            {selectedProduct.images.map((_, index) => (
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
                    color="#9747FF"
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
                color="#67C694"
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
          bgColor="#67C694"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    height: height * 0.75,
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  dashHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#E0E0E0",
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
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  imageCarousel: {
    height: 220,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },
  carouselImage: {
    width: width - 40,
    height: 220,
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
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  readMore: {
    color: "#9747FF",
    marginBottom: 16,
    fontWeight: "500",
    fontSize: 13,
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
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  variationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
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
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  variationChipSelected: {
    backgroundColor: "#F3EDFF",
    borderColor: "#9747FF",
  },
  variationChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  variationChipTextSelected: {
    color: "#9747FF",
    fontWeight: "600",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  priceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  priceLabel: {
    fontSize: 13,
    color: "#888",
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#67C694",
    fontFamily: theme.fonts.bold,
  },
});

export default ProductModal;
