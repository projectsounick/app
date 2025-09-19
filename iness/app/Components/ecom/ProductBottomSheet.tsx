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
import theme from "@/app/Theme/globalTheme";
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
            backgroundColor: "rgba(0,0,0,0.4)",
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
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fff",
          padding: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: "#ccc",
            borderRadius: 2,
            alignSelf: "center",
            marginBottom: 12,
          }}
        />

        {/* Close Button */}
        <TouchableOpacity
          style={{
            height: 40,
            width: 40,
            alignSelf: "flex-end",
            backgroundColor: "#eee",
            borderRadius: 20,
            marginBottom: 20,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: 6,
            zIndex: 1,
          }}
          onPress={onClose}
        >
          <Ionicons name="close" size={22} color="black" />
        </TouchableOpacity>

        {/* Image Carousel */}
        <View style={{ height: 220, marginBottom: 16 }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={imageScrollRef}
            style={{
              backgroundColor: bgColor,
              borderRadius: 12,
            }}
          >
            {selectedProduct.images.map((imgUrl, index) => (
              <Image
                key={index}
                source={{ uri: imgUrl }}
                resizeMode="contain"
                style={{ width: width - 32, height: 220 }}
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
                  backgroundColor: index === activeIndex ? "#000" : "#ccc",
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
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>
            {selectedProduct.name}
          </Text>

          {/* Description */}
          <Pressable onPress={toggleDescription}>
            <Text
              numberOfLines={showFullDescription ? undefined : 3}
              style={{ fontSize: 14, color: "#444", marginBottom: 8 }}
            >
              {selectedProduct.description}
            </Text>
            {!showFullDescription && (
              <Text style={{ color: "#007AFF", marginBottom: 12 }}>
                Read more
              </Text>
            )}
          </Pressable>

          {/* Variations */}
          {variationType && variations && variations.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}
              >
                {variationType}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {variations.map((v, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setSelectedVariation(idx);
                      setSelectedVariationId(v._id);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor:
                        selectedVariation === idx ? "#67C694" : "#eee",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: theme.fonts.regular,
                        fontSize: 14,
                        color: selectedVariation === idx ? "#000" : "#000",
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
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
            ₹{((price ?? 0) * quantity).toFixed(2)}
          </Text>
        </ScrollView>

        {/* Add to Cart Button */}
        <AnimatedSubmitButton
          loading={cartLoading}
          title="Add to cart"
          onPress={() => {
            addingIntoToCart();
          }}
          height={50}
        />
        <CustomSnackbar
          visible={snackbarOpen}
          message={snackbarMessage}
          onDismiss={() => setSnackbarOpen(false)}
          bgColor={theme.colors.primary}
        />
      </View>
    </Modal>
  );
};

export default ProductModal;
