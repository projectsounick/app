import theme from "@/app/Theme/globalTheme";
import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Divider } from "react-native-paper";
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
        borderWidth: 1,
        borderColor: theme.colors.secondPrimary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        backgroundColor: theme.colors.text,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Icon
          name="map-pin"
          size={18}
          color="#5E3AEE"
          style={{ marginRight: 6 }}
        />
        <Text style={{ fontSize: theme.fontSizes.medium, color: "#000" }}>
          Place
        </Text>
      </View>

      <View style={{ flexDirection: "row", marginBottom: 2 }}>
        {["Home"].map((p) => (
          <View
            key={p}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: "#000",
              }}
            >
              {p}
            </Text>
          </View>
        ))}
      </View>
      <Divider
        style={{
          width: "80%",
          height: 1,
          backgroundColor: "#E5E7EB", // or any light gray
          alignSelf: "center",
          marginBottom: 20, // optional spacing
        }}
      />

      <View
        style={{
          backgroundColor: "#F3F4F6",
          padding: 12,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextInput
          value={addressMap[place] || ""}
          onChangeText={(text) => onAddressChange(place, text)}
          placeholder={`Enter ${place} Address`}
          editable={!preferences} // <-- disable input
          style={{
            flex: 1,
            fontSize: 14,
            color: preferences ? "#888" : "#000", // grayed out text when disabled
            backgroundColor: preferences ? "#f0f0f0" : "#fff", // optional: light gray background
            padding: 8, // optional for better UX
            borderRadius: 6, // optional for UI consistency
          }}
        />

        <Icon name="edit" size={18} color="#888" />
      </View>
    </View>
  );
};

export default PlaceSelectionSection;
