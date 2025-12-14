import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import theme from "../Theme/globalTheme";
import { cartService } from "../services/cart.service";
import CustomSnackbar from "./Snackbar";
import { addToCart } from "@/Slices/cartSlice";
import { CircularProgress } from "react-native-circular-progress";
import { ActivityIndicator } from "react-native-paper";

import {
  convertToProductCartItem,
  convertToServiceCartItem,
  isEcomProductAddableToCart,
  isServiceAddableToCart,
} from "@/utils/cartUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import CustomModal from "@/app/Modals/ServiceDetailsModal";

const BannerCard = ({ cardData }: { cardData: any }) => {
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [cartLoading, setCardLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const addingIntoToCart = async () => {
    try {
      setCardLoading(true);

      // checking whether this product is available in cart or not--/
      const alreadyExistsInCart = isServiceAddableToCart(
        cartItems,
        cardData._id
      );
      if (alreadyExistsInCart) {
        setSnackbarOpen(true);
        setSnackbarMessage("Already added to the cart");
        return;
      }

      let apiObject = {
        serviceId: cardData._id,
      };

      /// making the api call to store cart details in the database ---/
      const cartDbResponse = await cartService.addCartItems(apiObject);

      if (!cartDbResponse.success) {
        throw new Error(cartDbResponse.message);
      } else {
        const updatedCartItem = convertToServiceCartItem(
          cardData,
          cartDbResponse.data
        );

        let finalItem = {
          ...updatedCartItem,
          _id: cartDbResponse.data._id,
        };
        console.log("before close");

        setModalVisible(false);
        dispatch(addToCart(finalItem));
        setSnackbarOpen(true);
        setSnackbarMessage("Added to cart successfully");
      }
    } catch (error: any) {
      setSnackbarOpen(error.message);
      setSnackbarOpen(true);
    } finally {
      setCardLoading(false);
    }
  };
  return (
    <>
      {/* Gradient Card */}
      <LinearGradient
        colors={["#3D0E7B", "#000000"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16, // ✅ space on both sides
          paddingVertical: 20,
          borderRadius: 12,
          marginTop: 10,
        }}
      >
        {/* Left Section (60%) */}
        <View style={{ width: "70%", paddingRight: 10 }}>
          {/* Title */}
          <Text
            style={{
              fontSize: theme.fontSizes.medium,
              fontFamily: theme.fonts.bold,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            {cardData.title}
          </Text>

          {/* Description Bullets */}
          {cardData.descItems.slice(0, 2).map((item: string, idx: number) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#fff",
                  marginTop: 6,
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: theme.fontSizes.small,
                  color: "#fff",
                  flexShrink: 1,
                  fontFamily: theme.fonts.regular,
                }}
                numberOfLines={2}
              >
                {item}
              </Text>
            </View>
          ))}

          {/* CTA Button */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              height: 30,
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              borderRadius: 18,
              alignSelf: "flex-start",
              marginTop: 10,
              minWidth: 100, // 👈 ensures it’s always at least this wide
              alignItems: "center", // centers text
            }}
            onPress={() => setModalVisible(true)}
          >
            <Text
              style={{
                color: "#000",
                fontWeight: "600",
                fontFamily: theme.fonts.bold,
              }}
            >
              View
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Section (40%) */}
        <View
          style={{
            width: "30%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={{ uri: cardData.imgUrl }}
            style={{ width: "100%", height: 150, borderRadius: 10 }} // ✅ bigger image
            resizeMode="contain"
          />
        </View>
      </LinearGradient>

      {/* Bottom Sheet Modal */}
      <CustomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        cardData={cardData}
        addingIntoToCart={addingIntoToCart}
        cartLoading={false}
      />
      <CustomSnackbar
        visible={snackbarOpen}
        message={snackbarMessage}
        onDismiss={() => setSnackbarOpen(false)}
        bgColor={theme.colors.primary}
      />
    </>
  );
};

export default BannerCard;
const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    minHeight: 220,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  leftSection: {
    flex: 1.4,
    paddingRight: 14,
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginRight: 8,
    marginTop: 6,
  },
  bulletText: {
    color: "#d1d1d1",
    flexShrink: 1,
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 22,
    alignSelf: "flex-start",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  rightSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 13, // ✅ space around image
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
});
