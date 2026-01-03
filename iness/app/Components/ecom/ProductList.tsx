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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const GroupedProductDisplay = () => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
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
              <MaterialIcons name="image" size={40} color={theme.colors.textMuted} />
            </View>
          )}

          {/* Plus icon - no white background */}
          <TouchableOpacity
            style={styles.plusIcon}
            onPress={() => handleCheck(item)}
          >
            <AntDesign name="pluscircle" size={28} color={theme.colors.success} />
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
                color={theme.colors.secondPrimary}
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

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  headerDash: {
    width: 40,
    height: 3,
    backgroundColor: theme.colors.secondPrimary,
    borderRadius: 2,
  },
  categoryContainer: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  categoryName: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  itemCountBadge: {
    backgroundColor: theme.colors.backgroundCardLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemCountText: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
  productCard: {
    width: 150,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.border,
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
    backgroundColor: theme.colors.backgroundCardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  variationText: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
  },
  productDetails: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  productName: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    marginBottom: 6,
    lineHeight: 16,
    fontFamily: theme.fonts.medium,
  },
  productPrice: {
    fontSize: theme.fontSizes.regular,
    fontWeight: "700",
    color: isDark ? theme.colors.textWhite : theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
  },
});

export default GroupedProductDisplay;
