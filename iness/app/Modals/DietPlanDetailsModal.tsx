import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DietPlanDetails, DietPlan } from "../interfaces/planInterface";
import { LinearGradient } from "expo-linear-gradient";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import theme from "../Theme/globalTheme";

interface DietPlanDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  dietPlan: DietPlanDetails | DietPlan | null;
  dietPlanUrl?: string;
  dietPlanAssignDate?: string;
}

const DietPlanDetailsModal: React.FC<DietPlanDetailsModalProps> = ({
  visible,
  onClose,
  dietPlan,
  dietPlanUrl,
  dietPlanAssignDate,
}) => {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showAllDescItems, setShowAllDescItems] = useState(false);

  if (!dietPlan) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleViewDietPlan = () => {
    if (dietPlanUrl) {
      setShowPdfViewer(true);
    }
  };

  const handleDownload = async () => {
    if (!dietPlanUrl) return;

    try {
      setDownloading(true);
      const urlParts = dietPlanUrl.split("/");
      const fileName = urlParts[urlParts.length - 1] || `diet-plan-${Date.now()}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(dietPlanUrl, fileUri);

      if (downloadResult.status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: "application/pdf",
            dialogTitle: "Your Diet Plan",
          });
        } else {
          Alert.alert("Success", "Diet plan downloaded successfully!");
        }
      } else {
        throw new Error("Download failed");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to download diet plan. Please try again.");
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    setPdfLoading(false);
  };

  const handleClose = () => {
    setShowPdfViewer(false);
    setPdfLoading(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </Pressable>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Header */}
            {dietPlan.imgUrl && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: dietPlan.imgUrl }}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>{dietPlan.title}</Text>

            {/* Duration and Assigned Date - Side by Side Cards */}
            <View style={styles.durationRowContainer}>
              {/* Duration Card */}
              <View style={styles.durationCard}>
                <Ionicons name="time-outline" size={16} color="#9747FF" />
                <Text style={styles.durationText}>
                  Duration: {dietPlan.duration} {dietPlan.durationType}
                  {dietPlan.duration > 1 ? "s" : ""}
                </Text>
              </View>
              
              {/* Assigned Date Card */}
              {dietPlanAssignDate && (
                <View style={styles.assignedCard}>
                  <Ionicons name="calendar-outline" size={16} color="#9747FF" />
                  <Text style={styles.assignedText}>
                    Assigned: {formatDate(dietPlanAssignDate)}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {dietPlan.desc && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="document-text-outline" size={20} color="#9747FF" />
                  </View>
                  <Text style={styles.sectionTitle}>Description</Text>
                </View>
                <Text style={styles.descriptionText}>{dietPlan.desc}</Text>
              </View>
            )}

            {/* Description Items */}
            {dietPlan.descItems && dietPlan.descItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="leaf" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.sectionTitle}>Plan Highlights</Text>
                </View>

                {(showAllDescItems ? dietPlan.descItems : dietPlan.descItems.slice(0, 3)).map((item, idx) => (
                  <View key={idx} style={styles.descItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.descText}>{item}</Text>
                  </View>
                ))}

                {dietPlan.descItems.length > 3 && (
                  <TouchableOpacity
                    onPress={() => setShowAllDescItems(!showAllDescItems)}
                    style={styles.showMoreButton}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllDescItems ? "Show Less" : "Show More"}
                    </Text>
                    <Ionicons
                      name={showAllDescItems ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#67C694"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Price if available */}
            {dietPlan.price && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price:</Text>
                <Text style={styles.priceValue}>₹{dietPlan.price}</Text>
              </View>
            )}


            {/* View Diet Plan Button (Main Green Button) */}
            {dietPlanUrl && (
              <TouchableOpacity
                onPress={handleViewDietPlan}
                activeOpacity={0.8}
                style={styles.viewDietPlanButton}
              >
                <Text style={styles.viewDietPlanButtonText}>
                  View Diet Plan
                </Text>
              </TouchableOpacity>
            )}

            {/* Download Icon Button (Icon Only) */}
            {dietPlanUrl && (
              <TouchableOpacity
                onPress={handleDownload}
                activeOpacity={0.8}
                style={styles.downloadIconButton}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <Ionicons
                    name="cloud-download-outline"
                    size={24}
                    color="#666"
                  />
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>

      {/* PDF Viewer Modal */}
      {showPdfViewer && dietPlanUrl && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showPdfViewer}
          onRequestClose={handleClosePdfViewer}
        >
          <View style={styles.pdfViewerContainer}>
            {/* Header */}
            <View style={styles.pdfViewerHeader}>
              <Pressable onPress={handleClosePdfViewer} style={styles.pdfCloseButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </Pressable>
              <Text style={styles.pdfViewerTitle}>Diet Plan</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* WebView */}
            <View style={styles.webViewContainer}>
              <WebView
                source={{ uri: dietPlanUrl }}
                style={styles.webView}
                onLoadStart={() => setPdfLoading(true)}
                onLoadEnd={() => setPdfLoading(false)}
              />
              {pdfLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#67C694" />
                  <Text style={styles.loadingText}>Loading diet plan...</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.cardLight,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: "100%",
    minHeight: 200,
    maxHeight: 300,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.dark,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: theme.fonts.bold,
  },
  durationRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    gap: 12,
    flexWrap: "wrap",
  },
  durationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cardLight,
    borderRadius: 20,
    flex: 1,
    minWidth: "45%",
  },
  durationText: {
    fontSize: 12,
    color: theme.colors.secondPrimary,
    fontWeight: theme.fontWeights.medium,
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
    flex: 1,
  },
  assignedCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cardLight,
    borderRadius: 20,
    flex: 1,
    minWidth: "45%",
  },
  assignedText: {
    fontSize: 12,
    color: theme.colors.secondPrimary,
    fontWeight: theme.fontWeights.medium,
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.dark,
    fontFamily: theme.fonts.bold,
  },
  descItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondPrimary,
    marginRight: 12,
    marginTop: 6,
  },
  descText: {
    flex: 1,
    fontSize: theme.fontSizes.regularSmall,
    color: "#666",
    lineHeight: 20,
    fontWeight: theme.fontWeights.regular,
    fontFamily: theme.fonts.regular,
  },
  descriptionText: {
    fontSize: theme.fontSizes.regularSmall,
    color: "#666",
    lineHeight: 22,
    fontWeight: theme.fontWeights.regular,
    fontFamily: theme.fonts.regular,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  priceValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.secondPrimary,
    fontFamily: theme.fonts.bold,
  },
  infoContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.cardLight,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: theme.fontSizes.regularSmall,
    color: "#666",
    fontWeight: theme.fontWeights.medium,
    marginLeft: 8,
    fontFamily: theme.fonts.medium,
  },
  infoValue: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.dark,
    fontWeight: theme.fontWeights.semiBold,
    fontFamily: theme.fonts.semiBold,
  },
  viewDietPlanButton: {
    marginTop: 20,
    marginBottom: 12,
    backgroundColor: "#67C694",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  viewDietPlanButtonText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold,
    color: "#fff",
    fontFamily: theme.fonts.bold,
  },
  downloadIconButton: {
    alignSelf: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pdfViewerContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pdfViewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pdfCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  pdfViewerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#67C694",
    marginRight: 4,
  },
});

export default DietPlanDetailsModal;

