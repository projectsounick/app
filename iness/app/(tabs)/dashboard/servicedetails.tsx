import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useLocalSearchParams } from "expo-router";

import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";
import { RootState } from "@/store";
import { ServiceDetails } from "@/app/interfaces/serviceInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "@/app/services/user.service";
import { cartService } from "@/app/services/cart.service";
import {
  convertToServiceCartItem,
  isServiceAddableToCart,
} from "@/utils/cartUtils";
import { addToCart } from "@/Slices/cartSlice";
import { setCurrentService } from "@/Slices/planSlice";
import ImageViewerModal from "@/app/modules/ImageModel";

export default function ServiceDetailsScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const dispatch = useDispatch();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const availableServices = useSelector(
    (state: RootState) => state.plan.availableServices
  );
  const storedService = useSelector(
    (state: RootState) => state.plan.currentService
  );

  const service: ServiceDetails | null = useMemo(() => {
    if (serviceId) {
      const match = availableServices.find(
        (item: ServiceDetails) => item._id === serviceId
      );
      if (match) return match;
    }
    if (storedService) return storedService;
    return availableServices && availableServices.length > 0
      ? (availableServices[0] as ServiceDetails)
      : null;
  }, [serviceId, availableServices, storedService]);

  useEffect(() => {
    if (service) {
      dispatch(setCurrentService(service));
    }
  }, [service, dispatch]);

  const [cartLoading, setCartLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      if (!service) {
        Alert.alert("Unavailable", "Service details are not available.");
        return;
      }

      setCartLoading(true);

      const userDataString =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userDataString.exists) {
        Alert.alert(
          "Login Required",
          "You need to log in to add a plan to the cart.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () => userService.logout(),
            },
          ]
        );
        return;
      }

      const alreadyExistsInCart = isServiceAddableToCart(
        cartItems,
        service._id
      );

      if (alreadyExistsInCart) {
        Alert.alert("Info", "This plan is already in your cart.");
        return;
      }

      const apiObject = {
        serviceId: service._id,
      };

      const cartDbResponse = await cartService.addCartItems(apiObject);

      if (!cartDbResponse.success) {
        throw new Error(cartDbResponse.message);
      }

      const updatedCartItem = convertToServiceCartItem(
        service,
        cartDbResponse.data
      );

      const finalItem = {
        ...updatedCartItem,
        _id: cartDbResponse.data._id,
      };

      dispatch(addToCart(finalItem));
      Alert.alert("Success", "Plan added to cart successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setCartLoading(false);
    }
  };

  const renderDescItems = (items?: string[]) => {
    if (!items || items.length === 0) return null;
    return items.map((item, idx) => (
      <View
        key={`${item}-${idx}`}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "#E8F5E9",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 1,
          }}
        >
          <Ionicons name="checkmark" size={14} color="#67C694" />
        </View>
        <Text
          style={{
            color: "#333",
            flex: 1,
            fontSize: 14,
            lineHeight: 22,
            fontWeight: "500",
          }}
        >
          {item}
        </Text>
      </View>
    ));
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["left", "right", "bottom"]}
    >
      <SmallHeader
        title="Service Details"
        showCart
        showBell
        showHistory={false}
      />
      <BackHeader />

      {service ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
            paddingTop: 12,
          }}
        >
          {/* Hero Card */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#F5F5F5",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              {service.imgUrl ? (
                <Image
                  source={{ uri: service.imgUrl }}
                  style={{
                    width: 110,
                    height: 110,
                    resizeMode: "contain",
                    borderRadius: 12,
                    marginRight: 16,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 12,
                    backgroundColor: "#F3EDFF",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={40}
                    color="#9747FF"
                  />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="fitness" size={18} color="#9747FF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    {service.title}
                  </Text>
                </View>
                {service.descItems?.length ? (
                  <Text
                    style={{
                      color: "#666",
                      fontSize: 13,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}
                  >
                    {service.descItems[0]}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
              gap: 12,
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                padding: 16,
                borderRadius: 16,
                flex: 1,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#F3EDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="calendar" size={20} color="#9747FF" />
              </View>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 20,
                  marginTop: 4,
                  color: "#9747FF",
                }}
              >
                {service.sessionCount}
              </Text>
              <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                Sessions
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                padding: 16,
                borderRadius: 16,
                flex: 1,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#E8F5E9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="pricetag" size={20} color="#67C694" />
              </View>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 20,
                  marginTop: 4,
                  color: "#67C694",
                }}
              >
                ₹{service.price}
              </Text>
              <Text style={{ color: "#666", fontSize: 12, marginTop: 2 }}>
                Price
              </Text>
            </View>
          </View>

          {/* What's included */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              borderWidth: 1,
              borderColor: "#F5F5F5",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#E8F5E9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#67C694" />
              </View>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  color: "#000",
                }}
              >
                What's Included
              </Text>
            </View>
            {renderDescItems(service.descItems)}
          </View>

          {/* Gallery */}
          {service.otherImages && service.otherImages.length > 0 ? (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                paddingVertical: 16,
                paddingHorizontal: 14,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                Gallery
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 14, paddingVertical: 4 }}
              >
                {service.otherImages.map((img, idx) => (
                  <TouchableOpacity
                    key={`${img}-${idx}`}
                    style={{
                      width: 170,
                      height: 140,
                      borderRadius: 14,
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1,
                      borderColor: "#EFEFEF",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                    onPress={() => {
                      setViewerImage(img);
                      setViewerVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: img }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
            Service details are not available right now.
          </Text>
        </View>
      )}

      {/* Bottom CTA */}
      {service ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderColor: "#E5E5E5",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={cartLoading}
            style={{
              backgroundColor: "#67C694",
              borderRadius: 20,
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 0,
              flexDirection: "row",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="cart" size={18} color="#ffffff" />
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "700",
                marginLeft: 8,
              }}
            >
              {cartLoading ? "Adding..." : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ImageViewerModal
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        imageUrl={viewerImage}
      />
    </SafeAreaView>
  );
}

