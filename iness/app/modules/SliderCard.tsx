import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

import CustomModal from "./ServiceDetailsModal";
import { ServiceDetails } from "../interfaces/serviceInterface";
import {
  convertToServiceCartItem,
  isServiceAddableToCart,
} from "@/utils/cartUtils";
import { cartService } from "../services/cart.service";
import { addToCart } from "@/Slices/cartSlice";
import { LinearGradient } from "expo-linear-gradient";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { userService } from "../services/user.service";

export default function SliderCard() {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDetails | null>(
    null
  );
  const [cartLoading, setCardLoading] = useState(false);
  const dispatch = useDispatch();
  const availableServices = useSelector(
    (state: RootState) => state.plan.availableServices
  );
  const addingIntoToCart = async () => {
    try {
      setCardLoading(true);

      // 1️⃣ Check if user exists
      const userDataString =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userDataString.exists) {
        Alert.alert(
          "Login Required",
          "You need to log in to add a plan to the cart.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Login",
              onPress: () => userService.logout(), // or navigate to login
            },
          ]
        );
        return; // stop execution if user not logged in
      }

      // 2️⃣ Check if a service is selected
      if (!selectedService) {
        Alert.alert(
          "No Plan Selected",
          "Please select a plan before continuing."
        );
        return;
      }

      // 3️⃣ Check if the plan already exists in cart
      const alreadyExistsInCart = isServiceAddableToCart(
        cartItems,
        selectedService._id
      );

      if (alreadyExistsInCart) {
        Alert.alert("Info", "This plan is already in your cart.");
        return;
      }

      // 4️⃣ Prepare API call
      const apiObject = {
        serviceId: selectedService._id,
      };

      // 5️⃣ Call the API
      const cartDbResponse = await cartService.addCartItems(apiObject);

      if (!cartDbResponse.success) {
        throw new Error(cartDbResponse.message);
      }

      // 6️⃣ Update cart in Redux
      const updatedCartItem = convertToServiceCartItem(
        selectedService,
        cartDbResponse.data
      );

      const finalItem = {
        ...updatedCartItem,
        _id: cartDbResponse.data._id,
      };

      setModalVisible(false);
      dispatch(addToCart(finalItem));

      Alert.alert("Success", "Plan added to cart successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setCardLoading(false);
    }
  };
  return (
    <>
      <View style={{ marginBottom: 24 }}>
        {/* Header with icon on left, two text items vertically on right */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
        
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
              marginRight: 12,
            }}
          >
            <MaterialCommunityIcons
              name="briefcase-check"
              size={20}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#000",
                marginBottom: 2,
              }}
            >
              Our Services
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              Professional services tailored to your needs.
            </Text>
          </View>
        </View>
      </View>
      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent:
            availableServices.length === 1 ? "center" : "flex-start",
          paddingRight: 12,
        }}
      >
        {availableServices.map((item: any, index) => (
          <View
            key={index}
            style={{
              marginRight: index === availableServices.length - 1 ? 0 : 12,
              width: 280,
              height: 209,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#736AD6",
            }}
          >
            {/* Image Background */}
            {item.imgUrl ? (
              <ImageBackground
                source={{ uri: item.imgUrl }}
                style={{ flex: 1 }}
                resizeMode="cover"
              >
                {/* Dark gradient overlay */}
                <LinearGradient
                  colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.2)"]}
                  style={{ flex: 1, padding: 16, justifyContent: "space-between" }}
                >
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        color: "#fff",
                        marginBottom: 6,
                        textShadowColor: "rgba(0,0,0,0.8)",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 4,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>

                    <View>
                      {item.descItems
                        ?.slice(0, 3)
                        .map((desc: string, idx: number) => (
                          <View
                            key={idx}
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-start",
                              marginBottom: 8,
                            }}
                          >
                            <View
                              style={{
                                width: 11,
                                height: 11,
                                borderRadius: 5.5,
                                backgroundColor: "rgba(255,255,255,0.7)",
                                marginRight: 6,
                                marginTop: 2,
                              }}
                            />
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 12,
                                flex: 1,
                                textShadowColor: "rgba(0,0,0,0.7)",
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 3,
                              }}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {desc}
                            </Text>
                          </View>
                        ))}
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "rgba(103,198,148,0.9)",
                        width: SCREEN_WIDTH * 0.3,
                        height: SCREEN_WIDTH * 0.08,
                        borderRadius: (SCREEN_WIDTH * 0.1) / 2,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 4,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                      onPress={() => {
                        setModalVisible(true);
                        setSelectedService(item);
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 13,
                          textAlign: "center",
                          color: "#fff",
                          textShadowColor: "rgba(0,0,0,0.6)",
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}
                      >
                        Check Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              // fallback if no image
              <View
                style={{
                  flex: 1,
                  backgroundColor: "#736AD6",
                  padding: 16,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 16,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <CustomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        cardData={selectedService}
        addingIntoToCart={addingIntoToCart}
        cartLoading={cartLoading}
      />
    </>
  );
}
