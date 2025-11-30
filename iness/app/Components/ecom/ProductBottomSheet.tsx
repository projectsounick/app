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
  ImageBackground,
} from "react-native";
import { Product } from "@/app/interfaces/ecommerceInterface";
import { Ionicons } from "@expo/vector-icons";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { cartService } from "@/app/services/cart.service";
import { addToCart } from "@/Slices/cartSlice";
import {
  convertToProductCartItem,
  isEcomProductAddableToCart,
  isProductAddableToCart,
} from "@/utils/cartUtils";
import { RootState } from "@/store";
import CustomSnackbar from "@/app/modules/Snackbar";
import { useDispatch, useSelector } from "react-redux";
import { withAuthGuard } from "@/app/Hoc/WithAuthGuardButton";
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

  const [selectedPlanItem, setSelectedPlanItem] = React.useState("");
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

      /// checking whether this product is available in cart or not--/
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

      /// making the api call to store cart details in the database ---/
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
        setSelectedPlanItem("");
      }
      //}
    } catch (error: any) {
      setSnackbarOpen(error.message);
      setSnackbarOpen(true);
    } finally {
      setCardLoading(false);
    }
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        />
      </TouchableWithoutFeedback>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          height: height * 0.75,
          width: "100%",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: "#FFFFFF",
          padding: 20,
        }}
      >
        <View
          style={{
            width: 50,
            height: 5,
            backgroundColor: "#000000",
            borderRadius: 3,
            alignSelf: "center",
            marginBottom: 16,
          }}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={{
            height: 36,
            width: 36,
            alignSelf: "flex-end",
            backgroundColor: "#F5F5F5",
            borderRadius: 18,
            marginBottom: 16,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1,
          }}
          onPress={onClose}
        >
          <Ionicons name="close" size={20} color="#000" />
        </TouchableOpacity>

        {/* Image Carousel */}
        <View style={{ height: 240, marginBottom: 20, borderRadius: 16, overflow: "hidden", backgroundColor: "#F8F8F8" }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={imageScrollRef}
            style={{
              borderRadius: 16,
            }}
          >
            {selectedProduct.images.map((imgUrl, index) => (
              <Image
                key={index}
                source={{ uri: imgUrl }}
                resizeMode="contain"
                style={{ width: width - 40, height: 240 }}
              />
            ))}
          </ScrollView>

          {/* Dots */}
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {selectedProduct.images.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === activeIndex ? "#9747FF" : "#D0D0D0",
                  marginHorizontal: 4,
                }}
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
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#000" }}>
            {selectedProduct.name}
          </Text>

          {/* Description */}
          <Pressable onPress={toggleDescription}>
            <Text
              numberOfLines={showFullDescription ? undefined : 3}
              style={{ fontSize: 14, color: "#666", marginBottom: 8, lineHeight: 20 }}
            >
              {selectedProduct.description}
            </Text>
            {!showFullDescription && (
              <Text style={{ color: "#9747FF", marginBottom: 16, fontWeight: "500" }}>
                Read more
              </Text>
            )}
          </Pressable>

          {/* Variations */}
          {variationType && variations && variations.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#000" }}
              >
                {variationType}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {variations.map((v, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setSelectedVariation(idx);
                      setSelectedVariationId(v._id);
                    }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor:
                        selectedVariation === idx ? "#9747FF" : "#F5F5F5",
                      borderWidth: selectedVariation === idx ? 0 : 1,
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: selectedVariation === idx ? "#FFFFFF" : "#000",
                        fontWeight: selectedVariation === idx ? "600" : "500",
                      }}
                    >
                      {v.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Control */}

          {/* Price */}
          <View style={{ marginBottom: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F0F0F0" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#9747FF" }}>
              ₹{((price ?? 0) * quantity).toFixed(2)}
            </Text>
          </View>
        </ScrollView>

        {/* Add to Cart Button */}
        <ProtectedAnimatedSubmitButton
          loading={cartLoading}
          title="Add to cart"
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

export default ProductModal;
