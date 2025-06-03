import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { ThemeContext } from "@react-navigation/native";
import theme from "@/app/Theme/globalTheme";
import Icon from "react-native-vector-icons/Feather";

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  preferences: boolean;
}

const ChooseDateSection: React.FC<Props> = ({
  selectedDate,
  onDateChange,
  preferences,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const showDatePicker = () => setPickerVisible(true);
  const hideDatePicker = () => setPickerVisible(false);

  const handleConfirm = (date: Date) => {
    onDateChange(date);
    hideDatePicker();
  };

  return (
    <LinearGradient
      colors={["#E1CAFF", "#FFFFFF"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.secondPrimary,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
      >
        <Icon
          name="calendar"
          size={20}
          color="rgba(151, 71, 255, 1)"
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            fontSize: theme.fontSizes.medium,
            color: theme.colors.dark, // black text
            fontWeight: theme.fontWeights.regular,
          }}
        >
          Choose a date
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 20, fontWeight: "600", color: "#000" }}>
          {moment(selectedDate).format("MMMM D, YYYY")}
        </Text>
        <TouchableOpacity
          onPress={showDatePicker}
          style={{
            backgroundColor: preferences ? "#A78BFA" : "#8B5CF6", // lighter shade when disabled
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
            opacity: preferences ? 0.6 : 1, // optional: also dim the button when disabled
          }}
          disabled={preferences}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Change</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        date={selectedDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </LinearGradient>
  );
};

export default ChooseDateSection;
