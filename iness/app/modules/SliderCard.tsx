import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import { LinearGradient } from "expo-linear-gradient";
import { setCurrentService } from "@/Slices/planSlice";

export default function SliderCard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const availableServices = useSelector(
    (state: RootState) => state.plan.availableServices
  );
  return (
    <>
      <View style={{ marginBottom: 24 }}>
        {/* Header with icon on left, two text items vertically on right */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
        
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#9747FF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="briefcase-check"
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
                marginBottom: 2,
              }}
            >
              Our Services
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              Professional services tailored to your needs.
            </Text>
          </View>
        </View>
      </View>
      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent:
            availableServices.length === 1 ? "center" : "flex-start",
          paddingRight: 12,
        }}
      >
        {availableServices.map((item: any, index) => (
          <View
            key={index}
            style={{
              marginRight: index === availableServices.length - 1 ? 0 : 12,
              width: 280,
              height: 209,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#736AD6",
            }}
          >
            {/* Image Background */}
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
                        fontWeight: "700",
                        fontSize: 16,
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
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                      onPress={() => {
                    dispatch(setCurrentService(item));
                    router.push({
                      pathname: "/dashboard/servicedetails",
                      params: { serviceId: item._id },
                    });
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 13,
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
                    fontWeight: "700",
                    fontSize: 16,
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
        ))}
      </ScrollView>
    </>
  );
}
