import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import HeaderContent from "@/app/modules/HeaderContent";
import SmallHeader from "@/app/modules/SmallHeader";
import theme from "@/app/Theme/globalTheme";
import { RootState } from "@/store";
import { convertToCartItem, isProductAddableToCart } from "@/utils/cartUtils";

import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, Animated } from "react-native";
import { addToCart } from "@/Slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import CustomSnackbar from "@/app/modules/Snackbar";
import { cartService } from "@/app/services/cart.service";

import PlansInfo from "@/app/Components/Plans/PlansInfo";

import DietPlanInfo from "@/app/Components/Plans/DietPlanInfo";
import { useLocalSearchParams } from "expo-router";
import { ActivePlans } from "@/app/interfaces/planInterface";
import { SafeAreaView } from "react-native-safe-area-context";

const WorkoutPlanScreen = () => {
  /// Getting the current selected plan from the store ----------------/
  // 1. Get the plan ID from navigation/screen redirection
  const { id } = useLocalSearchParams(); // if using expo-router and it's passed like `/workout-plan/[id]`

  // 2. Find the corresponding plan from state.plan.activePlans
  const selectedPlan: ActivePlans = useSelector((state: RootState) =>
    state.plan.activePlans.find((plan) => plan._id === id)
  );

  const [bottomSectionHeight, setBottomSectionHeight] = React.useState(0);

  const screenWidth = Dimensions.get("window").width;

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const dispatch = useDispatch();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}
      edges={["top", "left", "right", "bottom"]}
    >
      <SmallHeader
        title="Overview"
        bottomComponent={
          <HeaderContent
            title={"Back"}
            subtitle={selectedPlan?.dietPlanDetails?.title || ""}
          />
        }
      />
      <DietPlanInfo
        screenWidth={screenWidth}
        cartLoading={false}
        showBottomBar={false}
        currentPlan={selectedPlan}
        selectedPlanItem={""}
        setSelectedPlanItem={() => {}}
        setBottomSectionHeight={setBottomSectionHeight}
        addingIntoToCart={() => {}}
        theme={theme}
        bottomSectionHeight={bottomSectionHeight}
      />
      <CustomSnackbar
        visible={snackbarOpen}
        message={snackbarMessage}
        onDismiss={() => setSnackbarOpen(false)}
        bgColor={theme.colors.primary}
      />
    </SafeAreaView>
  );
};

export default WorkoutPlanScreen;
