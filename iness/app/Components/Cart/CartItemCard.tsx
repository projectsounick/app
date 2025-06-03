import { CartItem } from "@/app/interfaces/cartInterface";
import { cartService } from "@/app/services/cart.service";
import { removeFromCart, deleteCartItem } from "@/Slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";

interface Props {
  items: CartItem[];
  onAddItem: () => void;
}

///// Main funcitonal component for the CartItemList ----------------------------------/
export default function CartItemList({ items, onAddItem }: Props) {
  const [simmerLodaing, setSimmerLoading] = useState<{
    state: boolean;
    _id: string | null;
  }>({ state: false, _id: null });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const dispatch = useDispatch();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const updateQuantity = (id: string, delta: number) => {};

  /// Funciton for removing from the cart ------------------/
  const removeCartItem = (
    cartItemId: string | undefined,
    id: string | undefined
  ) => {
    try {
      if (id) {
        setSimmerLoading({ state: true, _id: id });
        /// making the api call to remove
        dispatch(removeFromCart(id));
      }
    } catch (error: any) {
      setSnackbarOpen(true);
      setSnackbarMessage(error.message);
    } finally {
      setSimmerLoading({ state: false, _id: null });
    }
  };

  //// Function for deleting the cart items --------------------/
  async function deleteItem(_id: string | undefined) {
    try {
      if (_id) {
        setSimmerLoading({ state: true, _id: _id });

        /// making the api call to remove from cart----/
        const response = await cartService.deleteCartItems(_id);

        if (!response.success) {
          throw new Error(response.message);
        }
        dispatch(deleteCartItem(_id));
      }
    } catch (error: any) {
      setSnackbarOpen(true);
      setSnackbarMessage(error.message);
    } finally {
      setSimmerLoading({ state: false, _id: null });
    }
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
        <Text style={{ fontSize: 18 }}>⌄</Text>
      </View>

      {/* Empty State or Items */}
      {items.length === 0 ? (
        <Text style={{ color: "#888", fontStyle: "italic", fontSize: 14 }}>
          There is nothing available in the cart.
        </Text>
      ) : (
        <ScrollView
          style={{ maxHeight: 200 }}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item: CartItem) => {
            const isLoading =
              simmerLodaing.state && simmerLodaing._id === item.productId;

            return (
              <View
                key={item.productId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 14,
                  height: 40,
                  opacity: isLoading ? 0.5 : 1, // subtle shimmer effect
                }}
              >
                {/* Image */}
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    marginRight: 10,
                    backgroundColor: "#ccc",
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri: item.imgUrl }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                    }}
                    resizeMode="cover"
                  />
                </View>

                {/* Name or shimmer */}
                <View style={{ flex: 1, justifyContent: "center" }}>
                  {isLoading ? (
                    <Text style={{ fontSize: 12, color: "#aaa" }}>
                      Removing...
                    </Text>
                  ) : (
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 14, color: "#000" }}
                    >
                      {item.name}
                    </Text>
                  )}
                </View>

                {/* Quantity Controls (hide during shimmer) */}
                {isLoading ? (
                  <View
                    style={{
                      width: 60,
                      height: 28,
                      backgroundColor: "#e0e0e0",
                      borderRadius: 14,
                      marginHorizontal: 10,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#F2E7FE",
                      borderRadius: 14,
                      paddingHorizontal: 8,
                      marginHorizontal: 10,
                      height: 28,
                      opacity: 0.5, // visually indicate disabled state
                    }}
                  >
                    <TouchableOpacity
                      disabled={true} // disable if planId exists
                      onPress={() => {
                        removeCartItem(item._id, item.productId);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: item.plan?.planId ? "#aaa" : "#9747FF", // gray out if disabled
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
                      disabled={true}
                      onPress={() => {
                        // handle increase quantity
                      }}
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

                {/* Price */}
                <Text style={{ color: "#000", fontWeight: "600" }}>
                  ₹{(item?.price ?? 0) * (item?.quantity ?? 1)}
                </Text>
                {/* Delete Icon */}
                {!isLoading && (
                  <TouchableOpacity
                    onPress={() => {
                      deleteItem(item._id);
                    }}
                    style={{ marginLeft: 5 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#000", fontSize: 13 }}>Missed something?</Text>
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
    </View>
  );
}
