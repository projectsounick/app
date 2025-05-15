import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { useState } from "react";
import TransformationImageModal from "./TransformationModal";
import { router } from "expo-router";
import useGetDataHook from "@/hooks/useFetchHook";
import { transformatiomImageService } from "@/app/services/transofmationImage.service";
import { ActivityIndicator } from "react-native-paper";
import CustomSnackbar from "@/app/modules/Snackbar";
//// Main Funcitonal component for the Transformation card -----------------------/

export default function TransformationCard() {
  const [tranformationImageModalVisible, setTransformationImageModalVisible] =
    useState(false);
  const closeTransformationImageModal = () => {
    setTransformationImageModalVisible(false);
  };
  ///// Custom hook for fetching the images ----------/
  const {
    data,
    loading,

    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
    setSnackbarMessage,
    setData,
  } = useGetDataHook(transformatiomImageService.getTransformationImages);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.text,
        borderRadius: 16,
        borderColor: theme.colors.secondPrimary,
        borderWidth: 1,
        padding: 16,
        marginBottom: 20,
      }}
      onPress={() => router.push("/dashboard/transformationImage")}
    >
      {/* Header Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontSize: 16, fontWeight: "bold", color: theme.colors.dark }}
        >
          Transformation Images
        </Text>
        {/* <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => setTransformationImageModalVisible(true)}
        >
          <Text
            style={{
              marginRight: 4,
              fontSize: theme.fontSizes.small,
              color: theme.colors.dark,
            }}
          >
            How it works
          </Text>
          <MaterialIcons
            name="info-outline"
            size={16}
            color={theme.colors.dark}
          />
        </TouchableOpacity> */}
      </View>

      {/* Description */}
      <Text
        style={{
          fontSize: 12,
          color: theme.colors.dark,
          lineHeight: 24,
          marginTop: 8,
        }}
      >
        Upload your transformation image to get a reward
      </Text>

      {/* Images Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
        }}
      >
        {loading ? (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <View style={{ flexDirection: "row" }}>
            {[1, 2, 3].map((i) => (
              <Image
                key={i}
                source={require("../../../assets/images/favicon.png")}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              />
            ))}
          </View>
        )}

        <Ionicons name="chevron-forward" size={20} color={theme.colors.dark} />
      </View>
      {tranformationImageModalVisible ? (
        <TransformationImageModal
          onClose={closeTransformationImageModal}
          visible={tranformationImageModalVisible}
        />
      ) : null}
      {snackbarVisible ? (
        <CustomSnackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
          bgColor={theme.colors.primary}
        />
      ) : null}
    </TouchableOpacity>
  );
}
