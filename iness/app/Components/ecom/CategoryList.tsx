import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import theme from "@/app/Theme/globalTheme";

interface Category {
  _id: string;
  name: string;
  image: string;
}

function CategoryGrid() {
  const router = useRouter();
  const categories: any = useSelector(
    (state: RootState) => state.ecom.categories
  );

  const renderItem = ({ item, index }: { item: Category; index: number }) => {
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.8}
        style={styles.categoryCard}
        onPress={() => {
          router.push(
            `/dashboard/productList?category=${encodeURIComponent(item.name)}&categoryId=${encodeURIComponent(item._id)}`
          );
        }}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
        </View>

        {/* Bottom row: text + arrow */}
        <View style={styles.cardFooter}>
          <Text numberOfLines={1} style={styles.categoryName}>
            {item.name}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="#1A1A1A" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {categories.length > 0 ? (
        <>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Shop by Category</Text>
            <View style={styles.headerDash} />
          </View>

          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 16 }}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialCommunityIcons
              name="shopping-outline"
              size={40}
              color="#9747FF"
            />
          </View>
          <Text style={styles.emptyTitle}>No categories yet</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new products
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: (Dimensions.get("window").width - 48) / 2,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 12,
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
    alignItems: "center",
    justifyContent: "center",
    height: 90,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    overflow: "hidden",
  },
  categoryImage: {
    width: 75,
    height: 75,
    resizeMode: "contain",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 8,
    fontFamily: theme.fonts.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
});

export default memo(CategoryGrid);
