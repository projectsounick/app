import AnimatedSubmitButton from "@/src/modules/AnimatedSubmitButton";
import HeaderContent from "@/src/modules/HeaderContent";
import SmallHeader from "@/src/modules/SmallHeader";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import { RootState } from "@/store";
import { convertToCartItem, isProductAddableToCart } from "@/utils/cartUtils";

import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, Animated, ImageBackground } from "react-native";
import { addToCart } from "@/Slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import CustomSnackbar from "@/src/modules/Snackbar";
import { cartService } from "@/src/services/cart.service";

import PlansInfo from "@/src/Components/Plans/PlansInfo";

import DietPlanInfo from "@/src/Components/Plans/DietPlanInfo";
import { SafeAreaView } from "react-native-safe-area-context";

const WorkoutPlanScreen = () => {
  /// Getting the current selected plan from the store ----------------/
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const currentPlan = useSelector((state: RootState) => state.plan.currentPlan);
  const plans = useSelector((state: RootState) => state.plan.plans);
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [cartLoading, setCardLoading] = useState(false);
  const [bottomSectionHeight, setBottomSectionHeight] = React.useState(0);

  const screenWidth = Dimensions.get("window").width;

  const [selectedPlanItem, setSelectedPlanItem] = React.useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const dispatch = useDispatch();

  const resolvedCurrentPlan = React.useMemo(() => {
    if (!currentPlan?.planType || !currentPlan?._id) {
      return currentPlan;
    }

    const latestPlan = plans.find((plan) => plan._id === currentPlan._id);
    return latestPlan || currentPlan;
  }, [currentPlan, plans]);

  //// Funciton for adding to the cart ---------------------------------/
  const addingIntoToCart = async (type: string) => {
    try {
      setCardLoading(true);

      if (selectedPlanItem === "") {
        setSnackbarOpen(true);
        setSnackbarMessage("Select the item first");
        return;
      }
      /// checking whether this product is available in cart or not--/
      const alreadyExistsInCart = isProductAddableToCart(
        cartItems,
        selectedPlanItem,
        resolvedCurrentPlan?._id
      );
      if (alreadyExistsInCart) {
        setSnackbarOpen(true);
        setSnackbarMessage("Already added to the cart");
        return;
      }

      const updatedCartItem = convertToCartItem(
        resolvedCurrentPlan,
        type,
        selectedPlanItem
      );
      if (updatedCartItem) {
        let apiObject;
        if (type === "plan") {
          apiObject = {
            plan: {
              planId: updatedCartItem.plan?.planId,
              planItemId: updatedCartItem.plan?.planItemId,
            },
            quantity: updatedCartItem.quantity,
          };
        } else {
          apiObject = {
            dietPlanId: updatedCartItem.dietPlanId,
            quantity: updatedCartItem.quantity,
          };
        }
        /// making the api call to store cart details in the database ---/
        const cartDbResponse = await cartService.addCartItems(apiObject);

        if (!cartDbResponse.success) {
          throw new Error(cartDbResponse.message);
        } else {
          let finalItem = {
            ...updatedCartItem,
            _id: cartDbResponse.data._id,
          };

          dispatch(addToCart(finalItem));
          setSnackbarOpen(true);
          setSnackbarMessage("Added to cart successfully");
          setSelectedPlanItem("");
        }
      }
    } catch (error: any) {
      setSnackbarMessage(error?.message || "Unable to add this plan to the cart");
      setSnackbarOpen(true);
    } finally {
      setCardLoading(false);
    }
  };

  return (
    <>
      {isDark ? (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={["left", "right", "bottom"]}
          >
        <SmallHeader
          title="Overview"
          bottomComponent={
            <HeaderContent
                  title={resolvedCurrentPlan ? resolvedCurrentPlan?.planType?.title : "Diet Plan"}
              subtitle={resolvedCurrentPlan?.title ? resolvedCurrentPlan.title : ""}
            />
          }
        />
        {resolvedCurrentPlan?.planType ? (
          <PlansInfo
            screenWidth={screenWidth}
            cartLoading={cartLoading}
            currentPlan={resolvedCurrentPlan}
            selectedPlanItem={selectedPlanItem}
            setSelectedPlanItem={setSelectedPlanItem}
            setBottomSectionHeight={setBottomSectionHeight}
            addingIntoToCart={addingIntoToCart}
            theme={theme}
            bottomSectionHeight={bottomSectionHeight}
          />
        ) : (
          <DietPlanInfo
            screenWidth={screenWidth}
            showBottomBar={true}
            cartLoading={cartLoading}
            currentPlan={resolvedCurrentPlan}
            selectedPlanItem={selectedPlanItem}
            setSelectedPlanItem={setSelectedPlanItem}
            setBottomSectionHeight={setBottomSectionHeight}
            addingIntoToCart={addingIntoToCart}
            theme={theme}
            bottomSectionHeight={bottomSectionHeight}
          />
        )}
            <CustomSnackbar
              visible={snackbarOpen}
              message={snackbarMessage}
              onDismiss={() => setSnackbarOpen(false)}
              bgColor={theme.colors.background}
            />
          </SafeAreaView>
        </View>
      ) : (
        <ImageBackground
          source={require("../../../assets/images/basicBackground.jpg")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "transparent" }}
            edges={["left", "right", "bottom"]}
          >
            <SmallHeader
              title="Overview"
              bottomComponent={
                <HeaderContent
                  title={resolvedCurrentPlan ? resolvedCurrentPlan?.planType?.title : "Diet Plan"}
                  subtitle={resolvedCurrentPlan?.title ? resolvedCurrentPlan.title : ""}
                />
              }
            />
            {resolvedCurrentPlan?.planType ? (
              <PlansInfo
                screenWidth={screenWidth}
                cartLoading={cartLoading}
                currentPlan={resolvedCurrentPlan}
                selectedPlanItem={selectedPlanItem}
                setSelectedPlanItem={setSelectedPlanItem}
                setBottomSectionHeight={setBottomSectionHeight}
                addingIntoToCart={addingIntoToCart}
                theme={theme}
                bottomSectionHeight={bottomSectionHeight}
              />
            ) : (
              <DietPlanInfo
                screenWidth={screenWidth}
                showBottomBar={true}
                cartLoading={cartLoading}
                currentPlan={resolvedCurrentPlan}
                selectedPlanItem={selectedPlanItem}
                setSelectedPlanItem={setSelectedPlanItem}
                setBottomSectionHeight={setBottomSectionHeight}
                addingIntoToCart={addingIntoToCart}
                theme={theme}
                bottomSectionHeight={bottomSectionHeight}
              />
            )}
            <CustomSnackbar
              visible={snackbarOpen}
              message={snackbarMessage}
              onDismiss={() => setSnackbarOpen(false)}
              bgColor={theme.colors.primary}
            />
          </SafeAreaView>
        </ImageBackground>
      )}
    </>
  );
};

export default WorkoutPlanScreen;
