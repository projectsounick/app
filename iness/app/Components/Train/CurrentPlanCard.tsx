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
  type?: "plan" | "diet" | "manual" | "service";
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

  const handlePress = () => {
    if (type === "manual") {
      router.push({ pathname: "/dashboard/activeManualPlan" });
      return;
    }

    if (isActive) {
      if (type === "plan" || type === "service") {
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={{
        borderRadius: 16,
        marginVertical: 8,
        overflow: "hidden",
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      {/* For manual, show static image on right. For normal, use background */}
      {type !== "manual" ? (
        <View style={{ flexDirection: "row" }}>
          {/* Image Section */}
          <ImageBackground
            source={
              imgUrl
                ? { uri: imgUrl }
                : require("../../../assets/images/track.png")
            }
            style={{
              width: 140,
              height: 200,
            }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.1)"]}
              style={{
                flex: 1,
              }}
            />
          </ImageBackground>

          {/* Content Section */}
          <View
            style={{
              flex: 1,
              padding: 16,
              justifyContent: "space-between",
            }}
          >
            <View>
              {/* Title */}
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  color: "#1A1A1A",
                  fontWeight: "700",
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {title || "Untitled Plan"}
              </Text>

              {/* Description */}
              <View>
                {descItems.length > 0 ? (
                  descItems.slice(0, 3).map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#9747FF",
                          marginRight: 8,
                          marginTop: 5,
                        }}
                      />
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: 12,
                          color: "#666",
                          flex: 1,
                          fontWeight: "400",
                          lineHeight: 16,
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#999",
                      lineHeight: 16,
                      fontWeight: "400",
                    }}
                  >
                    No description available.
                  </Text>
                )}
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#67C694",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 30,
                alignSelf: "flex-start",
                shadowColor: "#67C694",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handlePress}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 13,
                }}
              >
                {isActive ? "Continue" : "Check"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            padding: 16,
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 6,
                color: "#1A1A1A",
              }}
              numberOfLines={1}
            >
              {title || "Custom Plan"}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: "#666",
                lineHeight: 18,
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {manualDescription || "No description"}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#67C694",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 30,
                alignSelf: "flex-start",
                marginTop: 10,
                shadowColor: "#67C694",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              onPress={handlePress}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../../assets/images/track.png")}
            style={{
              width: 90,
              height: 110,
              resizeMode: "cover",
              marginLeft: 12,
              borderRadius: 12,
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CurrentPlanCard;
