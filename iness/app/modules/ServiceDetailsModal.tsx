import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import theme from "../Theme/globalTheme";

interface CardData {
  imgUrl: string;
  otherImages?: string[];
  title: string;
  descItems: string[];
  price: number;
  sessionCount: number;
}

interface CustomModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  cardData: CardData;
  addingIntoToCart: () => void;
  cartLoading: boolean;
}

export default function CustomModal({
  modalVisible,
  setModalVisible,
  cardData,
  addingIntoToCart,
  cartLoading,
}: CustomModalProps) {
  return (
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
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <LinearGradient
          colors={["#3D0E7B", "#000000"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "88%",
            padding: 20,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 50,
              height: 5,
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          {/* Close button */}
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="x" size={20} color="#fff" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Main Image */}
            <Image
              source={{ uri: cardData.imgUrl }}
              style={{
                width: "100%",
                height: 260,
                borderRadius: 14,
                marginBottom: 18,
              }}
              resizeMode="contain"
            />

            {/* More Images */}
            {cardData &&
              cardData?.otherImages &&
              cardData.otherImages.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 10,
                      color: "#fff",
                    }}
                  >
                    More Images
                  </Text>
                  <FlatList
                    data={cardData.otherImages}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 12,
                          marginRight: 10,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.1)",
                        }}
                        resizeMode="contain"
                      />
                    )}
                  />
                </View>
              )}

            {/* Title */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 14,
                color: "#fff",
              }}
            >
              {cardData.title}
            </Text>

            {/* Price & Sessions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name="tag"
                  size={18}
                  color="#BDFF84"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{ fontSize: 17, fontWeight: "600", color: "#fff" }}
                >
                  ₹{cardData.price}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name="calendar"
                  size={16}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {cardData.sessionCount} Sessions
                </Text>
              </View>
            </View>

            {/* Description Items */}
            {cardData.descItems.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#BDFF84",
                    marginRight: 8,
                    lineHeight: 20,
                  }}
                >
                  •
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 20,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={addingIntoToCart}
              style={{
                marginTop: 26,
                borderRadius: 30,
                overflow: "hidden",
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#BDFF84", "#89E665"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 30,
                }}
              >
                {cartLoading ? (
                  <ActivityIndicator color={theme.colors.dark} />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      name="shopping-cart"
                      size={18}
                      color={theme.colors.dark}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: theme.colors.dark,
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      Confirm & Add to Cart
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}
