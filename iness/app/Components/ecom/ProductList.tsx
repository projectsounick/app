import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Product } from "@/app/interfaces/ecommerceInterface";
import ProductModal from "@/app/Modals/ProductBottomSheetModal";
import theme from "@/app/Theme/globalTheme";

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
        style={styles.productCard}
        onPress={() => handleCheck(item)}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {/* Product Image */}
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialIcons name="image" size={40} color="#999" />
            </View>
          )}

          {/* Plus icon - no white background */}
          <TouchableOpacity
            style={styles.plusIcon}
            onPress={() => handleCheck(item)}
          >
            <AntDesign name="pluscircle" size={28} color="#67C694" />
          </TouchableOpacity>

          {/* Variation Label Badge */}
          {displayLabel && (
            <View style={styles.variationBadge}>
              <Text style={styles.variationText}>{displayLabel}</Text>
            </View>
          )}
        </View>

        {/* Bottom Details */}
        <View style={styles.productDetails}>
          <Text numberOfLines={2} style={styles.productName}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>₹{displayPrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Featured Products</Text>
        <View style={styles.headerDash} />
      </View>

      {/* Products by Category */}
      {Object.entries(groupedProducts).map(([category, products]) => (
        <View key={category} style={styles.categoryContainer}>
          {/* Category Header */}
          <View style={styles.categoryHeader}>
            <View style={styles.categoryIconContainer}>
              <MaterialCommunityIcons
                name="tag-outline"
                size={16}
                color="#9747FF"
              />
            </View>
            <Text style={styles.categoryName}>{category}</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{products.length} items</Text>
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

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  headerDash: {
    width: 40,
    height: 3,
    backgroundColor: "#9747FF",
    borderRadius: 2,
  },
  categoryContainer: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  itemCountBadge: {
    backgroundColor: "#F3EDFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9747FF",
    fontFamily: theme.fonts.medium,
  },
  productCard: {
    width: 150,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  variationBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#F3EDFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  variationText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9747FF",
    fontFamily: theme.fonts.medium,
  },
  productDetails: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
    lineHeight: 16,
    fontFamily: theme.fonts.medium,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9747FF",
    fontFamily: theme.fonts.bold,
  },
});

export default GroupedProductDisplay;
