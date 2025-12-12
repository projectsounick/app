import { CartItem } from "@/app/interfaces/cartInterface";
import CustomSnackbar from "@/app/modules/Snackbar";
import { cartService } from "@/app/services/cart.service";
import useServiceWithSnackbar from "@/hooks/usePostDataHook";
import {
  removeFromCart,
  deleteCartItem,
  updateCartItemQuantity,
} from "@/Slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch } from "react-redux";
import CouponModal from "./CouponModal";
import { DiscountCoupon } from "@/app/interfaces/otherInterfaces";

const { width: screenWidth } = Dimensions.get("window");

interface Props {
  items: CartItem[];
  couponDetails: DiscountCoupon | null;
  setCouponDetails: any;
}

///// Main funcitonal component for the CartItemList ----------------------------------/
export default function CartItemList({
  items,
  couponDetails,
  setCouponDetails,
}: Props) {
  const {
    loading,
    data,
    setLoading,
    callService,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
  } = useServiceWithSnackbar(cartService.updateCartItems);
  const [simmerLodaing, setSimmerLoading] = useState(false);

  const dispatch = useDispatch();
  const [couponVisible, setCouponVisible] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  function onAddItem() {
    setCouponVisible(true);
  }
  async function updateCart(cartItemId: any, action: string) {
    setLoading(true);
    let data = {
      cartItemId: cartItemId,
      action: action,
    };
    const response = await callService(data);

    if (response && response.success) {
      dispatch(updateCartItemQuantity(data));
    }

    //// need to update the store data based on response---/
  }
  /// Funciton for removing from the cart ------------------/
  const removeCartItem = (
    cartItemId: string | undefined,
    id: string | undefined
  ) => {
    try {
      if (id) {
        setSimmerLoading(true);
        /// making the api call to remove
        dispatch(removeFromCart(id));
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    } finally {
      setSimmerLoading(false);
    }
  };

  //// Function for deleting the cart items --------------------/
  async function deleteItem(_id: string | undefined) {
    try {
      if (_id) {
        setSimmerLoading(true);

        /// making the api call to remove from cart----/
        const response = await cartService.deleteCartItems(_id);

        if (!response.success) {
          throw new Error(response.message);
        }
        dispatch(deleteCartItem(_id));
      }
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
    } finally {
      setSimmerLoading(false);
    }
  }
  async function applyDiscountCode(couponCode: string) {
    try {
      setCouponVisible(false);
      const response = await cartService.applyDiscountCoupon(couponCode);
      if (response.success) {
        setCouponDetails(response.data);
      } else {
        setSnackbarVisible(true);
        setSnackbarMessage(response.message);
      }
    } catch (error) {}
  }
  // Responsive spacing based on screen width
  const isLargeScreen = screenWidth > 600;
  const containerPadding = isLargeScreen ? 24 : 20;
  const itemPadding = isLargeScreen ? 14 : 12;
  const itemMarginBottom = isLargeScreen ? 16 : 14;
  const imageSize = isLargeScreen ? 90 : 75;
  const spacing = isLargeScreen ? 14 : 12;

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: containerPadding,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isLargeScreen ? 24 : 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "#F3EDFF",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Ionicons name="bag-outline" size={18} color="#9747FF" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#1A1A1A",
            }}
          >
            Your Items
          </Text>
        </View>
        <View
          style={{
            width: 30,
            height: 3,
            backgroundColor: "#9747FF",
            borderRadius: 2,
          }}
        />
      </View>

      {simmerLodaing || loading ? (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 40,
          }}
        >
          <ActivityIndicator color="#67C694" />
        </View>
      ) : (
        <>
          {items.length === 0 ? (
            <View
              style={{
                paddingVertical: 40,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#666",
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                There is nothing available in the cart.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: isLargeScreen ? 600 : 500 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {items.map((item: CartItem) => {
                return (
                  <View
                    key={item.productId}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: itemMarginBottom,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: itemPadding,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                      overflow: "visible",
                    }}
                  >
                    {/* Image */}
                    <View
                      style={{
                        width: imageSize,
                        height: imageSize,
                        borderRadius: 10,
                        marginRight: spacing,
                      backgroundColor: "#FFFFFF",
                      overflow: "hidden",
                      alignItems: "center",
                      justifyContent: "center",
                      }}
                    >
                      <Image
                        source={{ uri: item.imgUrl }}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      resizeMode="contain"
                      />
                    </View>

                    {/* Right Section */}
                    <View style={{ flex: 1, justifyContent: "space-between", minHeight: imageSize, overflow: "visible" }}>
                      {/* Top row: Name + Delete icon */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: isLargeScreen ? 10 : 8,
                        }}
                      >
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={{
                            fontSize: isLargeScreen ? 14 : 13,
                            fontWeight: "600",
                            color: "#000",
                            flex: 1,
                            marginRight: 8,
                            lineHeight: isLargeScreen ? 20 : 18,
                          }}
                        >
                          {item.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => deleteItem(item._id)}
                          style={{
                            padding: 4,
                            flexShrink: 0,
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Bottom row: quantity + price */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          marginTop: "auto",
                        }}
                      >
                        {loading ? (
                          <View>
                            <ActivityIndicator color="#67C694" size="small" />
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#F8F8F8",
                              borderRadius: 10,
                              height: isLargeScreen ? 30 : 28,
                              borderWidth: 1,
                              borderColor: "#E0E0E0",
                              flexShrink: 1,
                              paddingHorizontal: 0,
                            }}
                          >
                            <TouchableOpacity
                              disabled={
                                item.product && item.quantity >= 2
                                  ? false
                                  : true
                              }
                              onPress={() => updateCart(item._id, "decrement")}
                              style={{
                                width: isLargeScreen ? 28 : 26,
                                height: isLargeScreen ? 30 : 28,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Text
                                style={{
                                  fontSize: isLargeScreen ? 16 : 14,
                                  color:
                                    item.product && item.quantity >= 2
                                      ? "#9747FF"
                                      : "#CCC",
                                  fontWeight: "600",
                                  includeFontPadding: false,
                                  textAlignVertical: "center",
                                }}
                              >
                                −
                              </Text>
                            </TouchableOpacity>

                            <View
                              style={{
                                minWidth: isLargeScreen ? 32 : 28,
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: isLargeScreen ? 6 : 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: isLargeScreen ? 14 : 13,
                                  color: "#000",
                                  fontWeight: "600",
                                  includeFontPadding: false,
                                  textAlign: "center",
                                  textAlignVertical: "center",
                                }}
                              >
                                {item.quantity}
                              </Text>
                            </View>

                            <TouchableOpacity
                              disabled={
                                item.product && item.quantity >= 1
                                  ? false
                                  : true
                              }
                              onPress={() => updateCart(item._id, "increment")}
                              style={{
                                width: isLargeScreen ? 28 : 26,
                                height: isLargeScreen ? 30 : 28,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                            >
                              <Text
                                style={{
                                  fontSize: isLargeScreen ? 16 : 14,
                                  color:
                                    item.product && item.quantity >= 1
                                      ? "#9747FF"
                                      : "#CCC",
                                  fontWeight: "600",
                                  includeFontPadding: false,
                                  textAlignVertical: "center",
                                }}
                              >
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {/* Price */}
                        <Text
                          style={{
                            fontSize: isLargeScreen ? 16 : 15,
                            fontWeight: "700",
                            color: "#000",
                            marginLeft: isLargeScreen ? 12 : 10,
                            flexShrink: 0,
                          }}
                        >
                          ₹{(item?.price ?? 0) * (item?.quantity ?? 1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </>
      )}
      {/* Empty State or Items */}

      {/* Footer */}
      {couponDetails ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            padding: 16,
            backgroundColor: "#E8F5E9",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#C8E6C9",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#67C694",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
            </View>
            <View>
              <Text
                style={{
                  color: "#1A1A1A",
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 2,
                }}
              >
                Coupon Applied
              </Text>
              <Text
                style={{
                  color: "#2E7D32",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                - ₹{couponDetails.discountPrice} OFF
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setCouponDetails(null)}
            style={{
              padding: 6,
            }}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            padding: 16,
            backgroundColor: "#fff",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#F5F5F5",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="pricetag-outline" size={18} color="#9747FF" style={{ marginRight: 8 }} />
            <Text
              style={{
                color: "#1A1A1A",
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Have a coupon?
            </Text>
          </View>
          <TouchableOpacity
            onPress={onAddItem}
            style={{
              backgroundColor: "#67C694",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              shadowColor: "#67C694",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 13,
              }}
            >
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        bgColor="#67C694"
        onDismiss={() => setSnackbarVisible(false)}
      />
      {couponVisible ? (
        <CouponModal
          visible={couponVisible}
          onClose={() => setCouponVisible(false)}
          onApply={applyDiscountCode}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
        />
      ) : null}
      {/* Coupon Modal */}
    </View>
  );
}
