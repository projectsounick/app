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
import { useNavigation, useRoute } from "@react-navigation/native";
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
    return (
      <View
        key={item._id}
        style={{
          width: CARD_WIDTH,
          height: 160,
          borderRadius: 12,
          backgroundColor: "#fff",
          overflow: "hidden",
          marginBottom: 16,
          marginRight: 16,
        }}
      >
        {/* Top Section */}
        <View
          style={{
            backgroundColor: color,
            height: 120,
            padding: 8,
            borderRadius: 12,
            justifyContent: "space-between",
          }}
        >
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{
                width: "100%",
                height: 75,
                borderRadius: 8,

                resizeMode: "contain",
                alignSelf: "center", // changed from flex-end to center
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: "#999",
                borderRadius: 8,

                alignSelf: "flex-end",
              }}
            />
          )}
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingVertical: 2,
              paddingHorizontal: 8,
              alignSelf: "flex-end",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleCheck(item)}
          >
            <Text
              style={{
                color: "#000",
                fontWeight: "600",
                fontSize: 8,
                marginRight: 6,
              }}
            >
              Check
            </Text>
            <Feather name="arrow-right" size={10} color="#000" />
          </TouchableOpacity>
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
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F6F6" }}>
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
          Products
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
    </SafeAreaView>
  );
};

export default CategoryProductsScreen;
