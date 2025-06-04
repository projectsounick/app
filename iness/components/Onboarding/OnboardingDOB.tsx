import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";

const OnboardingDOB = ({ onNext }: { onNext: () => void }) => {
  // States for day, month, year
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1); // January is 1 for user friendliness
  const [year, setYear] = useState(1990);

  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Generate day/month/year data arrays
  const dayData = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthData = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const yearData = Array.from({ length: 100 }, (_, i) => currentYear - i); // last 100 years

  const renderPicker = (
    data: number[],
    selected: number,
    setSelected: (val: number) => void,
    itemWidth: number
  ) => (
    <FlatList
      data={data}
      keyExtractor={(item) => item.toString()}
      showsVerticalScrollIndicator={false}
      snapToInterval={50}
      decelerationRate="fast"
      contentContainerStyle={{
        paddingTop: 100,
        paddingBottom: 100,
        alignItems: "center",
      }}
      getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
      initialScrollIndex={data.indexOf(selected)}
      onScroll={(e) => {
        const offset = e.nativeEvent.contentOffset.y;
        const index = Math.round(offset / 50);
        setSelected(data[Math.min(Math.max(index, 0), data.length - 1)]);
      }}
      renderItem={({ item }) => (
        <View style={{ height: 50, justifyContent: "center" }}>
          <Text
            style={{
              fontSize: 24,
              color: item === selected ? "#7D4CFF" : "#ccc",
              fontWeight: item === selected ? "bold" : "normal",
              textAlign: "center",
            }}
          >
            {item}
          </Text>
        </View>
      )}
      style={{ width: itemWidth, height: 250 }}
      scrollEventThrottle={16}
    />
  );

  const handleNext = async () => {
    try {
      setLoading(true);

      const dob = new Date(year, month - 1, day);

      // Validate date is valid
      if (
        dob.getFullYear() !== year ||
        dob.getMonth() !== month - 1 ||
        dob.getDate() !== day
      ) {
        throw new Error("Invalid date selected");
      }

      // Pass Date object itself (not string)
      await asyncStorageUtils.updateUserDataInAsyncStorage({
        dob, // Date object here
      });

      setLoading(false);
      onNext();
    } catch (error: any) {
      setLoading(false);
      setSnackbarVisible(true);
      setSnackbarMessage(error.message || "Failed to save DOB");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 60 }}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: "#000",
              textAlign: "center",
            }}
          >
            What is your{`\n`}date of birth?
          </Text>
          {/* Formatted DOB below */}
          <Text
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#7D4CFF",
              fontWeight: "600",
            }}
          >
            DD/MM/YY
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          {renderPicker(dayData, day, setDay, 60)}
          <Text style={{ fontSize: 26, marginHorizontal: 10 }}>.</Text>

          {renderPicker(monthData, month, setMonth, 60)}
          <Text style={{ fontSize: 26, marginHorizontal: 10 }}>.</Text>

          {renderPicker(yearData, year, setYear, 80)}
        </View>

        <AnimatedSubmitButton
          loading={loading}
          onPress={handleNext}
          title="Next"
        />
      </View>

      <CustomSnackbar
        visible={snackbarVisible}
        bgColor={theme.colors.red}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default OnboardingDOB;
