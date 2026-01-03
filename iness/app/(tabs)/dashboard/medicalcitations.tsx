import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ImageBackground,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "@/app/Theme/globalTheme";

const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");

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

export default function MedicalCitationsScreen() {
  const openCitation = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["left", "right"]}
      >
        <View style={styles.headerContainer}>
          <NormalHeader screenName="Medical Citations" />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Disclaimer Card */}
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <View style={styles.disclaimerIconContainer}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color="#F44336"
                />
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

          {/* Citations */}
          {citations.map((citation, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={citation.icon as any}
                    size={18}
                    color="#9747FF"
                  />
                </View>
                <Text style={styles.cardTitle}>{citation.title}</Text>
              </View>

              <Text style={styles.description}>{citation.description}</Text>

              <View style={styles.formulaBox}>
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
                style={styles.viewSourceBtn}
              >
                <Ionicons name="open-outline" size={14} color="#FFFFFF" />
                <Text style={styles.viewSourceText}>View Source</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Additional Resources */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.resourceIconContainer}>
                <MaterialCommunityIcons
                  name="bookshelf"
                  size={18}
                  color="#67C694"
                />
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
                  <Ionicons name="globe-outline" size={14} color="#9747FF" />
                </View>
                <Text style={styles.resourceItemText}>{resource.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? height * 0.05 : "4%",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    borderColor: "#FFCDD2",
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
    backgroundColor: theme.colors.errorLight,
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
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.backgroundCardLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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
  cardTitle: {
    fontSize: theme.fontSizes.regularSmall,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
    fontFamily: theme.fonts.regular,
  },
  formulaBox: {
    backgroundColor: theme.colors.backgroundCardLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  formulaText: {
    fontSize: theme.fontSizes.small,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: theme.colors.secondPrimary,
    lineHeight: 16,
  },
  sourceText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontFamily: theme.fonts.regular,
  },
  sourceLabel: {
    fontWeight: theme.fontWeights.medium as "500",
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
  viewSourceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: theme.colors.success,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  viewSourceText: {
    fontSize: theme.fontSizes.small,
    fontWeight: theme.fontWeights.medium as "500",
    color: theme.colors.textWhite,
    fontFamily: theme.fonts.medium,
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
});
