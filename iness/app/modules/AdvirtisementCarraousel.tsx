import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import theme from "../Theme/globalTheme";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.7;
const CARD_MARGIN = 15;

const DATA = [
  {
    icon: "✅",
    title: "All minimum 4 years",
    subtitle: "experience trainers",
  },
  {
    icon: "💪",
    title: "500+ success",
    subtitle: "stories",
  },
  {
    icon: "👥",
    title: "24×7 active",
    subtitle: "community",
  },
  {
    icon: "🔥",
    title: "Personalized",
    subtitle: "plans for you",
  },
];

const StylishCarousel = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const indexRef = useRef(1);

  useEffect(() => {
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % DATA.length;
      scrollViewRef.current?.scrollTo({
        x: indexRef.current * (CARD_WIDTH + CARD_MARGIN),
        animated: true,
      });
    }, 3000);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: indexRef.current * (CARD_WIDTH + CARD_MARGIN),
        animated: true,
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient
      colors={["#140A21", "#522987"]}
      start={{ x: 0, y: 0 }}
      style={styles.gradient}
    >
      <View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="information"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontWeight: "bold",
              color: theme.colors.text,
              marginLeft: 4,
            }}
          >
            Why choose us
          </Text>
        </View>
        <Text
          style={{
            fontSize: theme.fontSizes.small,
            fontWeight: theme.fontWeights.regular,
            color: theme.colors.text,
            marginTop: 4,
            marginLeft: "7%",
          }}
        >
          Expert guidance, real results, and a supportive journey.
        </Text>
      </View>

      <ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CARD_MARGIN }}
        style={{ flexGrow: 0, marginTop: 10 }}
      >
        {DATA.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 16,
    paddingBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: theme.fontSizes.regular,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginRight: CARD_MARGIN,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
});

export default StylishCarousel;
