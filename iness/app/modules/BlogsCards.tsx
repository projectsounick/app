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
          backgroundColor: "#fff",
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
              fontSize: 16,
              fontWeight: "600",
              color: "#19002E",
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#522987",
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Read</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#19002E",
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
