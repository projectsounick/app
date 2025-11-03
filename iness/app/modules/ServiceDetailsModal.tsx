import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

interface PlanModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  addingIntoToCart: () => void;
  cartLoading: boolean;
  cardData?: ServiceDetails | null;
}

export interface ServiceDetails {
  _id: string;
  title: string;
  descItems: string[];
  imgUrl: string;
  otherImages: string[];
  price: number;
  sessionCount: number;
  isActive: boolean;
  isCorporate: boolean;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function PlanModal({
  modalVisible,
  setModalVisible,
  addingIntoToCart,
  cartLoading,
  cardData,
}: PlanModalProps) {
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
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "80%",
            paddingTop: 10,
            paddingHorizontal: 20,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 50,
              height: 6,
              backgroundColor: "#ccc",
              borderRadius: 3,
              alignSelf: "center",
              marginBottom: "10%",
            }}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              position: "absolute",
              top: 14,
              right: 16,
              zIndex: 10,
              backgroundColor: "#f2f2f2",
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name="x" size={20} color="#333" />
          </TouchableOpacity>

          {/* Scrollable content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {cardData ? (
              <>
                {/* Title */}

                {/* Plan Card */}
                <View
                  style={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  {/* Left Info */}
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "700",
                        textAlign: "left",
                        marginBottom: 20,
                        color: "#000",
                      }}
                    >
                      {cardData.title}
                    </Text>
                    {cardData.descItems.length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <Icon
                          name="check-circle"
                          size={16}
                          color="#67C694"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ color: "#333", flex: 1 }}>
                          {cardData.descItems[0]}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Right Image */}
                  {cardData.imgUrl ? (
                    <Image
                      source={{ uri: cardData.imgUrl }}
                      style={{
                        width: 110,
                        height: 150,
                        resizeMode: "cover",
                        borderRadius: 12,
                      }}
                    />
                  ) : null}
                </View>

                {/* Top Stat Boxes */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#736AD6",
                      padding: 12,
                      borderRadius: 12,
                      flex: 1,
                      marginRight: 10,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="activity" size={20} color="#fff" />
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        marginTop: 4,
                        color: "#fff",
                      }}
                    >
                      {cardData.sessionCount}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      Sessions
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: "#736AD6",
                      padding: 12,
                      borderRadius: 12,
                      flex: 1,
                      marginLeft: 10,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="tag" size={20} color="#fff" />
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        marginTop: 4,
                        color: "#fff",
                      }}
                    >
                      ₹{cardData.price}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 12 }}>Price</Text>
                  </View>
                </View>

                {/* Inside the Plan */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 16,
                      marginBottom: 10,
                    }}
                  >
                    Inside the plan
                  </Text>
                  {cardData.descItems.map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Icon
                        name="check"
                        size={16}
                        color="#67C694"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ color: "#333", flex: 1 }}>{item}</Text>
                    </View>
                  ))}
                </View>

                {/* Other Images */}
                {cardData.otherImages?.length > 0 && (
                  <View>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 16,
                        marginBottom: 10,
                      }}
                    >
                      More Images
                    </Text>
                    <FlatList
                      horizontal
                      data={cardData.otherImages}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <Image
                          source={{ uri: item }}
                          style={{
                            width: 100,
                            height: 100,
                            marginRight: 10,
                            borderRadius: 12,
                            resizeMode: "contain",
                          }}
                        />
                      )}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                )}
              </>
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: 16,
                  marginVertical: 40,
                }}
              >
                No plan available
              </Text>
            )}
          </ScrollView>

          {/* Fixed Bottom Button */}
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderTopWidth: 1,
              borderColor: "#eee",
            }}
          >
            <TouchableOpacity
              onPress={addingIntoToCart}
              style={{
                borderRadius: 30,
                backgroundColor: "#67C694",
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
              activeOpacity={0.9}
            >
              <Icon
                name="shopping-cart"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {cartLoading ? "Adding..." : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
