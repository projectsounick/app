import React, { useCallback, useMemo } from "react";


import { SafeAreaView } from "react-native-safe-area-context";
import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";
import { ecommerceService } from "@/src/services/ecom.service";

import StoreShimmer from "@/src/modules/Shimmer/StoreShimmer";
import CategoryList from "@/src/Components/ecom/CategoryList";
import GroupedProductDisplay from "@/src/Components/ecom/ProductList";
import SmallHeader from "@/src/modules/SmallHeader";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import CustomSnackbar from "@/src/modules/Snackbar";
import { communityService } from "@/src/services/community.service";
import { useFocusEffect } from "expo-router";

//// Main functional component for the equipscreen ------------------------/

export default function EquipScreen() {
  const theme = useGlobalTheme();
  const configs = useMemo(
    () => [
      {
        sliceKey: "categories" as SliceKey,
        fetchFunction: ecommerceService.getCategories,
        priority: "high" as const,
        enableCache: true,
        cacheTTL: 60 * 60 * 1000, // 1 hour - categories rarely change
      },
      {
        sliceKey: "products" as SliceKey,
        fetchFunction: ecommerceService.getProducts,
        priority: "high" as const,
        enableCache: true,
        cacheTTL: 30 * 60 * 1000, // 30 minutes - products change occasionally
      },
    ],
    []
  );
  const {
    loading,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
  } =
    useFetchMultipleStoreDataHook(configs, true, true); // Enable priority loading with cache
  useFocusEffect(useCallback(() => {
    void communityService.trackEngagement({ targetType: "store", kind: "view", source: "store_home" }).catch(() => undefined);
  }, []));
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      {/* Header */}
      <SmallHeader title="Store" weightShow={false} />
      {loading ? (
        <StoreShimmer />
      ) : (
        <GroupedProductDisplay headerComponent={<CategoryList />} />
      )}
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
        bgColor={theme.colors.backgroundCard}
      />
    </SafeAreaView>
  );
}
