import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DietPlanDetails } from "../interfaces/planInterface";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

interface DietPlanInfoModalProps {
  dietPlan: DietPlanDetails;
}

const DietPlanInfoModal: React.FC<DietPlanInfoModalProps> = ({ dietPlan }) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Trigger section */}
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        <Ionicons
          name="fast-food-outline"
          size={18}
          color={theme.colors.text}
        />
        <Text
          style={{
            marginLeft: 8,
            fontSize: theme.fontSizes.regular,
            color: theme.colors.text,
            fontWeight: theme.fontWeights.medium as "500",
          }}
        >
          Diet Plan Included
        </Text>

        {/* Spacer pushes right icon to the far right */}
        <View style={{ flex: 1 }} />

        <Ionicons
          name="chevron-forward-outline"
          size={18}
          color={theme.colors.text}
        />
      </Pressable>

      {/* Modal section */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 12,
              width: "85%",
              maxHeight: "80%",
              paddingTop: 16,
              paddingHorizontal: 20,
              paddingBottom: 24,
            }}
          >
            {/* Close Icon */}
            <Pressable
              onPress={() => setVisible(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: theme.colors.backgroundSecondary,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </Pressable>

            {/* Scrollable Content */}
            <ScrollView
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontSize: theme.fontSizes.large,
                  fontWeight: theme.fontWeights.bold as "700",
                  marginBottom: 12,
                  color: theme.colors.text,
                  textAlign: "center",
                }}
              >
                {dietPlan.title}
              </Text>

              <Text
                style={{
                  fontSize: theme.fontSizes.regularSmall,
                  color: theme.colors.textSecondary,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Duration: {dietPlan.duration} {dietPlan.durationType}
                {dietPlan.duration > 1 ? "s" : ""}
              </Text>

              <View style={{ marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: theme.fontSizes.regular,
                    fontWeight: theme.fontWeights.medium as "500",
                    marginBottom: 10,
                    color: theme.colors.text,
                  }}
                >
                  Highlights
                </Text>

                {dietPlan.descItems.map((item, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons name="leaf-outline" size={18} color="#10B981" />
                    <Text style={{ marginLeft: 8, fontSize: theme.fontSizes.regularSmall }}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* You can add more content below if needed */}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DietPlanInfoModal;
