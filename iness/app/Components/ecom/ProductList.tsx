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
    setShowModal(true);
  };

  const renderProductCard = (item: Product, index: number) => {
    const hasVariation = item.variations && item.variations.length > 0;
    const variation =
      hasVariation && item.variations ? item.variations[0] : null;
    const displayLabel = variation?.label;
    const displayPrice = variation?.price ?? item.basePrice;

    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.8}
        style={{
          width: 160,
          borderRadius: 18,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          marginRight: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F5F5F5",
        }}
        onPress={() => handleCheck(item)}
      >
        {/* Image Container */}
        <View
          style={{
            width: "100%",
            height: 150,
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
          }}
        >
          {/* Product Image */}
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "contain",
              }}
            />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#E0E0E0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="image" size={40} color="#999" />
            </View>
          )}

          {/* Plus icon */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={() => handleCheck(item)}
          >
            <AntDesign name="pluscircle" size={22} color="#67C694" />
          </TouchableOpacity>

          {/* Variation Label Badge */}
          {displayLabel && (
            <View
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: "#9747FF",
                }}
              >
                {displayLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Details */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#000",
              marginBottom: 6,
              lineHeight: 18,
            }}
          >
            {item.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#9747FF",
              }}
            >
              ₹{displayPrice}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginTop: 32, marginBottom: 8 }}>
      {/* Header Section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingHorizontal: 4,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#000",
            letterSpacing: -0.5,
          }}
        >
          Featured Products
        </Text>
        <View
          style={{
            width: 40,
            height: 3,
            backgroundColor: "#9747FF",
            borderRadius: 2,
          }}
        />
      </View>

      {/* Products by Category */}
      {Object.entries(groupedProducts).map(([category, products]) => (
        <View
          key={category}
          style={{
            marginBottom: 28,
            padding: 20,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
            borderWidth: 1,
            borderColor: "#F5F5F5",
          }}
        >
          {/* Category Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#F0F0F0",
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#9747FF",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <MaterialIcons name="shop" size={20} color="#FFFFFF" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
                flex: 1,
              }}
            >
              {category}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F8F8F8",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#9747FF",
                  marginRight: 4,
                }}
              >
                {products.length}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#666",
                }}
              >
                items
              </Text>
            </View>
          </View>

          {/* Products List */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => renderProductCard(item, index)}
            contentContainerStyle={{ paddingRight: 4 }}
          />
        </View>
      ))}
      {/* BottomSheet with product details */}
      {product && (
        <ProductModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          selectedProduct={product}
          bgColor="#FFFFFF"
        />
      )}
    </View>
  );
};

export default GroupedProductDisplay;
