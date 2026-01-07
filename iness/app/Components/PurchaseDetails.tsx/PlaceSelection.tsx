import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="map-pin" size={18} color={theme.colors.secondPrimary} />
        </View>
        <Text style={styles.title}>Location</Text>
      </View>

      {/* Place Label */}
      <View style={styles.content}>
        <View style={styles.placeLabel}>
          <Icon name="home" size={16} color={theme.colors.secondPrimary} />
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
            placeholderTextColor={theme.colors.textMuted}
            editable={!preferences}
            style={[styles.input, preferences && styles.inputDisabled]}
          />
          <Icon
            name="edit-2"
            size={16}
            color={preferences ? theme.colors.textLight : theme.colors.secondPrimary}
          />
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: isDark ? theme.colors.textWhite : theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  content: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  placeLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundCardLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  placeLabelText: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.secondPrimary,
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputContainerDisabled: {
    backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.mediumGrey,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSizes.regularSmall,
    color: isDark ? theme.colors.textWhite : theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  inputDisabled: {
    color: theme.colors.textMuted,
  },
});

export default PlaceSelectionSection;
