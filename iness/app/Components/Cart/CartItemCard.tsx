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
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useDispatch } from "react-redux";
import CouponModal from "./CouponModal";
import { DiscountCoupon } from "@/app/interfaces/otherInterfaces";

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
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        padding: 20,
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
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#000",
          }}
        >
          Your Items
        </Text>
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
              style={{ maxHeight: 500 }}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item: CartItem) => {
                return (
                  <View
                    key={item.productId}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 16,
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    {/* Image */}
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        marginRight: 12,
                        backgroundColor: "#F0F0F0",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={{ uri: item.imgUrl }}
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Right Section */}
                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                      {/* Name (single line) */}
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#000",
                          marginBottom: 8,
                        }}
                      >
                        {item.name}
                      </Text>

                      {/* Bottom row: quantity + price/delete */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
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
                              backgroundColor: "#F8F8F8",
                              borderRadius: 12,
                              paddingHorizontal: 4,
                              height: 32,
                              borderWidth: 1,
                              borderColor: "#E0E0E0",
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
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  color:
                                    item.product && item.quantity >= 2
                                      ? "#9747FF"
                                      : "#CCC",
                                  fontWeight: "600",
                                }}
                              >
                                -
                              </Text>
                            </TouchableOpacity>

                            <Text
                              style={{
                                fontSize: 15,
                                color: "#000",
                                fontWeight: "600",
                                paddingHorizontal: 12,
                              }}
                            >
                              {item.quantity}
                            </Text>

                            <TouchableOpacity
                              disabled={
                                item.product && item.quantity >= 1
                                  ? false
                                  : true
                              }
                              onPress={() => updateCart(item._id, "increment")}
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 18,
                                  color:
                                    item.product && item.quantity >= 1
                                      ? "#9747FF"
                                      : "#CCC",
                                  fontWeight: "600",
                                }}
                              >
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        {/* Quantity controls */}

                        {/* Price and delete icon */}
                        <View
                          style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: "#000",
                            }}
                          >
                            ₹{(item?.price ?? 0) * (item?.quantity ?? 1)}
                          </Text>

                          <TouchableOpacity
                            onPress={() => deleteItem(item._id)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: "#FFEBEE",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#FF6B6B"
                            />
                          </TouchableOpacity>
                        </View>
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
            backgroundColor: "#F8F8F8",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E0E0E0",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#000",
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              Coupon Applied
            </Text>
            <Text
              style={{
                color: "#67C694",
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              - ₹{couponDetails.discountPrice} OFF
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setCouponDetails(null)}
            style={{
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E0E0E0",
            }}
          >
            <Text
              style={{
                color: "#FF6B6B",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Remove
            </Text>
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
            backgroundColor: "#F8F8F8",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#E0E0E0",
          }}
        >
          <Text
            style={{
              color: "#000",
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            Have a coupon?
          </Text>
          <TouchableOpacity
            onPress={onAddItem}
            style={{
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#9747FF",
            }}
          >
            <Text
              style={{
                color: "#9747FF",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              Add +
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
