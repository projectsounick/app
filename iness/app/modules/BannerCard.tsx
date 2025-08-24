import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";

import { cartService } from "../services/cart.service";
import CustomSnackbar from "./Snackbar";
import { addToCart } from "@/Slices/cartSlice";
import { CircularProgress } from "react-native-circular-progress";
import { ActivityIndicator } from "react-native-paper";
import theme from "../Theme/globalTheme";
import {
  convertToProductCartItem,
  convertToServiceCartItem,
  isEcomProductAddableToCart,
  isServiceAddableToCart,
} from "@/utils/cartUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";

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
          borderRadius: 12,
          padding: 12,
          marginTop: 14,
          height: 180,
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Left Text Section */}
          <View style={{ flex: 1.2, paddingRight: 8 }}>
            {/* Title */}
            <Text
              style={{
                color: "#fff",
                fontSize: theme.fontSizes.regular,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              {cardData.title}
            </Text>

            {/* First Two Description Lines with Bullet */}
            {cardData.descItems.slice(0, 2).map((item: string, idx: number) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                    marginRight: 6,
                    marginTop: 6,
                  }}
                />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: theme.fontSizes.small,
                    flexShrink: 1,
                  }}
                  numberOfLines={2}
                >
                  {item}
                </Text>
              </View>
            ))}

            {/* View Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#4CAF50",
                paddingHorizontal: 24, // wider
                paddingVertical: 6, // same height
                borderRadius: 16,
                alignSelf: "flex-start",
                marginTop: 8,
              }}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                View
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right Image Section */}
          <Image
            source={{ uri: cardData.imgUrl }}
            style={{
              flex: 1,
              height: "100%",
              borderRadius: 8,
            }}
            resizeMode="cover"
          />
        </View>
      </LinearGradient>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "85%",
              padding: 20,
            }}
          >
            {/* Close Icon */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ alignSelf: "flex-end" }}
            >
              <Icon name="x" size={24} color="#000" />
            </TouchableOpacity>

            <ScrollView>
              {/* Large Main Image */}
              <Image
                source={{ uri: cardData.imgUrl }}
                style={{
                  width: "100%",
                  height: 320, // taller than before
                  borderRadius: 10,
                  marginBottom: 12,
                }}
                resizeMode="cover"
              />

              {/* Carousel for Other Images */}
              {cardData.otherImages && cardData.otherImages.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 8,
                    }}
                  >
                    More Images
                  </Text>
                  <FlatList
                    data={cardData.otherImages}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        style={{
                          width: 140,
                          height: 140,
                          borderRadius: 10,
                          marginRight: 10,
                        }}
                        resizeMode="cover"
                      />
                    )}
                  />
                </View>
              )}

              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                {cardData.title}
              </Text>

              {/* All Description Items */}
              {cardData.descItems.map((item: string, idx: number) => (
                <Text
                  key={idx}
                  style={{
                    fontSize: 14,
                    color: "#444",
                    marginBottom: 6,
                  }}
                >
                  • {item}
                </Text>
              ))}

              {/* Price & Sessions */}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 10,
                }}
              >
                Price: ₹{cardData.price}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#666",
                  marginTop: 5,
                }}
              >
                Sessions: {cardData.sessionCount}
              </Text>

              {/* Add to Cart */}
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  backgroundColor: theme.colors.primary, // Use your theme's primary color
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 50, // Fully rounded
                  alignItems: "center",
                }}
                onPress={addingIntoToCart}
              >
                {cartLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#000", fontWeight: "bold" }}>
                    Confirm & Add to Cart
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
