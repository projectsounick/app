import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import SmallHeader from "@/app/modules/SmallHeader";
import BackHeader from "@/app/modules/BackHeader";
import BannerCard from "@/app/modules/BannerCard";
import useGetDataHook from "@/hooks/useFetchHook";
import { otherService } from "@/app/services/singleService.service";
import theme from "@/app/Theme/globalTheme";

const BookSessionScreen = () => {
  const { data, loading, fetchData } = useGetDataHook(
    otherService.getAvailableServices
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <SmallHeader title="Sessions" weightShow={false} />
      <BackHeader />

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#4CAF50" />
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
              fontSize: 16,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 6,
              color: "#000",
              fontFamily: theme.fonts.bold,
            }}
          >
            Pick What Suits You Best
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#666",
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
          <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
            No service available.{"\n"}We will be adding soon.
          </Text>
        </View>
      )}
    </View>
  );
};

export default BookSessionScreen;
