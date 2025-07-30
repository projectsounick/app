import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  FlatList,
} from "react-native";

import theme from "@/app/Theme/globalTheme";
import withAnimatedHeader from "@/app/Hoc/MainHeader";
import NameHeader from "@/app/Components/HeaderSubComponents/NameHeader";
import {
  SafeAreaFrameContext,
  SafeAreaView,
} from "react-native-safe-area-context";
import useFetchMultipleStoreDataHook from "@/hooks/useMultipleDataStoreHook";
import { SliceKey } from "@/sliceRegistery";
import { ecommerceService } from "@/app/services/ecom.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ActivityIndicator } from "react-native-paper";
import CategoryList from "@/app/Components/ecom/CategoryList";
import GroupedProductDisplay from "@/app/Components/ecom/ProductList";

//// Main functional component for the equipscreen ------------------------/
const MainHeader = withAnimatedHeader(NameHeader);
export default function EquipScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const configs = useMemo(
    () => [
      {
        sliceKey: "categories" as SliceKey,
        fetchFunction: ecommerceService.getCategories,
      },
      {
        sliceKey: "products" as SliceKey,
        fetchFunction: ecommerceService.getProducts,
      },
    ],
    []
  );
  const { loading, setSnackbarMessage, setSnackbarVisible } =
    useFetchMultipleStoreDataHook(configs);
  const components = [
    { key: "CategoryList", component: <CategoryList /> },
    { key: "GroupedProductDisplay", component: <GroupedProductDisplay /> },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      {/* Header */}
      <MainHeader scrollY={scrollY} title="Equip" />
      {loading ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "40%",
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={components}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={{ paddingLeft: 16, paddingRight: 16 }}>
              {item.component}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Coming Soon Content */}
    </SafeAreaView>
  );
}
