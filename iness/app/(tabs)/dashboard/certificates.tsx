import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  ImageBackground,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const topPadding = SCREEN_HEIGHT * 0.05;

const CERTIFICATE_BASE_URL = "https://inessstorage.blob.core.windows.net/documents-container/";

const certificates = [
  { id: 1, url: `${CERTIFICATE_BASE_URL}certificate1.jpeg` },
  { id: 2, url: `${CERTIFICATE_BASE_URL}certificate2.jpeg` },
  { id: 3, url: `${CERTIFICATE_BASE_URL}certificate3.jpeg` },
  { id: 4, url: `${CERTIFICATE_BASE_URL}certificate4.jpeg` },
  { id: 5, url: `${CERTIFICATE_BASE_URL}certificate5.jpeg` },
];

export default function CertificatesScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const handleImageError = (id: number) => {
    setImageError((prev) => ({ ...prev, [id]: true }));
  };

  const openImageModal = (url: string) => {
    setSelectedImage(url);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f2f2f2" }}
      edges={[ "left", "right"]}
    >
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        resizeMode="cover"
        style={{
          flex: 1,
          justifyContent: "flex-start",
          backgroundColor: "#000",
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingLeft: 20,
            marginTop: Platform.OS === "ios" ? topPadding : "4%",
          }}
        >
          <NormalHeader screenName="Our Certificates" />
        </View>

        {/* Certificates Grid */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {certificates.map((cert) => (
              <TouchableOpacity
                key={cert.id}
                activeOpacity={0.9}
                onPress={() => openImageModal(cert.url)}
                style={{
                  width: (SCREEN_WIDTH - 60) / 2,
                  height: 200,
                  marginBottom: 20,
                  borderRadius: 15,
                  backgroundColor: theme.colors.cardLight,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: theme.colors.cardLight,
                }}
              >
                {!imageError[cert.id] ? (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#F8F8F8",
                      position: "relative",
                    }}
                  >
                    <Image
                      source={{ uri: cert.url }}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      resizeMode="contain"
                      onError={() => handleImageError(cert.id)}
                    />

                    {/* Gradient Overlay */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 70,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "flex-end",
                        paddingBottom: 12,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 13,
                          fontWeight: "600",
                          fontFamily: theme.fonts.medium,
                        }}
                      >
                        Certificate {cert.id}
                      </Text>
                    </View>

                    {/* Expand Icon */}
                    <View
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: "rgba(255,255,255,0.95)",
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                    >
                      <Ionicons name="expand" size={22} color="#9747FF" />
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#F8F8F8",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="document" size={50} color="#999" />
                    <Text
                      style={{
                        marginTop: 12,
                        fontSize: 14,
                        color: "#666",
                        fontWeight: "600",
                        fontFamily: theme.fonts.medium,
                      }}
                    >
                      Certificate {cert.id}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>

      {/* Full Screen Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeImageModal}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={closeImageModal}
            activeOpacity={0.8}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Image Container */}
          {selectedImage && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT * 0.85,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ScrollView
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 20,
                }}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT * 0.85,
                    resizeMode: "contain",
                  }}
                />
              </ScrollView>
            </TouchableOpacity>
          )}

          {/* Tap to close hint */}
          <TouchableOpacity
            onPress={closeImageModal}
            activeOpacity={0.7}
            style={{
              position: "absolute",
              bottom: 40,
              alignSelf: "center",
              backgroundColor: "rgba(255,255,255,0.15)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "500" }}>
              Tap to close
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

