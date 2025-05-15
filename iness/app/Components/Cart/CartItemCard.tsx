import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string; // Optional image URL or local asset
}

interface Props {
  items: CartItem[];
  onAddItem: () => void;
}

export default function CartItemList({
  items: initialItems,
  onAddItem,
}: Props) {
  const [items, setItems] = useState(initialItems);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

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
      <Text style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
        You can edit and delete
      </Text>

      {/* Scrollable Items */}
      <ScrollView
        style={{ maxHeight: 200 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 14,
              height: 40, // Fixed height ensures alignment
            }}
          >
            {/* Placeholder Image */}
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: "#ccc",
                marginRight: 10,
              }}
            />

            {/* Name */}
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  color: "#000",
                }}
              >
                {item.name}
              </Text>
            </View>

            {/* Quantity Control */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F2E7FE",
                borderRadius: 14,
                paddingHorizontal: 8,
                marginHorizontal: 10,
                height: 28, // Consistent height for control
              }}
            >
              <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#9747FF",
                    paddingHorizontal: 6,
                  }}
                >
                  -
                </Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: "#000" }}>
                {item.quantity}
              </Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#9747FF",
                    paddingHorizontal: 6,
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price */}
            <Text style={{ color: "#000", fontWeight: "600" }}>
              ₹{item.price * item.quantity}
            </Text>
          </View>
        ))}
      </ScrollView>

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
