import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const { height } = Dimensions.get("window");

const tabNames = ["Certificates", "Policy", "Citations", "About"] as const;
type TabType = (typeof tabNames)[number];

const CERTIFICATE_BASE_URL =
  "https://inessstorage.blob.core.windows.net/documents-container/";

const certificates = [
  { id: 1, url: `${CERTIFICATE_BASE_URL}certificate1.jpeg` },
  { id: 2, url: `${CERTIFICATE_BASE_URL}certificate2.jpeg` },
  { id: 3, url: `${CERTIFICATE_BASE_URL}certificate3.jpeg` },
  { id: 4, url: `${CERTIFICATE_BASE_URL}certificate4.jpeg` },
  { id: 5, url: `${CERTIFICATE_BASE_URL}certificate5.jpeg` },
];

const policies = [
  {
    title: "Privacy Policy",
    icon: "shield-lock-outline",
    content:
      "We respect your privacy. All your data including name, email, and health/activity details are stored securely and never shared with third parties without consent. We comply with Indian data protection laws including the Information Technology Act, 2000.",
  },
  {
    title: "Data Usage",
    icon: "chart-line",
    content:
      "Your data is used to improve your experience and provide personalized health insights. We may analyze usage patterns anonymously to improve our services.",
  },
  {
    title: "Security",
    icon: "shield-check-outline",
    content:
      "We implement industry-standard security protocols to protect your data from unauthorized access or breaches. This includes encrypted data transmission and secure cloud storage.",
  },
  {
    title: "User Responsibilities",
    icon: "account-check-outline",
    content:
      "Users are responsible for maintaining the confidentiality of their login credentials and providing accurate personal information. Misuse of the platform may lead to termination of access.",
  },
  {
    title: "Contact & Grievances",
    icon: "email-outline",
    content:
      "If you have any concerns or grievances, please reach out to us at ",
    email: "founder@iness.fitness",
  },
  {
    title: "Changes to Policy",
    icon: "file-document-edit-outline",
    content:
      "This policy may be updated from time to time. Users will be notified via in-app alerts. Continued use of the app constitutes acceptance of the updated policy.",
  },
  {
    title: "Changes to Policy",
    icon: "file-document-edit-outline",
    content:
      "This policy may be updated from time to time. Users will be notified via in-app alerts. Continued use of the app constitutes acceptance of the updated policy.",
  },
  {
    title: "Payment Terms & Conditions",
    icon: "credit-card-outline",
    content:
      "All payments are processed securely through Razorpay Payment Gateway. By making a payment, you agree to our payment terms. All transactions are subject to verification and may be declined at our discretion. You are responsible for ensuring sufficient funds are available for transactions.",
  },
  {
    title: "Payment Gateway - Razorpay",
    icon: "bank-outline",
    content:
      "We use Razorpay Payment Gateway to process all payments. Razorpay supports multiple payment methods including UPI, Credit/Debit Cards, Net Banking, wallets, and other supported payment options. All payment data is encrypted and processed securely. Razorpay follows industry-standard security and PCI DSS practices for payment processing.",
  },
  {
    title: "Transaction Security",
    icon: "lock-outline",
    content:
      "All payment transactions are secured using industry-standard encryption protocols. Your payment information is processed securely through Razorpay's payment infrastructure. We do not store your complete payment card details or UPI PIN on our servers. All sensitive payment data is handled by Razorpay in line with applicable payment security requirements.",
  },
  {
    title: "Payment Processing",
    icon: "cash-multiple",
    content:
      "Payments are processed in real-time. Upon successful payment, you will receive a confirmation. Failed transactions will be automatically reversed to your original payment method within 5-7 business days depending on the issuing bank and payment method. Transaction limits may apply as per Razorpay and your bank's policies. All amounts are displayed in Indian Rupees (INR).",
  },
  {
    title: "Refund & Cancellation",
    icon: "cash-refund",
    content:
      "Refund requests must be made within 24 hours of purchase. No refunds will be processed once a plan has started or content has been accessed. Refunds will be processed to the original payment method within 7-10 business days. For payment-related disputes, please contact support@iness.fitness with your transaction ID.",
  },
  {
    title: "Payment Disputes & Grievances",
    icon: "alert-circle-outline",
    content:
      "For any payment-related issues, disputes, or unauthorized transactions, please contact our Grievance Officer at support@iness.fitness immediately with transaction details. We will investigate and resolve disputes in accordance with applicable guidelines. You may also contact Razorpay support for payment gateway related issues.",
  },
];

