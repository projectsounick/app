import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Alert,
  ImageBackground,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
import theme from "../Theme/globalTheme";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <MaterialCommunityIcons
            name="briefcase-check"
            size={24}
            style={{ marginRight: 8 }}
            color="#333"
          />

          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              color: theme.colors.dark,
            }}
          >
            Our Services
          </Text>
        </View>

        {/* Description */}
        <Text
          style={{
            fontSize: theme.fontSizes.regularSmall,
            color: theme.colors.medium,
            marginBottom: 10,
          }}
        >
          Curated meal plans to match your nutrition goals.
        </Text>
      </View>
      <View
        style={{
          height: 220,
          backgroundColor: "#fff",
          paddingTop: 19,
          paddingBottom: 19,
          paddingLeft: 14,
          borderRadius: 12,
        }}
      >
        {/* Fixed Header */}

        {/* Horizontal Scrollable Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableServices.map((item: any, index) => (
            <View
              key={index}
              style={{
                width: 340,
                height: 180,
                borderRadius: 12,
                marginRight: 12,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              {/* Image Background */}
              <ImageBackground
                source={
                  item.imgUrl
                    ? { uri: item.imgUrl }
                    : require("../../assets/images/track.png")
                }
                style={{ flex: 1 }}
                imageStyle={{ borderRadius: 12 }}
              >
                {/* Overlay Gradient */}
                <LinearGradient
                  colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.2)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ flex: 1, padding: 12 }}
                >
                  {/* Container for Title, Description, and Button */}
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    {/* Title */}
                    <Text
                      style={{
                        fontFamily: theme.fonts.bold,
                        fontSize: 18,
                        color: "#fff",
                        textShadowColor: "rgba(0,0,0,0.9)",
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                        marginBottom: 6,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>

                    {/* Description - always fixed height space */}
                    <View style={{ minHeight: 40 }}>
                      {item.descItems
                        ?.slice(0, 2)
                        .map((desc: string, i: number) => (
                          <View
                            key={i}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <View
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: "rgba(255,255,255,0.95)",
                                marginRight: 6,
                                alignSelf: "flex-start",
                                marginTop: "2%",
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#fff",
                                flexShrink: 1,
                                lineHeight: 18,
                                fontWeight: "500",
                                textShadowColor: "rgba(0,0,0,0.85)",
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 2,
                              }}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {desc}
                            </Text>
                          </View>
                        ))}
                    </View>

                    {/* Check Details Button - aligned to bottom */}
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#67C694",
                        width: SCREEN_WIDTH * 0.32,
                        height: SCREEN_WIDTH * 0.08,
                        borderRadius: (SCREEN_WIDTH * 0.08) / 2,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 4,
                        shadowColor: "#000", // shadow color
                        shadowOffset: { width: 0, height: 3 }, // x/y offset
                        shadowOpacity: 0.3, // how opaque the shadow is
                        shadowRadius: 4, // blur radius
                        elevation: 5, // for Android shadow
                      }}
                      onPress={() => {
                        setModalVisible(true);
                        setSelectedService(item);
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: theme.fonts.bold,
                          fontSize: SCREEN_WIDTH * 0.036,
                          color: "#fff",
                          textAlign: "center",
                        }}
                      >
                        Check Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>
      </View>
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
