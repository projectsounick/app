import React, { useState } from "react";
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

  const categoryProducts = products.filter(
    (item) => item.category._id === categoryId
  );

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
          height: 180,
          borderRadius: 12,
          backgroundColor: "#fff",
          overflow: "hidden",
          marginBottom: 16,
          marginRight: 16,
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
              top: 6,
              right: 6,
              backgroundColor: "#fff",
              borderRadius: 30,
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
            onPress={() => handleCheck(item)}
          >
            <Feather name="plus" size={22} color="#00A300" />
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
              fontSize: 11,
              fontWeight: "700",
              color: "#000",
              marginTop: 2,
            }}
          >
            ₹{displayPrice}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
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
          <Text style={{ textAlign: "center", marginTop: 40, color: "#999" }}>
            No products found in this category.
          </Text>
        )}
      />

      {/* Modal */}
      {product && (
        <ProductModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          selectedProduct={product}
          bgColor={color}
        />
      )}
    </View>
  );
};

export default CategoryProductsScreen;
