import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

const featureData = [
  {
    image: require("../../assets/images/featureCard1.jpg"),
  },
  {
    image: require("../../assets/images/featureCard2.jpg"),
  },
  {
    image: require("../../assets/images/featureCard3.png"),
  },
];

const FeatureCarousel = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(1); // Start from middle

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % featureData.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <ImageBackground
      source={require("../../assets/images/carrauselBackground.jpg")}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 18,
      }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#9C56F6",
          padding: 12,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          alignItems: "center",
          width: 196,
          marginBottom: 10,
          position: "relative",
        }}
      >
        <Icon
          name="clock"
          size={20}
          color="#fff"
          style={{ position: "absolute", left: 10, top: 10, opacity: 0.2 }}
        />
        <Icon
          name="target"
          size={20}
          color="#fff"
          style={{ position: "absolute", right: 10, top: 10, opacity: 0.2 }}
        />
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
          Coming Soon
        </Text>
        <Text style={{ color: "#e0e0e0", fontSize: 12, marginTop: 4 }}>
          Features
        </Text>
      </View>

      {/* Scrollable Cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: CARD_SPACING,
        }}
        scrollEventThrottle={16}
      >
        {featureData.map((item, index) => (
          <View
            key={index}
            style={{
              width: CARD_WIDTH,
              height: 180,
              marginRight: index === featureData.length - 1 ? 0 : 15,
              borderRadius: 16,
              overflow: "hidden",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <ImageBackground
              source={item.image}
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
              }}
              imageStyle={{
                borderRadius: 16,
                resizeMode: "contain",
              }}
            >
              {/* Highlight middle image */}
              {index === activeIndex && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    transform: [{ scale: 1.08 }],
                    zIndex: 1,
                  }}
                >
                  <ImageBackground
                    source={item.image}
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "center",
                    }}
                    imageStyle={{
                      borderRadius: 16,
                      resizeMode: "contain",
                    }}
                  />
                </View>
              )}
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

export default FeatureCarousel;
