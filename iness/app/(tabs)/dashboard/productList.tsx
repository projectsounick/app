import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Feather from "react-native-vector-icons/Feather";

import { Product } from "@/app/interfaces/ecommerceInterface";
import ProductModal from "@/app/Components/ecom/ProductBottomSheet";
import SmallHeader from "@/app/modules/SmallHeader";
import { useLocalSearchParams } from "expo-router";
import BackHeader from "@/app/modules/BackHeader";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = (screenWidth - 48) / 2; // 2 cards per row with 16px padding

const CategoryProductsScreen = () => {
  const { category, color, categoryId }: any = useLocalSearchParams();

  const products: Product[] = useSelector(
    (state: RootState) => state.ecom.products
  );

  // Decode categoryId if it's URL encoded
  const decodedCategoryId = React.useMemo(() => {
    if (!categoryId) return null;
    try {
      return decodeURIComponent(String(categoryId));
    } catch {
      return String(categoryId);
    }
  }, [categoryId]);

  const categoryProducts = React.useMemo(() => {
    if (!decodedCategoryId || !products.length) return [];
    
    return products.filter((item) => {
      if (!item.category) return false;
      
      // Handle both string and object category._id
      const itemCategoryId = typeof item.category === 'string' 
        ? item.category 
        : item.category._id;
      
      // Compare as strings, trimming any whitespace
      return String(itemCategoryId).trim() === String(decodedCategoryId).trim();
    });
  }, [products, decodedCategoryId]);

  const [showModal, setShowModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const handleCheck = (product: Product) => {
    setProduct(product);
    setShowModal(true);
  };

  const renderProductCard = ({ item }: { item: Product; index: number }) => {
    const variation = item.variations?.[0];
    const displayLabel = variation?.label;
    const displayPrice = variation?.price ?? item.basePrice;

    return (
      <TouchableOpacity
        key={item._id}
        style={{
          width: CARD_WIDTH,
          height: 200,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          marginBottom: 16,
          marginRight: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: "#F0F0F0",
        }}
        onPress={() => handleCheck(item)}
      >
        {/* Top Section (Image + Quantity + Button) */}
        <View
          style={{
            height: 120,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            position: "relative",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {/* Background Image */}
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                resizeMode: "contain",
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: "#999",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          )}

          {/* Plus/Check Button */}
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
            <Feather name="plus" size={20} color="#67C694" />
          </TouchableOpacity>

          {/* Quantity (Variation Label) */}
          {displayLabel && (
            <View
              style={{
                backgroundColor: "#fff",
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
                marginBottom: 6,
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                {displayLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Section */}
        <View style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text
            numberOfLines={2}
            style={{
              fontWeight: "600",
              color: "#000",
              fontSize: 10,
            }}
          >
            {item.name}
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: "#9747FF",
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <SmallHeader title={"Products"} />
      <BackHeader />
      {/* Products Heading */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
          }}
        >
          {category}
        </Text>
      </View>
      {/* Product Grid */}
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8, // reduce from 16 to 8 or 0
          flexGrow: 1,
        }}
        data={categoryProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item, index }) => renderProductCard({ item, index })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 60, paddingHorizontal: 20 }}>
            <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "600", color: "#666", marginBottom: 8 }}>
              No products available
            </Text>
            <Text style={{ textAlign: "center", fontSize: 14, color: "#999" }}>
              Check back later for new products in this category
            </Text>
          </View>
        )}
      />

      {/* Modal */}
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

export default CategoryProductsScreen;
