import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

interface PlanCardProps {
  id?: string;
  title?: string;
  descItems?: string[];
  imgUrl?: string | null;
  isActive: boolean;
  type?: "plan" | "diet" | "manual";
  manualDescription?: string;
}

const CurrentPlanCard: React.FC<PlanCardProps> = ({
  id,
  title,
  descItems = [],
  imgUrl,
  isActive,
  type = "plan",
  manualDescription,
}) => {
  const router = useRouter();

  const gradientColors: any = isActive
    ? ["rgba(0,0,0,0.85)", "rgba(0,0,0,0.4)"]
    : ["rgba(0,0,0,0.9)", "rgba(0,0,0,0.6)"];

  const handlePress = () => {
    if (type === "manual") {
      router.push({ pathname: "/dashboard/activeManualPlan" });
      return;
    }

    if (isActive) {
      if (type === "plan") {
        router.push({
          pathname: "/dashboard/fullPlanDetails",
          params: { id, type },
        });
      } else {
        router.push({ pathname: "/dashboard/dietplan", params: { id } });
      }
    } else {
      router.push({ pathname: "/dashboard/completedplan", params: { id } });
    }
  };

  return (
    <View
      style={{
        borderRadius: 20,
        marginVertical: 12,
        height: type === "manual" ? 160 : 280,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
        flexDirection: "row",
      }}
    >
      {/* For manual, show static image on right. For normal, use background */}
      {type !== "manual" ? (
        <ImageBackground
          source={
            imgUrl
              ? { uri: imgUrl }
              : require("../../../assets/images/track.png")
          }
          style={{ flex: 1, justifyContent: "flex-end" }}
          resizeMode="cover"
          imageStyle={{ borderRadius: 20 }}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 20,
              justifyContent: "center",
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: 18,
                marginBottom: 12,
                color: "#fff",
                fontWeight: "700",
                textShadowColor: "rgba(0,0,0,0.95)",
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 4,
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title || "Untitled Plan"}
            </Text>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              {descItems.length > 0 ? (
                descItems.slice(0, 3).map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        marginRight: 8,
                      }}
                    />
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        flexShrink: 1,
                        fontWeight: "500",
                        lineHeight: 18,
                        textShadowColor: "rgba(0,0,0,0.8)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                ))
              ) : (
                <Text
                  style={{
                    fontSize: 14,
                    color: "#eee",
                    lineHeight: 18,
                    fontWeight: "400",
                  }}
                >
                  No description available.
                </Text>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#67C694",
                height: 42,
                width: 130,
                borderRadius: 21,
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "flex-start",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={handlePress}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {isActive ? "Continue" : "Check"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={["#9C56F6", "#3A1B63"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            flex: 1,
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 6,
                color: "white",
                textShadowColor: "rgba(0,0,0,0.9)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              numberOfLines={1}
            >
              {title || "Custom Plan"}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "white",
                textShadowColor: "rgba(0,0,0,0.7)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {manualDescription || "No description"}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#67C694",
                paddingVertical: 6,
                paddingHorizontal: 20,
                borderRadius: 30,
                alignSelf: "flex-start",
                marginTop: 10,
                shadowColor: "#000", // shadow color
                shadowOffset: { width: 0, height: 3 }, // x/y offset
                shadowOpacity: 0.3, // how opaque the shadow is
                shadowRadius: 4, // blur radius
                elevation: 5, // for Android shadow
              }}
              onPress={handlePress}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Continue</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../../assets/images/track.png")}
            style={{
              width: 90,
              height: 110,
              resizeMode: "cover",
              marginLeft: 8,
              borderRadius: 8,
            }}
          />
        </LinearGradient>
      )}
    </View>
  );
};

export default CurrentPlanCard;
