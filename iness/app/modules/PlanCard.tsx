import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";

import { setCurrentPlan } from "@/Slices/planSlice";
import theme from "../Theme/globalTheme";

interface PlanCardProps {
  item: any;
  index: any;
  planGroupLength: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PlanCard = ({ item, index, planGroupLength }: PlanCardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <View
      key={index}
      style={{
        marginRight: index === planGroupLength - 1 ? 0 : 12,
        width: 280,
        height: 209,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#736AD6",
      }}
    >
      {/* Background image if available */}
      {item.imgUrl ? (
        <ImageBackground
          source={{ uri: item.imgUrl }}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {/* Dark gradient overlay */}
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.2)"]}
            style={{ flex: 1, padding: 16, justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <Text
                style={{
                  fontWeight: theme.fontWeights.bold,
                  fontSize: theme.fontSizes.regular,
                  color: "#fff",
                  marginBottom: 6,
                  textShadowColor: "rgba(0,0,0,0.8)",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 4,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>

              <View>
                {item.descItems
                  ?.slice(0, 3)
                  .map((desc: string, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 5.5,
                          backgroundColor: "rgba(255,255,255,0.7)",
                          marginRight: 6,
                          marginTop: 2,
                        }}
                      />
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          flex: 1,
                          textShadowColor: "rgba(0,0,0,0.7)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 3,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {desc}
                      </Text>
                    </View>
                  ))}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "rgba(103,198,148,0.9)",
                  width: SCREEN_WIDTH * 0.3,
                  height: SCREEN_WIDTH * 0.08,
                  borderRadius: (SCREEN_WIDTH * 0.1) / 2,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 4,
                  shadowColor: "#000", // shadow color
                  shadowOffset: { width: 0, height: 3 }, // x/y offset
                  shadowOpacity: 0.3, // how opaque the shadow is
                  shadowRadius: 4, // blur radius
                  elevation: 5, // for Android shadow
                }}
                onPress={() => {
                  router.push("/dashboard/plandetails");
                  dispatch(setCurrentPlan(item));
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: theme.fontSizes.regularSmall,
                    textAlign: "center",
                    color: "#fff",
                    textShadowColor: "rgba(0,0,0,0.6)",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Check Details
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        // fallback if no image
        <View
          style={{
            flex: 1,
            backgroundColor: "#736AD6",
            padding: 16,
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontWeight: theme.fontWeights.bold,
              fontSize: theme.fontSizes.regular,
              color: "#fff",
              marginBottom: 6,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
        </View>
      )}
    </View>
  );
};

export default PlanCard;
