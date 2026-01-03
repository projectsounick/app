import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
} from "react-native";
import { useSelector } from "react-redux";
import { Blog } from "../interfaces/blogInterface";
import { RootState } from "@/store";
import theme from "../Theme/globalTheme";

const { width } = Dimensions.get("window");

const BlogCarousel = () => {
  const blogs = useSelector((state: RootState) => state.blog.blogs);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderItem = ({ item }: { item: Blog }) => {
    return (
      <View
        style={{
          width: width * 0.8,
          marginHorizontal: width * 0.1,
          backgroundColor: theme.colors.background,
          borderRadius: 16,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: item.coverImage }}
          style={{
            width: "100%",
            height: 180,
          }}
          resizeMode="cover"
        />
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontWeight: theme.fontWeights.medium as "500",
              color: theme.colors.text,
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.secondPrimary,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.textWhite, fontWeight: theme.fontWeights.medium as "500" }}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: theme.fontSizes.large,
          fontWeight: theme.fontWeights.bold as "700",
          color: theme.colors.text,
          marginLeft: 20,
          marginBottom: 10,
        }}
      >
        Blogs
      </Text>

      <Animated.FlatList
        data={blogs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width * 0.9} // snap effect
        decelerationRate="fast"
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
};

export default BlogCarousel;