const citations = [
  {
    title: "BMI (Body Mass Index) Formula",
    icon: "scale-bathroom",
    description:
      "The BMI calculation uses the standard formula recommended by the World Health Organization (WHO) to estimate body fat based on height and weight.",
    formula: "BMI = weight (kg) / height (m)²",
    source: "World Health Organization",
    url: "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations",
    additionalInfo:
      "WHO provides global standards for BMI categories: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), and Obese (≥30).",
  },
  {
    title: "BMR (Basal Metabolic Rate) Formula",
    icon: "fire",
    description:
      "The BMR calculation uses the Mifflin-St Jeor Equation, which is considered one of the most accurate BMR estimation formulas.",
    formula:
      "Male: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5\nFemale: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161",
    source: "Mifflin MD, St Jeor ST, Hill LA, et al. (1990)",
    url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
    additionalInfo:
      "Published in the American Journal of Clinical Nutrition. This equation was developed from a large sample size and is widely used in clinical settings.",
  },
  {
    title: "10,000 Steps Per Day",
    icon: "shoe-sneaker",
    description:
      "The 10,000 steps per day goal is a widely recognized physical activity target. While this is a general guideline, individual needs may vary based on age, health status, and fitness level.",
    formula: "Daily Goal: 10,000 steps",
    source: "Centers for Disease Control and Prevention (CDC)",
    url: "https://www.cdc.gov/physicalactivity/basics/adults/index.htm",
    additionalInfo:
      "CDC recommends at least 150 minutes of moderate-intensity aerobic activity per week. The 10,000 steps goal is approximately equivalent to 30 minutes of daily walking.",
  },
  {
    title: "Sleep Duration Recommendations",
    icon: "sleep",
    description:
      "Sleep requirements vary by age and individual needs. The National Sleep Foundation provides evidence-based recommendations for optimal sleep duration.",
    formula:
      "Adults (18-64 years): 7-9 hours per night\nOlder Adults (65+): 7-8 hours per night",
    source: "National Sleep Foundation",
    url: "https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need",
    additionalInfo:
      "Sleep needs are individual and can be influenced by factors such as health conditions, activity level, and lifestyle.",
  },
  {
    title: "Daily Water Intake",
    icon: "water",
    description:
      "Adequate hydration is essential for health. Water intake needs vary based on age, sex, activity level, climate, and overall health.",
    formula: "General Guideline: 8-10 glasses (2-2.5 liters) per day",
    source: "National Academies of Sciences, Engineering, and Medicine",
    url: "https://www.nationalacademies.org/news/2004/02/report-sets-dietary-intake-levels-for-water-salt-and-potassium-to-maintain-health-and-reduce-chronic-disease-risk",
    additionalInfo:
      "The National Academies recommend about 3.7 liters for men and 2.7 liters for women daily, including water from all beverages and foods.",
  },
];

const additionalResources = [
  {
    title: "WHO - Obesity and Overweight",
    url: "https://www.who.int/health-topics/obesity",
  },
  {
    title: "CDC - About Adult BMI",
    url: "https://www.cdc.gov/healthyweight/assessing/bmi/index.html",
  },
  {
    title: "NIH - Metabolic Rate Research",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4207053/",
  },
];

