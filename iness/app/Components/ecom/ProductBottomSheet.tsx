import React, { useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const imageScrollRef = useRef<ScrollView>(null);

  if (!selectedProduct) return null;

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
          height: height * 0.88,
          width: "100%",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fff",
          padding: 16,
        }}
      >
        {/* Close Button */}
        <View
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "#eee",
            borderRadius: 20,
            padding: 6,
            zIndex: 1,
          }}
        >
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={20} color="black" />
          </Pressable>
        </View>

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
                    onPress={() => setSelectedVariation(idx)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor:
                        selectedVariation === idx
                          ? theme.colors.primary
                          : "#eee",
                    }}
                  >
                    <Text
                      style={{
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600" }}>Quantity</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#eee",
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 18 }}>-</Text>
              </TouchableOpacity>
              <Text style={{ paddingHorizontal: 12 }}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                style={{ paddingHorizontal: 12, paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 18 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
            ₹{((price ?? 0) * quantity).toFixed(2)}
          </Text>
        </ScrollView>

        {/* Add to Cart Button */}
        <AnimatedSubmitButton
          loading={false}
          title="Add to cart"
          onPress={() => {
            //addingIntoToCart("dietplan");
          }}
        />
      </View>
    </Modal>
  );
};

export default ProductModal;
