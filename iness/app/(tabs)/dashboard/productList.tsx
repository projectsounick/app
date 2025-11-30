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
import { AntDesign } from "@expo/vector-icons";

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
    if (!decodedCategoryId || !products.length) {
      return [];
    }
    
    // Normalize the categoryId for comparison (remove any whitespace, convert to string)
    const normalizedCategoryId = String(decodedCategoryId).trim().toLowerCase();
    
    return products.filter((item) => {
      if (!item.category) {
        return false;
      }
      
      // Handle different category formats
      let itemCategoryId: string | null = null;
      
      if (typeof item.category === 'string') {
        // Category is stored as string ID
        itemCategoryId = item.category;
      } else if (item.category && typeof item.category === 'object') {
        // Category is populated object - try multiple possible fields
        itemCategoryId = item.category._id 
          || (item.category as any).id 
          || (item.category as any).categoryId
          || null;
      }
      
      if (!itemCategoryId) {
        return false;
      }
      
      // Normalize and compare
      const normalizedItemCategoryId = String(itemCategoryId).trim().toLowerCase();
      return normalizedItemCategoryId === normalizedCategoryId;
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
        activeOpacity={0.8}
        style={{
          width: CARD_WIDTH,
          height: 240,
          borderRadius: 20,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          marginBottom: 20,
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
            height: 150,
            width: "100%",
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F8F8F8",
          }}
        >
          {/* Product Image */}
          {item.images?.[0] ? (
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
              <AntDesign name="picture" size={40} color="#999" />
            </View>
          )}

          {/* Plus Button */}
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
                bottom: 10,
                left: 10,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: "#9747FF",
                }}
              >
                {displayLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#000",
              marginBottom: 8,
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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Header */}
      <SmallHeader title={"Products"} />
      <BackHeader />
      
      {/* Category Header Section */}
      <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
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
            {category}
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
        {categoryProducts.length > 0 && (
          <Text
            style={{
              fontSize: 14,
              color: "#666",
              marginTop: 4,
            }}
          >
            {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} available
          </Text>
        )}
      </View>
      {/* Product Grid */}
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        data={categoryProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item, index }) => renderProductCard({ item, index })}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        ListEmptyComponent={() => (
          <View 
            style={{ 
              alignItems: "center", 
              justifyContent: "center", 
              marginTop: 80, 
              paddingHorizontal: 20 
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#F8F8F8",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <AntDesign name="inbox" size={40} color="#999" />
            </View>
            <Text 
              style={{ 
                textAlign: "center", 
                fontSize: 18, 
                fontWeight: "700", 
                color: "#000", 
                marginBottom: 8 
              }}
            >
              No products available
            </Text>
            <Text 
              style={{ 
                textAlign: "center", 
                fontSize: 14, 
                color: "#666",
                lineHeight: 20,
              }}
            >
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
