import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import SmallHeader from "@/src/modules/SmallHeader";
import BackHeader from "@/src/modules/BackHeader";
import BannerCard from "@/src/modules/BannerCard";
import useGetDataHook from "@/hooks/useFetchHook";
import { otherService } from "@/src/services/singleService.service";
import theme from "@/src/Theme/globalTheme";
import CustomSnackbar from "@/src/modules/Snackbar";

const BookSessionScreen = () => {
  const {
    data,
    loading,
    error,
    fetchData,
    snackbarVisible,
    snackbarMessage,
    setSnackbarVisible,
  } = useGetDataHook(
    otherService.getAvailableServices
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.backgroundSecondary }}>
      <SmallHeader title="Sessions" weightShow={false} />
      <BackHeader />

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}>
          <Text style={{ fontSize: theme.fontSizes.regular, color: theme.colors.textSecondary, textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchData()}
            style={{ marginTop: 14, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: theme.colors.primary }}
          >
            <Text style={{ color: theme.colors.textWhite, fontWeight: "600" }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : data && data.length > 0 ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.regular,
              fontWeight: theme.fontWeights.bold as "700",
              textAlign: "center",
              marginBottom: 6,
              color: theme.colors.black,
              fontFamily: theme.fonts.bold,
            }}
          >
            Pick What Suits You Best
          </Text>
          <Text
            style={{
              fontSize: theme.fontSizes.regularSmall,
              color: theme.colors.textSecondary,
              marginBottom: 16,
              lineHeight: 20,
              textAlign: "center",
              fontFamily: theme.fonts.medium,
            }}
          >
            Get expert guidance your way{"\n"}online or in person.
          </Text>

          {data.map((service: any) => (
            <BannerCard key={service._id} cardData={service} />
          ))}
        </ScrollView>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: theme.fontSizes.regular, color: theme.colors.textSecondary, textAlign: "center" }}>
            No service available.{"\n"}We will be adding soon.
          </Text>
        </View>
      )}
      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
        bgColor={theme.colors.backgroundCard}
      />
    </View>
  );
};

export default BookSessionScreen;
