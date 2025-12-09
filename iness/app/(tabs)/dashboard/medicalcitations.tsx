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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import { SafeAreaView } from "react-native-safe-area-context";


const backgroundImg = require("../../../assets/images/basicBackground.jpg");
const { height } = Dimensions.get("window");
const topPadding = height * 0.05;

export default function MedicalCitationsScreen() {
  const openCitation = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const citations = [
    {
      title: "BMI (Body Mass Index) Formula",
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
      description:
        "The BMR calculation uses the Mifflin-St Jeor Equation, which is considered one of the most accurate BMR estimation formulas.",
      formula: "Male: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5\nFemale: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161",
      source: "Mifflin MD, St Jeor ST, Hill LA, et al. (1990)",
      url: "https://pubmed.ncbi.nlm.nih.gov/2305711/",
      additionalInfo:
        "Published in the American Journal of Clinical Nutrition. This equation was developed from a large sample size and is widely used in clinical settings.",
    },
    {
      title: "10,000 Steps Per Day Recommendation",
      description:
        "The 10,000 steps per day goal is a widely recognized physical activity target. While this is a general guideline, individual needs may vary based on age, health status, and fitness level.",
      formula: "Daily Goal: 10,000 steps",
      source: "Centers for Disease Control and Prevention (CDC)",
      url: "https://www.cdc.gov/physicalactivity/basics/adults/index.htm",
      additionalInfo:
        "CDC recommends at least 150 minutes of moderate-intensity aerobic activity per week. The 10,000 steps goal is approximately equivalent to 30 minutes of daily walking and helps meet these guidelines.",
    },
    {
      title: "Sleep Duration Recommendations",
      description:
        "Sleep requirements vary by age and individual needs. The National Sleep Foundation provides evidence-based recommendations for optimal sleep duration.",
      formula: "Adults (18-64 years): 7-9 hours per night\nOlder Adults (65+): 7-8 hours per night",
      source: "National Sleep Foundation",
      url: "https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need",
      additionalInfo:
        "Sleep needs are individual and can be influenced by factors such as health conditions, activity level, and lifestyle. Consult with a healthcare provider for personalized sleep recommendations.",
    },
    {
      title: "Daily Water Intake Recommendations",
      description:
        "Adequate hydration is essential for health. Water intake needs vary based on age, sex, activity level, climate, and overall health.",
      formula: "General Guideline: 8-10 glasses (2-2.5 liters) per day",
      source: "National Academies of Sciences, Engineering, and Medicine",
      url: "https://www.nationalacademies.org/news/2004/02/report-sets-dietary-intake-levels-for-water-salt-and-potassium-to-maintain-health-and-reduce-chronic-disease-risk",
      additionalInfo:
        "The National Academies recommend about 3.7 liters (15.5 cups) for men and 2.7 liters (11.5 cups) for women daily, including water from all beverages and foods. Individual needs may vary.",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <ImageBackground
        source={backgroundImg}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["left", "right"]}
        >
          <View
            style={{
              paddingLeft: 20,
              marginTop: Platform.OS === "ios" ? topPadding : "4%",
            }}
          >
            <NormalHeader screenName="Medical Citations" />
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Disclaimer Card */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#FFEBEE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="warning" size={18} color="#F44336" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  Important Medical Disclaimer
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 20,
                }}
              >
                The health calculations and information provided in this app are
                for informational and educational purposes only. They are not
                intended to be a substitute for professional medical advice,
                diagnosis, or treatment. Always seek the advice of your physician
                or other qualified health provider with any questions you may
                have regarding a medical condition. Never disregard professional
                medical advice or delay in seeking it because of something you
                have read or calculated in this app.
              </Text>
            </View>

            {/* Citations */}
            {citations.map((citation, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
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
                    <Ionicons name="document-text" size={18} color="#9747FF" />
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#000",
                      flex: 1,
                    }}
                  >
                    {citation.title}
                  </Text>
                </View>

                <View
                  style={{
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#666",
                      lineHeight: 20,
                      marginBottom: 12,
                    }}
                  >
                    {citation.description}
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#F8F8F8",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "#E0E0E0",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                        color: "#333",
                        lineHeight: 18,
                      }}
                    >
                      {citation.formula}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      color: "#666",
                      lineHeight: 20,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: "#000" }}>
                      Source:{" "}
                    </Text>
                    {citation.source}
                  </Text>

                  {citation.additionalInfo && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#999",
                        lineHeight: 18,
                        marginBottom: 12,
                        fontStyle: "italic",
                      }}
                    >
                      {citation.additionalInfo}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={() => openCitation(citation.url)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: "#67C694",
                      borderRadius: 12,
                      marginTop: 8,
                    }}
                  >
                    <Ionicons
                      name="open-outline"
                      size={16}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#FFFFFF",
                      }}
                    >
                      View Source
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Additional Resources */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                elevation: 5,
                borderWidth: 1,
                borderColor: "#F5F5F5",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
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
                  <Ionicons name="library" size={18} color="#67C694" />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#000",
                    flex: 1,
                  }}
                >
                  Additional Resources
                </Text>
              </View>

              <View
                style={{
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: "#F0F0F0",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    openCitation("https://www.who.int/health-topics/obesity")
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name="globe-outline"
                      size={16}
                      color="#9747FF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#333",
                      flex: 1,
                    }}
                  >
                    WHO - Obesity and Overweight
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    openCitation(
                      "https://www.cdc.gov/healthyweight/assessing/bmi/index.html"
                    )
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name="globe-outline"
                      size={16}
                      color="#9747FF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#333",
                      flex: 1,
                    }}
                  >
                    CDC - About Adult BMI
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    openCitation(
                      "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4207053/"
                    )
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    backgroundColor: "#F8F8F8",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F3EDFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name="globe-outline"
                      size={16}
                      color="#9747FF"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#333",
                      flex: 1,
                    }}
                  >
                    NIH - Metabolic Rate Research
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

