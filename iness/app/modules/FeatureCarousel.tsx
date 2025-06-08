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

const featureData = [
  {
    image: require("../../assets/images/featureCard1.jpg"), // Path to the image
  },
  {
    image: require("../../assets/images/featureCard2.jpg"), // Path to the image
  },
  {
    image: require("../../assets/images/featureCard3.png"), // Path to the image
  },
];

const FeatureCarousel = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(1); // Start with the middle card active

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % featureData.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * width * 0.8,
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
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
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
        pagingEnabled
        snapToInterval={width * 0.8} // Ensure scroll is based on image size
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: 10,
          marginTop: 10,
          alignItems: "center",
        }}
      >
        {featureData.map((item, index) => (
          <View
            key={index}
            style={{
              width: width * 0.8,
              height: 180,
              marginRight: 15,
              borderRadius: 16,
              justifyContent: "center",
              padding: 16,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* First Background Image */}
            <ImageBackground
              source={item.image} // Dynamic image for the background
              style={{
                position: "absolute",
                width: width * 0.8, // Full width
                height: "100%", // Full height
                borderRadius: 16,
                justifyContent: "center",
                overflow: "hidden",
                left: 0, // Align first background image to the left
              }}
              imageStyle={{
                borderRadius: 16,
                resizeMode: "contain", // Ensure full content is visible and not cropped
              }}
            />

            {/* Second Background Image */}
            <ImageBackground
              source={item.image} // Dynamic image for the background
              style={{
                position: "absolute",
                width: width * 0.8, // Full width
                height: "100%", // Full height
                borderRadius: 16,
                justifyContent: "center",
                overflow: "hidden",
                right: 0, // Align second background image to the right
              }}
              imageStyle={{
                borderRadius: 16,
                resizeMode: "contain", // Ensure full content is visible and not cropped
              }}
            />

            {/* Middle Image (On top of background images) */}
            {index === activeIndex && (
              <ImageBackground
                source={item.image} // Dynamic image for the middle image
                style={{
                  position: "absolute",
                  width: width * 0.8, // Full width of the container
                  height: "100%", // Full height of the container
                  borderRadius: 16,
                  justifyContent: "center",
                  overflow: "hidden",
                  top: 0, // Align it to the top
                  zIndex: 1, // Ensure it floats on top of the background images
                  transform: [{ scale: 1.1 }], // Slightly enlarge the middle image
                }}
                imageStyle={{
                  borderRadius: 16,
                  resizeMode: "contain", // Ensure full content is visible and not cropped
                }}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

export default FeatureCarousel;
