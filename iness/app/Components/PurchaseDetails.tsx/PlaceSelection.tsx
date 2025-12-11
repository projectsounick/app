import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import theme from "@/app/Theme/globalTheme";

interface Props {
  place: string;
  onPlaceChange: any;
  addressMap: { [key: string]: string };
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="map-pin" size={18} color="#9747FF" />
        </View>
        <Text style={styles.title}>Location</Text>
      </View>

      {/* Place Label */}
      <View style={styles.content}>
        <View style={styles.placeLabel}>
          <Icon name="home" size={16} color="#9747FF" />
          <Text style={styles.placeLabelText}>Home</Text>
        </View>

        {/* Address Input */}
        <View
          style={[
            styles.inputContainer,
            preferences && styles.inputContainerDisabled,
          ]}
        >
          <TextInput
            value={addressMap[place] || ""}
            onChangeText={(text) => onAddressChange(place, text)}
            placeholder="Enter your address"
            placeholderTextColor="#999"
            editable={!preferences}
            style={[styles.input, preferences && styles.inputDisabled]}
          />
          <Icon
            name="edit-2"
            size={16}
            color={preferences ? "#CCC" : "#9747FF"}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  content: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  placeLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EDFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  placeLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9747FF",
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputContainerDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E8E8E8",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    fontFamily: theme.fonts.regular,
  },
  inputDisabled: {
    color: "#999",
  },
});

export default PlaceSelectionSection;
