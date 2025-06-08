import { setPlanTab } from "@/Slices/planSlice";
import { RootState } from "@/store";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { State } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";

const PlansStatusCard = () => {
  const current = useSelector(
    (state: RootState) => state.plan.activePlans.length
  );
  const completed = useSelector(
    (state: RootState) => state.plan.completedPlans.length
  );
  const dispatch = useDispatch();
  const planTab = useSelector((state: RootState) => state.plan.planTab);
  const renderCard = (
    type: "current" | "completed",
    label: string,
    count: number
  ) => {
    const isSelected = planTab === type;
    return (
      <TouchableOpacity
        onPress={() => dispatch(setPlanTab(type))}
        style={{
          flex: 1,
          backgroundColor: isSelected ? "#7B61FF" : "#ECE9FD",
          paddingVertical: 10,
          borderRadius: 10,
          marginHorizontal: 6,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            color: isSelected ? "#fff" : "#7B61FF",
            fontSize: 13,
            fontWeight: "600",
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: isSelected ? "#fff" : "#7B61FF",
          }}
        >
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flexDirection: "row", marginTop: 16, height: 64 }}>
      {renderCard("current", "Current Plans", current)}
      {renderCard("completed", "Plans Completed", completed)}
    </View>
  );
};

export default PlansStatusCard;
