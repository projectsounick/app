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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={require("../../../assets/images/basicBackground.jpg")}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f2f2f2" }}
          edges={["left", "right"]}
        >
          {/* Header */}
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: Platform.OS === "ios" ? "12%" : "4%",
            }}
          >
            <NormalHeader screenName="Our Certificates" />
          </View>

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: "#F0F0F0",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="ribbon-outline" size={40} color="#999" />
              </View>
              <Text
                style={{
                  color: "#666",
                  fontSize: 16,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                No certificates available.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 20,
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
                    activeOpacity={0.8}
                    onPress={() => openImageModal(cert.url)}
                    style={{
                      width: (SCREEN_WIDTH - 48) / 2,
                      height: 220,
                      marginBottom: 16,
                      borderRadius: 20,
                      backgroundColor: "#FFFFFF",
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: "#F5F5F5",
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

                        {/* Certificate Label */}
                        <View
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontSize: 13,
                              fontWeight: "600",
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
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: "rgba(255,255,255,0.95)",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          <Ionicons name="expand-outline" size={20} color="#9747FF" />
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
                          padding: 16,
                        }}
                      >
                        <View
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            backgroundColor: "#F0F0F0",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 12,
                          }}
                        >
                          <Ionicons name="document-outline" size={32} color="#999" />
                        </View>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#666",
                            fontWeight: "600",
                            textAlign: "center",
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
          )}
        </SafeAreaView>
      </ImageBackground>

      {/* Full Screen Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View
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
              top: Platform.OS === "ios" ? 50 : 30,
              right: 20,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#F0F0F0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={20} color="#000" />
          </TouchableOpacity>

          {/* Image Container */}
          {selectedImage && (
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
                }}
                resizeMode="contain"
              />
            </ScrollView>
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
              paddingVertical: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              Tap to close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
