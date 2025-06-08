import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { useLoadFromAsyncStorage } from "@/hooks/useOnboardingDataLoad";
import { UserData } from "@/app/interfaces/UserInterface";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";

const OnboardingWeight = ({
  onNext,
}: {
  onNext: () => void;
  onBack: () => void;
}) => {
  const [weightInt, setWeightInt] = useState(80);
  const [weightDecimal, setWeightDecimal] = useState(0);

  const [loading, setLoading] = useState(false);

  const intData = Array.from({ length: 180 }, (_, i) => i + 20); // 20–199
  const decimalData = Array.from({ length: 10 }, (_, i) => i); // 0–9

  // Function to update user data in AsyncStorage
  useLoadFromAsyncStorage<UserData, any>({
    key: "user",
    property: "weight", // or "age"
    setter: setWeightInt, // or setAge
  });

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
        paddingTop: 50,
        paddingBottom: 50,
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
      style={{ width: itemWidth, height: 150 }}
    />
  );

  const handleNext = async () => {
    const weight = `${weightInt}.${weightDecimal}`;

    let response = await asyncStorageUtils.updateUserDataInAsyncStorage({
      weight,
    });
    console.log(response);

    onNext();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingVertical: 60,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: "#000",
              textAlign: "center",
            }}
          >
            What is your{`\n`}current weight?
          </Text>
        </View>

        {/* Weight Picker */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          {renderPicker(intData, weightInt, setWeightInt, 60)}
          <Text style={{ fontSize: 26, marginHorizontal: 10 }}>.</Text>
          {renderPicker(decimalData, weightDecimal, setWeightDecimal, 40)}
          <View style={{ marginLeft: 20 }}>
            <View
              style={{
                backgroundColor: "#EFE4FF",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: "#7D4CFF", fontSize: 18 }}>kg</Text>
            </View>
          </View>
        </View>

        {/* Button */}
        <AnimatedSubmitButton
          loading={loading}
          onPress={handleNext}
          title="Next"
        />
      </ScrollView>
    </View>
  );
};

export default OnboardingWeight;
