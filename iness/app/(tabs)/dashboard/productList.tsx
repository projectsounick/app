import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AntDesign } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Product } from "@/app/interfaces/ecommerceInterface";
import ProductModal from "@/app/Components/ecom/ProductBottomSheet";
import SmallHeader from "@/app/modules/SmallHeader";
import { useLocalSearchParams } from "expo-router";
import BackHeader from "@/app/modules/BackHeader";
import theme from "@/app/Theme/globalTheme";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = (screenWidth - 48) / 2;

const CategoryProductsScreen = () => {
  const { category, categoryId }: any = useLocalSearchParams();

  const products: Product[] = useSelector(
    (state: RootState) => state.ecom.products
  );

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

    const normalizedCategoryId = String(decodedCategoryId).trim().toLowerCase();

    return products.filter((item) => {
      if (!item.category) {
        return false;
      }

      let itemCategoryId: string | null = null;

      if (typeof item.category === "string") {
        itemCategoryId = item.category;
      } else if (item.category && typeof item.category === "object") {
        itemCategoryId =
          item.category._id ||
          (item.category as any).id ||
          (item.category as any).categoryId ||
          null;
      }

      if (!itemCategoryId) {
        return false;
      }

      const normalizedItemCategoryId = String(itemCategoryId)
        .trim()
        .toLowerCase();
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
        style={styles.productCard}
        onPress={() => handleCheck(item)}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {item.images?.[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
            />
          ) : (
            <View style={styles.noImageContainer}>
              <MaterialCommunityIcons name="image-off" size={36} color="#999" />
            </View>
          )}

          {/* Plus Button - no white background */}
          <TouchableOpacity
            style={styles.plusButton}
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

        {/* Product Details */}
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
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["left", "right"]}
      >
        {/* Header */}
        <SmallHeader title="Products" />
        <BackHeader />

        {/* Category Header Section */}
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleRow}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.headerDash} />
          </View>
          {categoryProducts.length > 0 && (
            <View style={styles.countBadge}>
              <MaterialCommunityIcons
                name="package-variant"
                size={14}
                color="#9747FF"
              />
              <Text style={styles.countText}>
                {categoryProducts.length}{" "}
                {categoryProducts.length === 1 ? "product" : "products"}
              </Text>
            </View>
          )}
        </View>

        {/* Product Grid */}
        <FlatList
          contentContainerStyle={styles.listContent}
          data={categoryProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item, index }) => renderProductCard({ item, index })}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={40}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.emptyTitle}>No products available</Text>
              <Text style={styles.emptySubtitle}>
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
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  categoryHeader: {
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 22,
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
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EDFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    gap: 6,
  },
  countText: {
    fontSize: 12,
    color: "#9747FF",
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  productCard: {
    width: CARD_WIDTH,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  imageContainer: {
    height: 140,
    width: "100%",
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
  plusButton: {
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
});

export default CategoryProductsScreen;
