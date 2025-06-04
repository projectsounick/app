import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";

const OnboardingHeight = ({ onNext }: { onNext: () => void }) => {
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(7);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  // Function to update user data in AsyncStorage

  const feetData = Array.from({ length: 8 }, (_, i) => i + 1);
  const inchesData = Array.from({ length: 12 }, (_, i) => i);

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
      const height = `${feet}'${inches}`;

      await asyncStorageUtils.updateUserDataInAsyncStorage({
        height,
      });

      onNext();
    } catch (error: any) {
      setSnackbarVisible(true);
      setSnackbarMessage(error.message);
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
            What is your{`\n`}height?
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
          {renderPicker(feetData, feet, setFeet, 60)}
          <Text style={{ fontSize: 26, marginHorizontal: 10 }}>.</Text>

          {renderPicker(inchesData, inches, setInches, 60)}
          <View
            style={{
              backgroundColor: "#EFE4FF",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginBottom: 6,
            }}
          >
            <Text style={{ color: "#7D4CFF", fontSize: 18 }}>ft/in</Text>
          </View>
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

export default OnboardingHeight;
