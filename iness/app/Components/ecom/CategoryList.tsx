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
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

interface Category {
  _id: string;
  name: string;
  image: string;
}

function CategoryGrid() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
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
            <MaterialIcons name="chevron-right" size={20} color={theme.colors.text} />
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
              color={theme.colors.secondPrimary}
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

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
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
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: (Dimensions.get("window").width - 48) / 2,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    padding: 12,
    marginBottom: 12,
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
    alignItems: "center",
    justifyContent: "center",
    height: 90,
    marginBottom: 10,
    backgroundColor: theme.colors.backgroundSecondary,
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
    borderTopColor: theme.colors.border,
  },
  categoryName: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
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
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
});

export default memo(CategoryGrid);
