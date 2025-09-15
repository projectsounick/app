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
const CARD_WIDTH = 276;
const CARD_HEIGHT = 260;
const IMAGE_HEIGHT = 170; // 16:9 ratio
const SPACING = 12;
const CENTER_SCALE = 1;
const SIDE_SCALE = 0.92;
const CENTER_LIFT = -20;

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://inessstorage.blob.core.windows.net/admin-data/Jsons/testimonial?t=${Date.now()}`
        );
        const json = await res.json();
        setData(json || []);

        if (json && json.length > 0) {
          const middleIndex = Math.floor(json.length / 2);
          setCurrentIndex(middleIndex);
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: middleIndex,
              animated: false,
              viewPosition: 0.5, // center card
            });
          }, 50);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openReview = (item: any) => setSelectedCard(item);

  const renderShimmerCard = (_: any, index: number) => (
    <View
      key={"shimmer-" + index}
      style={{
        width: CARD_WIDTH,
        marginRight: SPACING,
        borderRadius: 20,
        backgroundColor: "#fff",
        overflow: "hidden",
        height: CARD_HEIGHT,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
      }}
    >
      <ShimmerPlaceholder
        LinearGradient={LinearGradient as any}
        shimmerColors={["#ebebeb", "#c5c5c5", "#ebebeb"]}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );

  const renderCard = (item: any, index: number) => {
    const isCenter = index === currentIndex;

    return (
      <TouchableOpacity
        key={item.id?.toString() || index.toString()}
        activeOpacity={0.9}
        onPress={() => openReview(item)}
        style={{
          width: CARD_WIDTH,
          marginRight: SPACING,
          borderRadius: 25,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: isCenter ? 0.25 : 0.12,
          shadowRadius: isCenter ? 14 : 6,
          shadowOffset: { width: 0, height: isCenter ? 8 : 3 },
          elevation: isCenter ? 8 : 4,
          overflow: "hidden",
          transform: [
            { scale: isCenter ? CENTER_SCALE : SIDE_SCALE },
            { translateY: isCenter ? CENTER_LIFT : 0 },
          ],
        }}
      >
        {/* Image */}
        <View
          style={{
            width: "100%",
            height: IMAGE_HEIGHT,
            overflow: "hidden",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.45)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
            }}
          />
        </View>

        {/* Info */}
        <View style={{ padding: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#222" }}>
            {item.reviewerName}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 8,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <AntDesign
                  key={i}
                  name={i < item.rating ? "star" : "staro"}
                  size={18}
                  color="#FFD700"
                  style={{ marginRight: 3 }}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={() => openReview(item)}
              style={{
                padding: 6,
                borderRadius: 12,
                backgroundColor: "#e0f7fa",
              }}
            >
              <Ionicons name="chevron-forward" size={20} color="#00796B" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", paddingTop: 20 }}>
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
          renderItem={({ item, index }) => renderShimmerCard(item, index)}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + SPACING}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + SPACING,
            offset: (CARD_WIDTH + SPACING) * index,
            index,
          })}
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2,
            paddingBottom: 40,
          }}
          onMomentumScrollEnd={(ev) => {
            const index = Math.round(
              ev.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
            );
            setCurrentIndex(index);
          }}
          renderItem={({ item, index }) => renderCard(item, index)}
        />
      )}

      {/* Modal */}
      <Modal visible={!!selectedCard} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
              padding: 20,
              maxHeight: "75%",
            }}
          >
            <View
              style={{
                width: 50,
                height: 5,
                backgroundColor: "#ccc",
                borderRadius: 3,
                alignSelf: "center",
                marginBottom: 15,
              }}
            />

            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 10 }}
              onPress={() => setSelectedCard(null)}
            >
              <AntDesign name="closecircle" size={26} color="#333" />
            </TouchableOpacity>

            {selectedCard && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedCard.imageUrl }}
                  style={{
                    width: "100%",
                    height: 250,
                    borderRadius: 18,
                    marginBottom: 15,
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{ fontSize: 22, fontWeight: "700", color: "#333" }}
                >
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
                <Text style={{ fontSize: 16, color: "#555", lineHeight: 22 }}>
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
