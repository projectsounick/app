import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
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
          <Icon name="calendar" size={18} color="#FFFFFF" />
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#000",
          }}
        >
          Choose a date
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#000",
            flex: 1,
          }}
        >
          {moment(selectedDate).format("MMMM D, YYYY")}
        </Text>
        <TouchableOpacity
          onPress={showDatePicker}
          style={{
            backgroundColor: preferences ? "#CCCCCC" : "#9747FF",
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 20,
            opacity: preferences ? 0.6 : 1,
          }}
          disabled={preferences}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: 13,
            }}
          >
            Change
          </Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        date={selectedDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default ChooseDateSection;
