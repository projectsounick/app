import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";

import { setCurrentPlan } from "@/Slices/planSlice";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

interface PlanCardProps {
  item: any;
  index: any;
  planGroupLength: number;
}

const PlanCard = ({ item, index, planGroupLength }: PlanCardProps) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();

  const handlePress = () => {
    router.push("/dashboard/plandetails");
    dispatch(setCurrentPlan(item));
  };

  return (
    <View
      key={index}
      style={{
        marginRight: index === planGroupLength - 1 ? 0 : 12,
        width: 340,
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...(isDark ? {} : {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }),
      }}
    >
      {/* Image and Content Layout */}
      {item.imgUrl ? (
        <View style={{ flexDirection: "row", flex: 1 }}>
          {/* Image Section */}
          <View
            style={{
              width: 140,
              height: 200,
              backgroundColor: theme.colors.backgroundFaded,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ImageBackground
              source={{ uri: item.imgUrl }}
              style={{
                width: "100%",
                height: "100%",
              }}
              resizeMode="contain"
              imageStyle={{
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
              }}
            >
              <LinearGradient
                colors={["rgba(0,0,0,0.05)", "transparent"]}
                style={{
                  flex: 1,
                }}
              />
            </ImageBackground>
          </View>

          {/* Content Section */}
          <View
            style={{
              flex: 1,
              padding: 14,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexShrink: 1 }}>
              {/* Title */}
              <Text
                style={{
                  fontWeight: theme.fontWeights.bold as "700",
                  fontSize: theme.fontSizes.regular,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>

              {/* Description Items - Max 2 */}
              <View>
                {item.descItems?.slice(0, 2).map((desc: string, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: theme.colors.secondPrimary,
                        marginRight: 6,
                        marginTop: 5,
                      }}
                    />
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontSize: theme.fontSizes.small,
                        flex: 1,
                        lineHeight: 15,
                        fontWeight: "400" as "400",
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {desc}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.success,
                paddingVertical: 9,
                paddingHorizontal: 18,
                borderRadius: 30,
                alignSelf: "flex-start",
                marginTop: 8,
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 6,
              }}
              onPress={handlePress}
            >
              <Text
                style={{
                  fontWeight: theme.fontWeights.bold as "700",
                  fontSize: theme.fontSizes.small,
                  color: theme.colors.textWhite,
                }}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Fallback if no image
        <View
          style={{
            flex: 1,
            padding: 14,
            justifyContent: "space-between",
            backgroundColor: theme.colors.backgroundSecondary,
            height: 200,
          }}
        >
          <View style={{ flexShrink: 1 }}>
              <Text
                style={{
                  fontWeight: theme.fontWeights.bold as "700",
                  fontSize: theme.fontSizes.regular,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.title}
              </Text>

            {item.descItems?.length > 0 && (
              <View>
                {item.descItems.slice(0, 2).map((desc: string, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: theme.colors.secondPrimary,
                        marginRight: 6,
                        marginTop: 5,
                      }}
                    />
                    <Text
                      style={{
                        color: theme.colors.textSecondary,
                        fontSize: theme.fontSizes.small,
                        flex: 1,
                        lineHeight: 15,
                        fontWeight: theme.fontWeights.regular as "400",
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {desc}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.success,
              paddingVertical: 9,
              paddingHorizontal: 18,
              borderRadius: 30,
              alignSelf: "flex-start",
              marginTop: 8,
              ...(isDark ? {} : {
                shadowColor: theme.colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 6,
              }),
            }}
            onPress={handlePress}
          >
            <Text
              style={{
                fontWeight: theme.fontWeights.bold as "700",
                fontSize: theme.fontSizes.small,
                color: theme.colors.textWhite,
              }}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PlanCard;
