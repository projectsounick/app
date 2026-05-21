import React, { memo, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useGlobalTheme } from "../Theme/ThemeContext";

const { width: screenWidth } = Dimensions.get("window");

const OffersCards = () => {
  const theme = useGlobalTheme();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef: any = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(
          "https://inessstorage.blob.core.windows.net/admin-data/Jsons/offers"
        );
        const data = await res.json();
        if (data && Array.isArray(data)) {
          setOffers(data.filter((offer) => offer.active));
        } else {
          setOffers([]);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    if (!offers.length) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % offers.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, offers]);

  const openRedirect = (url: string) => {
    if (url) Linking.openURL(url).catch((err) => console.error(err));
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!offers.length) return null;

  return (
    <View style={{ flex: 1, marginBottom: 12 }}>
      <FlatList
        ref={flatListRef}
        data={offers}
        keyExtractor={(_, index) => "offer-" + index}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              width: screenWidth * 0.9,
              height: 172,
              marginRight: index === offers.length - 1 ? 0 : 10,
            }}
            onPress={() => openRedirect(item.redirectUrl)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
                borderRadius: 10,
              }}
            />
          </TouchableOpacity>
        )}
        scrollEnabled={false} // auto-scroll only
      />
    </View>
  );
};

export default OffersCards;
