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
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CERTIFICATE_BASE_URL =
  "https://inessstorage.blob.core.windows.net/documents-container/";

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
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["left", "right"]}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <NormalHeader screenName="Our Certificates" />
        </View>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons
                name="certificate-outline"
                size={40}
                color="#9747FF"
              />
            </View>
            <Text style={styles.emptyTitle}>No certificates yet</Text>
            <Text style={styles.emptySubtitle}>
              Certificates will appear here once available
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color="#9747FF"
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Verified Credentials</Text>
                <Text style={styles.infoSubtitle}>
                  All our trainers are certified professionals
                </Text>
              </View>
            </View>

            {/* Certificates Grid */}
            <View style={styles.gridContainer}>
              {certificates.map((cert) => (
                <TouchableOpacity
                  key={cert.id}
                  activeOpacity={0.8}
                  onPress={() => openImageModal(cert.url)}
                  style={styles.certificateCard}
                >
                  {!imageError[cert.id] ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: cert.url }}
                        style={styles.certificateImage}
                        resizeMode="contain"
                        onError={() => handleImageError(cert.id)}
                      />

                      {/* Certificate Label */}
                      <View style={styles.labelContainer}>
                        <MaterialCommunityIcons
                          name="certificate"
                          size={14}
                          color="#9747FF"
                        />
                        <Text style={styles.labelText}>
                          Certificate {cert.id}
                        </Text>
                      </View>

                      {/* Expand Icon */}
                      <View style={styles.expandIcon}>
                        <Ionicons
                          name="expand-outline"
                          size={18}
                          color="#9747FF"
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.errorContainer}>
                      <View style={styles.errorIconContainer}>
                        <MaterialCommunityIcons
                          name="file-document-outline"
                          size={28}
                          color="#9747FF"
                        />
                      </View>
                      <Text style={styles.errorText}>Certificate {cert.id}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalOverlay}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={closeImageModal}
            activeOpacity={0.8}
            style={styles.modalCloseBtn}
          >
            <Ionicons name="close" size={20} color="#1A1A1A" />
          </TouchableOpacity>

          {/* Image Container */}
          {selectedImage && (
            <ScrollView
              contentContainerStyle={styles.modalImageContainer}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={{ uri: selectedImage }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </ScrollView>
          )}

          {/* Close hint */}
          <TouchableOpacity
            onPress={closeImageModal}
            activeOpacity={0.7}
            style={styles.modalHint}
          >
            <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
            <Text style={styles.modalHintText}>Tap to close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? "12%" : "4%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.bold,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textMuted,
    textAlign: "center",
    fontFamily: theme.fonts.regular,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fonts.bold,
  },
  infoSubtitle: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  certificateCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: 200,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.backgroundSecondary,
    position: "relative",
  },
  certificateImage: {
    width: "100%",
    height: "100%",
  },
  labelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  labelText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.small,
    fontWeight: "600",
    fontFamily: theme.fonts.medium,
  },
  expandIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: theme.fonts.medium,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
  },
  modalHint: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalHintText: {
    color: theme.colors.textWhite,
    fontSize: theme.fontSizes.small,
    fontWeight: "500",
    fontFamily: theme.fonts.medium,
  },
});
