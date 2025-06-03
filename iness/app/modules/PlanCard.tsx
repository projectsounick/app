import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { setCurrentPlan } from "@/Slices/planSlice";
import theme from "../Theme/globalTheme";
interface PlanCardProps {
  item: any;
  index: number;
  planGroupLength: number;
}

const PlanCard: React.FC<PlanCardProps> = ({
  item,
  index,
  planGroupLength,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <View
      key={index}
      style={{
        marginRight: index === planGroupLength - 1 ? 0 : 12,
        width: 310,
        height: 180,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={["#9C56F6", "#3A1B63"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <Text
            style={{
              fontWeight: theme.fontWeights.bold,
              fontSize: theme.fontSizes.regular,
              color: theme.colors.text,
              marginBottom: 6,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>

          <View>
            {item.descItems?.slice(0, 3).map((desc: string, idx: number) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 2,
                }}
              >
                <Text
                  style={{ color: "rgba(229, 210, 255, 1)", marginRight: 4 }}
                >
                  •
                </Text>
                <Text style={{ color: "#fff", fontSize: 12, flex: 1 }}>
                  {desc}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#B4F455",
              width: 114,
              height: 31,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
            }}
            onPress={() => {
              dispatch(setCurrentPlan(item));
              router.push("/dashboard/plandetails");
            }}
          >
            <Text
              style={{
                fontWeight: theme.fontWeights.bold,
                fontSize: theme.fontSizes.regularSmall,
                textAlign: "center",
                color: theme.colors.dark,
              }}
            >
              Know More
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

export default PlanCard;
