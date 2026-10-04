import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../../Theme/ThemeContext";

const { width } = Dimensions.get("window");

export default function HomeShimmer() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#ebebeb", "#c5c5c5", "#ebebeb"];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background, padding: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Section 1: Explore Plans */}
      <View style={{ marginBottom: 16 }}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient as any}
          shimmerColors={shimmerColors}
          style={{ width: 180, height: 20, borderRadius: 6, marginBottom: 6 }}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient as any}
          shimmerColors={shimmerColors}
          style={{ width: 240, height: 14, borderRadius: 6 }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          {[1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: width * 0.75,
                marginRight: 15,
                borderRadius: 15,
                backgroundColor: theme.colors.background,
                padding: 12,
              }}
            >
              {/* Title inside card */}
              <ShimmerPlaceholder
                LinearGradient={LinearGradient as any}
                shimmerColors={shimmerColors}
                style={{
                  width: "60%",
                  height: 18,
                  borderRadius: 5,
                  marginBottom: 8,
                }}
              />
              {/* Subtitle lines */}
              <ShimmerPlaceholder
                LinearGradient={LinearGradient as any}
                shimmerColors={shimmerColors}
                style={{
                  width: "85%",
                  height: 14,
                  borderRadius: 5,
                  marginBottom: 6,
                }}
              />
              <ShimmerPlaceholder
                LinearGradient={LinearGradient as any}
                shimmerColors={shimmerColors}
                style={{
                  width: "70%",
                  height: 14,
                  borderRadius: 5,
                  marginBottom: 12,
                }}
              />
              {/* CTA + Image */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient as any}
                  shimmerColors={shimmerColors}
                  style={{ width: 100, height: 35, borderRadius: 20 }}
                />
                <ShimmerPlaceholder
                  LinearGradient={LinearGradient as any}
                  shimmerColors={shimmerColors}
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Section 2: Book Services / Track Activity */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {[1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              marginHorizontal: 5,
              borderRadius: 15,
              backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
              padding: 12,
              height: 140,
            }}
          >
            <ShimmerPlaceholder
              LinearGradient={LinearGradient as any}
              shimmerColors={shimmerColors}
              style={{
                width: "65%",
                height: 18,
                borderRadius: 6,
                marginBottom: 10,
              }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient as any}
              shimmerColors={shimmerColors}
              style={{
                width: "90%",
                height: 14,
                borderRadius: 5,
                marginBottom: 12,
              }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient as any}
              shimmerColors={shimmerColors}
              style={{ width: "60%", height: 35, borderRadius: 20 }}
            />
          </View>
        ))}
      </View>

      {/* Section 3: Blogs */}
      <View style={{ marginBottom: 16 }}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient as any}
          shimmerColors={shimmerColors}
          style={{ width: 160, height: 20, borderRadius: 6, marginBottom: 6 }}
        />
        <ShimmerPlaceholder
          LinearGradient={LinearGradient as any}
          shimmerColors={shimmerColors}
          style={{ width: 240, height: 14, borderRadius: 6 }}
        />

        <View
          style={{
            marginTop: 12,
            width: "100%",
            borderRadius: 15,
            backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
            padding: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient as any}
              shimmerColors={shimmerColors}
              style={{
                width: "85%",
                height: 18,
                borderRadius: 6,
                marginBottom: 10,
              }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient as any}
              shimmerColors={shimmerColors}
              style={{
                width: "100%",
                height: 14,
                borderRadius: 5,
                marginBottom: 10,
              }}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient as any}
              shimmerColors={shimmerColors}
              style={{ width: "70%", height: 14, borderRadius: 5 }}
            />
          </View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient as any}
            shimmerColors={shimmerColors}
            style={{ width: 100, height: 100, borderRadius: 12 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

