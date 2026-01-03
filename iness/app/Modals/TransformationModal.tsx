import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import { TransformationImageUploadModalInterface } from "@/app/interfaces/moduleInterfaces";
import { stepsForTransformationImageReward } from "@/utils/staticDataUtils";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";

const { width } = Dimensions.get("window");

export default function TransformationImageModal({
  visible,
  onClose,
}: TransformationImageUploadModalInterface) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
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
            width: width * 0.9,
            backgroundColor: theme.colors.background,
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Close Icon */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
            }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={28}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontSize: theme.fontSizes.large,
              fontWeight: theme.fontWeights.bold as "700",
              color: theme.colors.dark,
              marginBottom: 4,
            }}
          >
            Transformation Steps
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.regularSmall,
              color: theme.colors.dark,
              marginBottom: 16,
            }}
          >
            Get rewarded in 3 easy steps
          </Text>

          {/* Steps */}
          <View
            style={{ width: "100%", marginBottom: 24, alignItems: "center" }}
          >
            {stepsForTransformationImageReward.map((step: any, index) => (
              <React.Fragment key={index}>
                <View
                  style={{
                    backgroundColor: theme.colors.cardLight,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.secondPrimary,
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons
                      name={step.icon}
                      size={24}
                      color={theme.colors.secondPrimary}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontWeight: theme.fontWeights.bold as "700",
                        fontSize: theme.fontSizes.regular,
                        color: theme.colors.dark,
                      }}
                    >
                      {step.title}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: theme.fontSizes.regular,
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                      marginTop: 6,
                    }}
                  >
                    {step.description}
                  </Text>
                </View>

                {/* Arrow Down Icon Between Steps */}
                {index < stepsForTransformationImageReward.length - 1 && (
                  <MaterialCommunityIcons
                    name="arrow-down-bold"
                    size={24}
                    color={theme.colors.text}
                    style={{ marginVertical: 8 }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>

          <AnimatedSubmitButton loading={false} title="Upload" />
        </View>
      </View>
    </Modal>
  );
}