export default function AdditionalInfoScreen() {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const [selectedTab, setSelectedTab] = useState<TabType>("Certificates");
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

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch((err) =>
      console.error("Failed to open email:", err)
    );
  };

  const openCitation = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  const renderCertificatesContent = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
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
        <>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#9747FF" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Verified Credentials</Text>
              <Text style={styles.infoSubtitle}>
                All our trainers are certified professionals
              </Text>
            </View>
          </View>

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
                    <View style={styles.labelContainer}>
                      <MaterialCommunityIcons name="certificate" size={14} color="#9747FF" />
                      <Text style={styles.labelText}>Certificate {cert.id}</Text>
                    </View>
                    <View style={styles.expandIcon}>
                      <Ionicons name="expand-outline" size={18} color="#9747FF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <View style={styles.errorIconContainer}>
                      <MaterialCommunityIcons name="file-document-outline" size={28} color="#9747FF" />
                    </View>
                    <Text style={styles.errorText}>Certificate {cert.id}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderPolicyContent = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <MaterialCommunityIcons name="scale-balance" size={20} color="#9747FF" />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Terms & Policies</Text>
          <Text style={styles.infoSubtitle}>
            Please review our policies carefully
          </Text>
        </View>
      </View>

      {policies.map((policy, index) => (
        <View key={index} style={styles.policyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={policy.icon as any}
                size={20}
                color={theme.colors.secondPrimary}
              />
            </View>
            <Text style={styles.cardTitle}>{policy.title}</Text>
          </View>
          <Text style={styles.cardContent}>
            {policy.content}
            {policy.email && (
              <Text
                style={styles.emailLink}
                onPress={() => openEmail(policy.email!)}
              >
                {policy.email}
              </Text>
            )}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderCitationsContent = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.disclaimerCard}>
        <View style={styles.disclaimerHeader}>
          <View style={styles.disclaimerIconContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
          </View>
          <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
        </View>
        <Text style={styles.disclaimerText}>
          The health calculations and information provided in this app are
          for informational and educational purposes only. They are not
          intended to be a substitute for professional medical advice,
          diagnosis, or treatment. Always seek the advice of your physician.
        </Text>
      </View>

      {citations.map((citation, index) => (
        <View key={index} style={styles.citationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={citation.icon as any} size={18} color={isDark ? theme.colors.text : "#9747FF"} />
            </View>
            <Text style={styles.cardTitle}>{citation.title}</Text>
          </View>
          <Text style={styles.cardContent}>{citation.description}</Text>
          <View style={styles.formulaContainer}>
            <Text style={styles.formulaText}>{citation.formula}</Text>
          </View>
          <Text style={styles.sourceText}>
            <Text style={styles.sourceLabel}>Source: </Text>
            {citation.source}
          </Text>
          {citation.additionalInfo && (
            <Text style={styles.additionalInfo}>
              {citation.additionalInfo}
            </Text>
          )}
          <TouchableOpacity
            onPress={() => openCitation(citation.url)}
            style={styles.sourceButton}
          >
            <Ionicons name="globe-outline" size={14} color={isDark ? theme.colors.text : "#9747FF"} />
            <Text style={styles.sourceTextLink}>{citation.source}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.citationCard}>
        <View style={styles.cardHeader}>
          <View style={styles.resourceIconContainer}>
            <MaterialCommunityIcons name="bookshelf" size={18} color="#67C694" />
          </View>
          <Text style={styles.cardTitle}>Additional Resources</Text>
        </View>

        {additionalResources.map((resource, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openCitation(resource.url)}
            style={styles.resourceItem}
          >
            <View style={styles.resourceItemIcon}>
              <Ionicons name="globe-outline" size={14} color={isDark ? theme.colors.text : "#9747FF"} />
            </View>
            <Text style={styles.resourceItemText}>{resource.title}</Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? theme.colors.textMuted : "#999"} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderAboutContent = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentCard}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text style={styles.title}>Welcome to Iness</Text>
          <Image
            source={require("../../../assets/images/logowithoutbackground.png")}
            style={{
              width: 50,
              height: 50,
              resizeMode: "contain",
            }}
          />
        </View>
        <Text style={styles.paragraph}>
          Iness is a comprehensive wellness platform dedicated to helping you
          achieve your health and fitness goals. We provide personalized workout
          plans, diet guidance, expert trainer support, and a community of
          like-minded individuals on their wellness journey.
        </Text>

        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.paragraph}>
          To empower individuals to lead healthier, happier lives through
          accessible, personalized, and science-backed wellness solutions.
        </Text>

        <Text style={styles.sectionTitle}>What We Offer</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>
              Customized workout plans tailored to your fitness level and goals
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>
              Expert nutrition guidance and meal planning
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>
              One-on-one sessions with certified trainers
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>
              Progress tracking and analytics
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>
              Community support and motivation
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Our Commitment</Text>
        <Text style={styles.paragraph}>
          We are committed to providing you with the highest quality wellness
          services, backed by scientific research and delivered by experienced
          professionals. Your health and well-being are our top priorities.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions, feedback, or need support, please don't
          hesitate to reach out to us at{" "}
          <Text
            style={styles.emailLink}
            onPress={() => openEmail("founder@iness.fitness")}
          >
            founder@iness.fitness
          </Text>
          . We're here to help you on your wellness journey.
        </Text>
      </View>
    </ScrollView>
  );

  const topPadding = height * 0.05;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["left", "right"]}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <View
            style={{
              paddingHorizontal: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Additional Information" />
          </View>

          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {tabNames.map((tab) => {
                const isSelected = selectedTab === tab;
                const color = isSelected
                  ? { bg: theme.colors.success, text: theme.colors.textWhite }
                  : { bg: "transparent", text: theme.colors.textSecondary };

                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setSelectedTab(tab)}
                    style={[
                      styles.tabButton,
                      {
                        backgroundColor: color.bg,
                        shadowColor: isSelected ? color.bg : "transparent",
                        shadowOffset: { width: 0, height: isSelected ? 2 : 0 },
                        shadowOpacity: isSelected ? 0.3 : 0,
                        shadowRadius: isSelected ? 4 : 0,
                        elevation: isSelected ? 3 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color: color.text,
                        },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                    >
                      {tab}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            {selectedTab === "Certificates" && renderCertificatesContent()}
            {selectedTab === "Policy" && renderPolicyContent()}
            {selectedTab === "Citations" && renderCitationsContent()}
            {selectedTab === "About" && renderAboutContent()}
          </View>

          {/* Image Modal */}
          <Modal
            visible={selectedImage !== null}
            transparent={true}
            animationType="fade"
            onRequestClose={closeImageModal}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                onPress={closeImageModal}
                activeOpacity={0.8}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
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
            </View>
          </Modal>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontWeight: "700",
    fontSize: SCREEN_WIDTH < 375 ? 11 : (SCREEN_WIDTH < 414 ? 12 : 13),
    fontFamily: theme.fonts.bold,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
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
    borderTopColor: theme.colors.border,
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
    fontWeight: theme.fontWeights.medium as "500",
    textAlign: "center",
    fontFamily: theme.fonts.medium,
  },
  policyCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: theme.fontSizes.regular,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  cardContent: {
    fontSize: theme.fontSizes.regularSmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  emailLink: {
    color: theme.colors.secondPrimary,
    textDecorationLine: "underline",
    fontFamily: theme.fonts.medium,
  },
  disclaimerCard: {
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
    borderColor: theme.colors.errorLight,
  },
  disclaimerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  disclaimerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.errorLight || theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  disclaimerTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.error,
    fontFamily: theme.fonts.bold,
  },
  disclaimerText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    fontFamily: theme.fonts.regular,
  },
  citationCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...(isDark ? {} : {
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }),
  },
  formulaContainer: {
    backgroundColor: theme.colors.backgroundCardLight,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  formulaText: {
    fontSize: theme.fontSizes.small,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: isDark ? theme.colors.text : theme.colors.secondPrimary,
    lineHeight: 16,
  },
  sourceText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontFamily: theme.fonts.regular,
  },
  sourceLabel: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  additionalInfo: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textMuted,
    lineHeight: 16,
    fontStyle: "italic",
    marginBottom: 10,
    fontFamily: theme.fonts.regular,
  },
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  sourceTextLink: {
    fontSize: theme.fontSizes.small,
    color: isDark ? theme.colors.text : theme.colors.secondPrimary,
    fontFamily: theme.fonts.medium,
    marginLeft: 6,
    textDecorationLine: "underline",
  },
  resourceIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 10,
    marginBottom: 8,
  },
  resourceItemIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  resourceItemText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  contentCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: theme.fontWeights.bold as "700",
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    lineHeight: 24,
    marginBottom: 8,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.secondPrimary,
    marginTop: 8,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: theme.fontSizes.regular,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    lineHeight: 24,
  },
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
});
