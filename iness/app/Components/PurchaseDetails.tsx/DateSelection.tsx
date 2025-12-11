import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import Icon from "react-native-vector-icons/Feather";
import theme from "@/app/Theme/globalTheme";

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="calendar" size={18} color="#9747FF" />
        </View>
        <Text style={styles.title}>Choose a date</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.dateText}>
          {moment(selectedDate).format("MMMM D, YYYY")}
        </Text>
        <TouchableOpacity
          onPress={showDatePicker}
          style={[
            styles.changeButton,
            preferences && styles.changeButtonDisabled,
          ]}
          disabled={preferences}
        >
          <Text style={styles.changeButtonText}>Change</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    fontFamily: theme.fonts.medium,
  },
  changeButton: {
    backgroundColor: "#67C694",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  changeButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  changeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: theme.fonts.medium,
  },
});

export default ChooseDateSection;
