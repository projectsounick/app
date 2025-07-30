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
import { MaterialIcons } from "@expo/vector-icons";
import { Product } from "@/app/interfaces/ecommerceInterface";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import BottomSheet from "@gorhom/bottom-sheet";
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
  const handleCheck = (product: Product, color: string) => {
    setProduct(product);
    setBgColor(color);
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
    const bgColor = bgColors[index % bgColors.length];

    return (
      <View
        key={item._id}
        style={{
          width: 130,
          height: 150,
          borderRadius: 12,
          backgroundColor: "#fff",
          overflow: "hidden",
          marginRight: 8,
        }}
      >
        {/* Top Section with dynamic background */}
        <View
          style={{
            backgroundColor: bgColor,
            height: 120, // increased height slightly
            padding: 8,
            borderRadius: 12,
            justifyContent: "space-between",
            overflow: "hidden", // ensures borderRadius applies to children
          }}
        >
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{
                width: "90%", // increased width
                height: 75, // increased height
                borderRadius: 8,
                resizeMode: "contain", // makes sure background is covered
                alignSelf: "center",
                backgroundColor: bgColor, // fallback to cover any transparency
              }}
            />
          ) : (
            <View
              style={{
                width: 75,
                height: 75,
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
              paddingVertical: 4,
              paddingHorizontal: 8,
              alignSelf: "flex-end",
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleCheck(item, bgColor)}
          >
            <Text
              style={{
                color: "#000",
                fontWeight: "600",
                fontSize: 8,
                marginRight: 4,
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
    <View>
      {Object.entries(groupedProducts).map(([category, products]) => (
        <View
          key={category}
          style={{
            marginBottom: 28,
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
            <MaterialIcons name="shop" size={20} color="#6B46C1" />
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
              size={20}
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
            Tailored plans for your personalized lifestyles.
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
