import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface Props {
  place: string;
  onPlaceChange: any;
  addressMap: { [key: string]: string }; // separate address for each place
  onAddressChange: (place: string, text: string) => void;
  onChooseLocation?: () => void;
  preferences: boolean;
}

const PlaceSelectionSection: React.FC<Props> = ({
  place,
  onPlaceChange,
  addressMap,
  onAddressChange,
  onChooseLocation,
  preferences,
}) => {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#F5F5F5",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
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
            marginRight: 10,
          }}
        >
          <Icon name="map-pin" size={18} color="#FFFFFF" />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#000",
          }}
        >
          Place
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginBottom: 12,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        }}
      >
        {["Home"].map((p) => (
          <View
            key={p}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              paddingHorizontal: 16,
              backgroundColor: "#F8F8F8",
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#000",
              }}
            >
              {p}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: preferences ? "#F8F8F8" : "#FFFFFF",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: preferences ? "#E0E0E0" : "#E0E0E0",
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <TextInput
          value={addressMap[place] || ""}
          onChangeText={(text) => onAddressChange(place, text)}
          placeholder={`Enter ${place} Address`}
          placeholderTextColor="#999"
          editable={!preferences}
          style={{
            flex: 1,
            fontSize: 15,
            color: preferences ? "#888" : "#000",
            paddingVertical: 4,
          }}
        />

        <Icon
          name="edit"
          size={18}
          color={preferences ? "#999" : "#9747FF"}
          style={{ marginLeft: 8 }}
        />
      </View>
    </View>
  );
};

export default PlaceSelectionSection;
