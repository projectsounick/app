import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");
const categoryCardWidth = (screenWidth - 48) / 2;

const StoreShimmer: React.FC = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Category Section */}
      <View style={styles.section}>
        {/* Header */}
        <View style={styles.headerSection}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.headerTitle}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.headerDash}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />
        </View>

        {/* Category Grid - 2 columns */}
        <View style={styles.categoryGrid}>
          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={[styles.categoryCard, { width: categoryCardWidth }]}>
              {/* Image Container */}
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.categoryImage}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
              {/* Footer */}
              <View style={styles.categoryFooter}>
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.categoryName}
                  shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                  visible={false}
                />
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient}
                  style={styles.chevronIcon}
                  shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                  visible={false}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.section}>
        {/* Header */}
        <View style={styles.headerSection}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.headerTitle}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={styles.headerDash}
            shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
            visible={false}
          />
        </View>

        {/* Product Categories */}
        {[1, 2].map((category) => (
          <View key={category} style={styles.productCategoryContainer}>
            {/* Category Header */}
            <View style={styles.productCategoryHeader}>
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.categoryIcon}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.productCategoryName}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient}
                style={styles.itemCountBadge}
                shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                visible={false}
              />
            </View>

            {/* Products Horizontal List */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            >
              {[1, 2, 3, 4].map((product) => (
                <View key={product} style={styles.productCard}>
                  {/* Image Container */}
                  <ShimmerPlaceholder
                    LinearGradient={LinearGradient}
                    style={styles.productImage}
                    shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                    visible={false}
                  />
                  {/* Plus Icon */}
                  <ShimmerPlaceholder
                    LinearGradient={LinearGradient}
                    style={styles.plusIcon}
                    shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                    visible={false}
                  />
                  {/* Product Details */}
                  <View style={styles.productDetails}>
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      style={styles.productName}
                      shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                      visible={false}
                    />
                    <ShimmerPlaceholder
                      LinearGradient={LinearGradient}
                      style={styles.productPrice}
                      shimmerColors={["#E1E9EE", "#F2F8FC", "#E1E9EE"]}
                      visible={false}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
    marginBottom: 8,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    width: 160,
    height: 24,
    borderRadius: 8,
  },
  headerDash: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  categoryCard: {
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  categoryImage: {
    width: "100%",
    height: 90,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  categoryName: {
    flex: 1,
    height: 14,
    borderRadius: 6,
    marginRight: 8,
  },
  chevronIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  productCategoryContainer: {
    marginBottom: 24,
  },
  productCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  productCategoryName: {
    width: 120,
    height: 18,
    borderRadius: 8,
    marginRight: 8,
  },
  itemCountBadge: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },
  productsList: {
    paddingRight: 4,
  },
  productCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F5F5F5",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 0,
  },
  plusIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    width: "90%",
    height: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  productPrice: {
    width: 60,
    height: 16,
    borderRadius: 6,
  },
});

export default StoreShimmer;

