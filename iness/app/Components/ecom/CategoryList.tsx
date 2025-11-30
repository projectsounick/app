import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // for the arrow icon
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

interface Category {
  _id: string;
  name: string;
  image: string; // Assuming there's an image URL or local path
}

interface Props {
  categories: Category[];
}

// Removed colorful backgrounds - using white cards with theme accents

function CategoryGrid() {
  const navigation = useNavigation();
  const router = useRouter();
  const renderItem = ({ item, index }: { item: Category; index: number }) => {
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.8}
        style={{
          width: (Dimensions.get("window").width - 48) / 2,
          height: 160,
          borderRadius: 20,
          backgroundColor: "#FFFFFF",
          padding: 16,
          marginBottom: 16,
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 5,
          borderWidth: 1,
          borderColor: "#F5F5F5",
        }}
        onPress={() =>
          router.push(
            `/dashboard/productList?category=${encodeURIComponent(item.name)}&color=#FFFFFF&categoryId=${encodeURIComponent(item._id)}`
          )
        }
      >
        {/* Image Container with Background */}
        <View 
          style={{ 
            alignItems: "center", 
            justifyContent: "center",
            height: 90,
            marginBottom: 8,
            backgroundColor: "#F8F8F8",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{
              width: 80,
              height: 80,
              resizeMode: "contain",
            }}
          />
        </View>

        {/* Bottom row: text + arrow */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#000",
              flex: 1,
              marginRight: 8,
            }}
          >
            {item.name}
          </Text>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: "#9747FF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="chevron-right" size={16} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const categories: any = useSelector(
    (state: RootState) => state.ecom.categories
  );
  return (
    <View style={{ marginTop: 24, marginBottom: 8 }}>
      {categories.length > 0 ? (
        <>
          {/* Header Section */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#000",
                letterSpacing: -0.5,
              }}
            >
              Shop by Category
            </Text>
            <View
              style={{
                width: 40,
                height: 3,
                backgroundColor: "#9747FF",
                borderRadius: 2,
              }}
            />
          </View>

          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 40 }}
            columnWrapperStyle={{
              justifyContent: "space-between",
              paddingHorizontal: 4,
            }}
            scrollEnabled={false}
          />
        </>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              height: "80%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            ></View>
            <Image
              source={require("../../../assets/images/placholderEquip.png")}
              style={{
                width: 250,
                height: 250,
                resizeMode: "contain",
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default memo(CategoryGrid);
