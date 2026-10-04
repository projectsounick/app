import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useGlobalTheme } from "../Theme/ThemeContext";
import { fetchJsonWithTimeout } from "@/utils/fetchJsonWithTimeout";
import { apiCache, CacheTTL } from "@/utils/apiCache";
import CachedRemoteImage from "@/src/Components/Home/CachedRemoteImage";
import { useDashboardActivity } from "@/src/Components/Home/DashboardActivityContext";

type Offer = {
  _id?: string;
  active?: boolean;
  imageUrl?: string;
  redirectUrl?: string;
};

const DEFAULT_OFFERS: Offer[] = [
  {
    _id: "default-offer-1",
    imageUrl:
      "https://inessstorage.blob.core.windows.net/admin-data/others/643e9206-5e6c-4b50-89f7-e4d7d8e765c1.png?sv=2025-01-05&se=2099-12-31T00%3A00%3A00Z&sr=c&sp=rwd&sig=ixZjMdwennTFd8LEDX4ykMsu5hD5wICywLCdYY3mZVA%3D",
    redirectUrl: "https://wa.link/hzf5gm",
    active: true,
  },
  {
    _id: "default-offer-2",
    imageUrl:
      "https://inessstorage.blob.core.windows.net/admin-data/others/6e920899-fd20-46c6-b671-4e27bc5a44d6.png?sv=2025-01-05&se=2099-12-31T00%3A00%3A00Z&sr=c&sp=rwd&sig=ixZjMdwennTFd8LEDX4ykMsu5hD5wICywLCdYY3mZVA%3D",
    redirectUrl: "https://wa.link/hzf5gm",
    active: true,
  },
  {
    _id: "default-offer-3",
    imageUrl:
      "https://inessstorage.blob.core.windows.net/admin-data/others/ChatGPT%20Image%20May%2018%2C%202026%2C%2010_12_14%20PM.png?sv=2025-01-05&se=2099-12-31T00%3A00%3A00Z&sr=c&sp=rwd&sig=ixZjMdwennTFd8LEDX4ykMsu5hD5wICywLCdYY3mZVA%3D",
    redirectUrl: "https://wa.link/hzf5gm",
    active: true,
  },
];

const ITEM_GAP = 10;
const AUTO_SCROLL_MS = 5000;

function OffersCards() {
  const theme = useGlobalTheme();
  const { width } = useWindowDimensions();
  const { isActive, reduceMotion } = useDashboardActivity();
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList<Offer>>(null);
  const currentIndexRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const horizontalInset = width >= 768 ? 24 : 10;
  const cardWidth = Math.min(Math.max(width - horizontalInset * 2 - 6, 220), 560);
  const cardHeight = Math.min(Math.max(cardWidth * 0.43, 140), 230);
  const itemLength = cardWidth + ITEM_GAP;

  useEffect(() => {
    let active = true;

    const fetchOffers = async () => {
      try {
        const data = await apiCache.get(
          "dashboard:offers",
          () =>
            fetchJsonWithTimeout<Offer[]>(
              "https://inessstorage.blob.core.windows.net/admin-data/Jsons/offers"
            ),
          {
            ttl: CacheTTL.THIRTY_MINUTES,
            staleWhileRevalidate: true,
            key: "dashboard-offers",
          }
        );
        if (active) {
          const validOffers = Array.isArray(data)
            ? data.filter((offer) => offer?.active && offer?.imageUrl)
            : [];
          if (validOffers.length > 0) {
            setOffers(validOffers);
          }
        }
      } catch (error) {
        if (__DEV__) console.error("Error fetching offers:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOffers();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isActive || reduceMotion || offers.length < 2) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % offers.length;
      currentIndexRef.current = nextIndex;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, AUTO_SCROLL_MS);

    return () => clearInterval(interval);
  }, [isActive, offers.length, reduceMotion]);

  useEffect(
    () => () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    },
    []
  );

  const contentStyle = useMemo(
    () => ({ paddingHorizontal: horizontalInset }),
    [horizontalInset]
  );

  const openRedirect = async (url?: string) => {
    if (!/^https?:\/\//i.test(url || "")) return;
    try {
      if (await Linking.canOpenURL(url!)) await Linking.openURL(url!);
    } catch (error) {
      if (__DEV__) console.error("Unable to open offer link:", error);
    }
  };

  if (!offers || !offers.length) return null;

  return (
    <View style={styles.container} accessibilityRole="summary">
      <FlatList
        ref={flatListRef}
        data={offers}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentStyle}
        snapToInterval={itemLength}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: itemLength,
          offset: itemLength * index,
          index,
        })}
        keyExtractor={(item, index) =>
          item._id || item.imageUrl || `offer-${index}`
        }
        onMomentumScrollEnd={(event) => {
          currentIndexRef.current = Math.max(
            0,
            Math.min(
              offers.length - 1,
              Math.round(event.nativeEvent.contentOffset.x / itemLength)
            )
          );
        }}
        onScrollToIndexFailed={({ index }) => {
          if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
          retryTimerRef.current = setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: index * itemLength,
              animated: false,
            });
          }, 100);
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
                marginRight: index === offers.length - 1 ? 0 : ITEM_GAP,
              },
            ]}
            onPress={() => openRedirect(item.redirectUrl)}
            disabled={!item.redirectUrl}
            accessibilityRole={item.redirectUrl ? "link" : "image"}
            accessibilityLabel="Promotional offer"
            accessibilityHint={
              item.redirectUrl ? "Opens offer details" : undefined
            }
          >
            <CachedRemoteImage
              uri={item.imageUrl}
              accessibilityLabel="Promotional offer image"
              recyclingKey={item._id || item.imageUrl}
              style={styles.image}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

class OfferErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    if (__DEV__) console.warn("OfferCard error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const MemoizedOffersCards = memo(OffersCards);

export default function SafeOffersCards() {
  return (
    <OfferErrorBoundary>
      <MemoizedOffersCards />
    </OfferErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
