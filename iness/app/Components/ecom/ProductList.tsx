import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Product } from "@/app/interfaces/ecommerceInterface";

import ProductBottomSheet from "./ProductBottomSheet";
import ProductModal from "./ProductBottomSheet";
const GroupedProductDisplay = () => {
  const products: Product[] = useSelector(
    (state: RootState) => state.ecom.products
  );
  const [showModal, setShowModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const [bgColor, setBgColor] = useState("#FFE600");

  // Group products by category
  const groupedProducts = products.reduce(
    (acc, product) => {
      const cat = product.category.name || "Others";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );
  const handleCheck = (product: Product) => {
    setProduct(product);
    setBgColor("#FFE600");
    setShowModal(true);
  };

  const bgColors = [
    "#FFE600", // yellow
    "#00E0FF", // cyan
    "#C1FF72", // light green
    "#70EFFF", // sky
    "#80FFDB", // mint
  ];

  const renderProductCard = (item: Product, index: number) => {
    const hasVariation = item.variations && item.variations.length > 0;
    const variation =
      hasVariation && item.variations ? item.variations[0] : null;
    const displayLabel = variation?.label;
    const displayPrice = variation?.price ?? item.basePrice;

    return (
      <TouchableOpacity
        key={item._id}
        style={{
          width: 150,
          borderRadius: 16,
          backgroundColor: "#fff",
          overflow: "hidden",
          marginRight: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
        }}
        onPress={() => handleCheck(item)}
      >
        {/* Image Container */}
        <View
          style={{
            width: "100%",
            height: 140,
            position: "relative",
            justifyContent: "flex-end",
          }}
        >
          {/* Product Image */}
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
            />
          ) : (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "#e0e0e0",
              }}
            />
          )}

          {/* Overlay gradient for readability */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 50,
              backgroundColor: "rgba(0,0,0,0.25)",
            }}
          />

          {/* Plus icon */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 3,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 3,
            }}
            onPress={() => handleCheck(item)}
          >
            <AntDesign name="pluscircle" size={22} color="#67c694" />
          </TouchableOpacity>

          {/* Quantity / Variation Label */}
          {displayLabel && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                alignSelf: "center",
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#222",
                }}
              >
                {displayLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Details */}
        <View style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: "#333",
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: "#7771de",
              marginTop: 4,
            }}
          >
            ₹{displayPrice}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {Object.entries(groupedProducts).map(([category, products]) => (
        <View
          key={category}
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <MaterialIcons name="shop" size={20} color="#000" />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#000",
                marginLeft: 6,
              }}
            >
              Shop {category}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color="#000"
              style={{ marginLeft: "auto" }}
            />
          </View>

          <Text
            style={{
              fontSize: 12,
              color: "#666",
              marginBottom: 12,
            }}
          >
            Premium products designed to fit your everyday needs.
          </Text>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => renderProductCard(item, index)}
          />
        </View>
      ))}
      {/* BottomSheet with product details */}
      {product && (
        <ProductModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          selectedProduct={product}
          bgColor={bgColor}
        />
      )}
    </View>
  );
};

export default GroupedProductDisplay;
