import { CartItem } from "@/app/interfaces/cartInterface";
import CustomSnackbar from "@/app/modules/Snackbar";
import { cartService } from "@/app/services/cart.service";
import theme from "@/app/Theme/globalTheme";
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
        backgroundColor: "#fff",
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#000" }}>
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
          }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {items.length === 0 ? (
            <Text style={{ color: "#888", fontStyle: "italic", fontSize: 14 }}>
              There is nothing available in the cart.
            </Text>
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
                    }}
                  >
                    {/* Image */}
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        marginRight: 12,
                        backgroundColor: "#ccc",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        source={{ uri: item.imgUrl }}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    </View>

                    {/* Right Section */}
                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                      {/* Name (single line) */}
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#000",
                          marginBottom: 6,
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
                            <ActivityIndicator />
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              backgroundColor: "#F2E7FE",
                              borderRadius: 14,
                              paddingHorizontal: 8,
                              height: 28,
                              opacity: 0.5,
                            }}
                          >
                            <TouchableOpacity
                              disabled={
                                item.product && item.quantity >= 2
                                  ? false
                                  : true
                              }
                              onPress={() => updateCart(item._id, "decrement")}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: item.plan?.planId ? "#aaa" : "#9747FF",
                                  paddingHorizontal: 6,
                                }}
                              >
                                -
                              </Text>
                            </TouchableOpacity>

                            <Text style={{ fontSize: 14, color: "#000" }}>
                              {item.quantity}
                            </Text>

                            <TouchableOpacity
                              disabled={
                                item.product && item.quantity >= 1
                                  ? false
                                  : true
                              }
                              onPress={() => updateCart(item._id, "increment")}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: item.plan?.planId ? "#aaa" : "#9747FF",
                                  paddingHorizontal: 6,
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
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#000",
                              marginRight: 10,
                            }}
                          >
                            ₹{(item?.price ?? 0) * (item?.quantity ?? 1)}
                          </Text>

                          <TouchableOpacity
                            onPress={() => deleteItem(item._id)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="red"
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
            marginTop: 10,
          }}
        >
          <Text style={{ color: "#000", fontSize: 13 }}>
            Coupon Applied{" "}
            <Text style={{ color: "green", fontWeight: "bold" }}>
              - ₹{couponDetails.discountPrice} OFF
            </Text>
          </Text>
          <TouchableOpacity
            onPress={() => setCouponDetails(null)}
            style={{
              backgroundColor: "#F2E7FE",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "#9747FF", fontWeight: "600" }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Text style={{ color: "#000", fontSize: 13 }}>Have a coupon?</Text>
          <TouchableOpacity
            onPress={onAddItem}
            style={{
              backgroundColor: "#F2E7FE",
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "#9747FF", fontWeight: "600" }}>Add +</Text>
          </TouchableOpacity>
        </View>
      )}

      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        bgColor={theme.colors.primary}
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
