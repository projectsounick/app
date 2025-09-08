import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
const { width } = Dimensions.get("window");
const CARD_WIDTH = 295; // main card width
const SPACING = 15; // gap between cards

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // fetch data with artificial delay
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // simulate fetch with delay
        const res = await fetch(
          "https://inessstorage.blob.core.windows.net/admin-data/Jsons/testimonial"
        );
        const data = await res.json();
        if (data) {
          setData([...data]); // repeat for carousel feel
        } else {
          setData([]); // repeat for carousel feel
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // open review modal
  const openReview = (item: any) => {
    setSelectedCard(item);
  };

  const renderShimmerCard = () => (
    <View
      style={{
        width: CARD_WIDTH,
        marginRight: SPACING,
        backgroundColor: "#fff",
        borderRadius: 15,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        height: 250,
        padding: 10,
      }}
    >
      <ShimmerPlaceholder
        LinearGradient={LinearGradient as any}
        shimmerColors={["#ebebeb", "#c5c5c5", "#ebebeb"]}
        style={{ width: "100%", height: 180, borderRadius: 10 }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {loading ? (
        <FlatList
          data={Array.from({ length: 5 })}
          keyExtractor={(_, index) => "shimmer-" + index}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2,
          }}
          renderItem={renderShimmerCard}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item, index) => item.id + index}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2, // keep center
          }}
          initialScrollIndex={1} // start from 2nd card
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + SPACING,
            offset: (CARD_WIDTH + SPACING) * index,
            index,
          })}
          renderItem={({ item }) => (
            <View
              style={{
                width: CARD_WIDTH,
                marginRight: SPACING,
                backgroundColor: "#fff",
                borderRadius: 15,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                height: 260,
              }}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 305, height: 180 }}
                resizeMode="cover"
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 10,
                  paddingTop: 10,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {item.reviewerName}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 10,
                  paddingTop: 4,
                  paddingBottom: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <AntDesign
                      key={i}
                      name={i < item.rating ? "star" : "staro"}
                      size={20}
                      color="#FFD700"
                      style={{ marginRight: 2 }}
                    />
                  ))}
                  <TouchableOpacity
                    style={{ marginLeft: 10 }}
                    onPress={() => openReview(item)}
                  >
                    <Ionicons
                      name="chevron-forward-circle-outline"
                      size={24}
                      color="#555"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Review Modal */}
      <Modal visible={!!selectedCard} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              height: "50%",
            }}
          >
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 2 }}
              onPress={() => setSelectedCard(null)}
            >
              <AntDesign name="closecircle" size={26} color="black" />
            </TouchableOpacity>

            {selectedCard && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedCard.imageUrl }}
                  style={{
                    width: "100%",
                    height: 240,
                    borderRadius: 10,
                    marginBottom: 15,
                  }}
                  resizeMode="cover"
                />
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  {selectedCard.reviewerName}
                </Text>
                <View style={{ flexDirection: "row", marginVertical: 10 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <AntDesign
                      key={i}
                      name={i < selectedCard.rating ? "star" : "staro"}
                      size={22}
                      color="#FFD700"
                      style={{ marginRight: 3 }}
                    />
                  ))}
                </View>
                <Text style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
                  {selectedCard.review ?? ""}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
