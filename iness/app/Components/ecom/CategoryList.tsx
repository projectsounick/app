import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // for the arrow icon
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import theme from "@/app/Theme/globalTheme";

interface Category {
  _id: string;
  name: string;
  image: string; // Assuming there's an image URL or local path
}

interface Props {
  categories: Category[];
}

const bgColors = [
  "#FFE600", // yellow
  "#00E0FF", // cyan
  "#C1FF72", // light green
  "#70EFFF", // sky
  "#FFA1F5", // pink
  "#FFD166", // orange
  "#9B89FF", // purple
  "#80FFDB", // mint
  "#FCFFA6", // light yellow
  "#9DFCFF", // powder blue
];

function CategoryGrid() {
  const renderItem = ({ item, index }: { item: Category; index: number }) => {
    const backgroundColor = bgColors[index % bgColors.length];

    return (
      <TouchableOpacity
        key={item._id}
        style={{
          width: 137,
          height: 137,
          borderRadius: 12,
          backgroundColor,
          padding: 12,
          margin: 8,
          justifyContent: "space-between",
        }}
      >
        {/* Image in top-right corner */}
        <View style={{ alignItems: "flex-end" }}>
          <Image
            source={{ uri: item.image }}
            style={{
              width: 95, // increased size
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
            marginTop: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#000",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            {item.name}
          </Text>
          <MaterialIcons name="chevron-right" size={18} color="#000" />
        </View>
      </TouchableOpacity>
    );
  };

  const categories: any = useSelector(
    (state: RootState) => state.ecom.categories
  );
  return (
    <View style={{ marginTop: 10 }}>
      {categories.length > 0 ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            {/* Left Line with Dot */}
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ color: "#000", fontSize: 22 }}>•</Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#999",
                  flex: 1,
                  marginRight: 4,
                }}
              />
            </View>

            {/* Center Title */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#222",
                marginHorizontal: 12,
              }}
            >
              Categories
            </Text>

            {/* Right Line with Dot */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  height: 1,
                  backgroundColor: "#999",
                  flex: 1,
                  marginLeft: 4,
                }}
              />
              <Text style={{ color: "#000", fontSize: 22 }}>•</Text>
            </View>
          </View>

          <FlatList
            data={categories}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 40 }}
            columnWrapperStyle={{
              justifyContent: "space-between",
            }}
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
