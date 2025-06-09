import PlanProgressStatus from "@/app/Components/HeaderSubComponents/PlanProgressStatus";
import CurrentPlans from "@/app/Components/Train/CurrentPlans";
import withAnimatedHeader from "@/app/Hoc/MainHeader";
import { RootState } from "@/store";
import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const HEADER_HEIGHT = 180;
const MainHeader = withAnimatedHeader(PlanProgressStatus);
export default function TrainScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const selectedTab = useSelector((state: RootState) => state.plan.planTab);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={["top", "left", "right", "bottom"]}
    >
      <MainHeader scrollY={scrollY} title="Train" />

      {/* Scrollable Content starts below header */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 20, // Reserve space under the header
          paddingBottom: 10,
          paddingHorizontal: 16, // ✅ Add horizontal spacing here
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Card 1 */}
        {selectedTab === "current" ? (
          <CurrentPlans isActive={true} />
        ) : (
          <CurrentPlans isActive={false} />
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
