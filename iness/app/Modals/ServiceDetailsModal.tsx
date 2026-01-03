import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
const { width: screenWidth } = Dimensions.get("window");

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
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
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
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "#F8F8F8",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "85%",
            paddingTop: 8,
            paddingHorizontal: 0,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#D0D0D0",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              zIndex: 10,
              backgroundColor: "#FFFFFF",
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>

          {/* Scrollable content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
          >
            {cardData ? (
              <>
                {/* Title Card */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    {cardData.imgUrl ? (
                      <Image
                        source={{ uri: cardData.imgUrl }}
                        style={{
                          width: 100,
                          height: 100,
                          resizeMode: "contain",
                          borderRadius: 12,
                          marginRight: 16,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 100,
                          height: 100,
                          borderRadius: 12,
                          backgroundColor: "#F3EDFF",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 16,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="dumbbell"
                          size={40}
                          color="#9747FF"
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: "#F3EDFF",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name="fitness" size={18} color="#9747FF" />
                        </View>
                        <Text
                          style={{
                            fontSize: theme.fontSizes.large,
                            fontWeight: theme.fontWeights.bold as "700",
                            color: theme.colors.text,
                            flex: 1,
                          }}
                        >
                          {cardData.title}
                        </Text>
                      </View>
                      {cardData.descItems.length > 0 && (
                        <Text
                          style={{
                            color: theme.colors.textSecondary,
                            fontSize: theme.fontSizes.regularSmall,
                            lineHeight: 18,
                          }}
                          numberOfLines={2}
                        >
                          {cardData.descItems[0]}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Stat Boxes */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 16,
                      flex: 1,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#F3EDFF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name="calendar" size={20} color="#9747FF" />
                    </View>
                    <Text
                      style={{
                        fontWeight: theme.fontWeights.bold as "700",
                        fontSize: theme.fontSizes.large,
                        marginTop: 4,
                        color: theme.colors.secondPrimary,
                      }}
                    >
                      {cardData.sessionCount}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.small, marginTop: 2 }}>
                      Sessions
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: 16,
                      borderRadius: 16,
                      flex: 1,
                      alignItems: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#E8F5E9",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Ionicons name="pricetag" size={20} color="#67C694" />
                    </View>
                    <Text
                      style={{
                        fontWeight: theme.fontWeights.bold as "700",
                        fontSize: theme.fontSizes.large,
                        marginTop: 4,
                        color: theme.colors.success,
                      }}
                    >
                      ₹{cardData.price}
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.small, marginTop: 2 }}>
                      Price
                    </Text>
                  </View>
                </View>

                {/* Inside the Plan */}
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: "#F5F5F5",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#E8F5E9",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#67C694" />
                    </View>
                    <Text
                      style={{
                        fontWeight: theme.fontWeights.bold as "700",
                        fontSize: theme.fontSizes.medium,
                        color: theme.colors.text,
                      }}
                    >
                      What's Included
                    </Text>
                  </View>
                  {cardData.descItems.map((item, idx) => (
                    <View
                      key={idx}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 14,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: "#E8F5E9",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                          marginTop: 1,
                        }}
                      >
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color="#67C694"
                        />
                      </View>
                      <Text
                        style={{
                          color: theme.colors.text,
                          flex: 1,
                          fontSize: theme.fontSizes.regularSmall,
                          lineHeight: 22,
                          fontWeight: theme.fontWeights.medium as "500",
                        }}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Other Images */}
                {cardData.otherImages?.length > 0 && (
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 20,
                      padding: 20,
                      marginBottom: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "#F3EDFF",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons name="images" size={18} color="#9747FF" />
                      </View>
                      <Text
                        style={{
                          fontWeight: theme.fontWeights.bold as "700",
                          fontSize: theme.fontSizes.medium,
                          color: theme.colors.text,
                        }}
                      >
                        Gallery
                      </Text>
                    </View>
                    <FlatList
                      horizontal
                      data={cardData.otherImages}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <View
                          style={{
                            marginRight: 12,
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: "#F8F8F8",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <Image
                            source={{ uri: item }}
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: 12,
                              resizeMode: "contain",
                            }}
                          />
                        </View>
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
                  color: theme.colors.textMuted,
                  fontSize: theme.fontSizes.regular,
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
              backgroundColor: "#FFFFFF",
              padding: 16,
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderColor: "#F5F5F5",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <TouchableOpacity
              onPress={addingIntoToCart}
              style={{
                borderRadius: 30,
                backgroundColor: "#67C694",
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                shadowColor: "#67C694",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cart"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: theme.colors.textWhite,
                  fontWeight: theme.fontWeights.bold as "700",
                  fontSize: theme.fontSizes.regular,
                }}
              >
                {cartLoading ? "Adding..." : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
