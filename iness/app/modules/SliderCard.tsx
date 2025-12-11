import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { LinearGradient } from "expo-linear-gradient";
import { setCurrentService } from "@/Slices/planSlice";
import theme from "@/app/Theme/globalTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SliderCard() {
  const dispatch = useDispatch();
  const router = useRouter();
  const availableServices = useSelector(
    (state: RootState) => state.plan.availableServices
  );

  return (
    <View style={styles.container}>
      {/* Header with Icon */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="briefcase-check"
              size={18}
              color="#9747FF"
            />
          </View>
          <Text style={styles.headerTitle}>Our Services</Text>
        </View>
        <View style={styles.headerDash} />
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Professional services tailored to your needs.
      </Text>

      {/* Horizontal Scrollable Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent:
            availableServices.length === 1 ? "center" : "flex-start",
          paddingRight: 12,
        }}
      >
        {availableServices.map((item: any, index) => (
          <View
            key={index}
            style={[
              styles.card,
              {
                marginRight: index === availableServices.length - 1 ? 0 : 12,
              },
            ]}
          >
            {/* Image Background */}
            {item.imgUrl ? (
              <ImageBackground
                source={{ uri: item.imgUrl }}
                style={{ flex: 1 }}
                resizeMode="cover"
              >
                {/* Dark gradient overlay */}
                <LinearGradient
                  colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.2)"]}
                  style={styles.gradientOverlay}
                >
                  <View style={{ flex: 1, justifyContent: "space-between" }}>
                    <Text
                      style={styles.cardTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>

                    <View>
                      {item.descItems
                        ?.slice(0, 3)
                        .map((desc: string, idx: number) => (
                          <View key={idx} style={styles.descItem}>
                            <View style={styles.descDot} />
                            <Text
                              style={styles.descText}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {desc}
                            </Text>
                          </View>
                        ))}
                    </View>

                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={() => {
                        dispatch(setCurrentService(item));
                        router.push({
                          pathname: "/dashboard/servicedetails",
                          params: { serviceId: item._id },
                        });
                      }}
                    >
                      <Text style={styles.checkButtonText}>Check Details</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              // fallback if no image
              <View style={styles.fallbackContainer}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  headerDash: {
    width: 30,
    height: 3,
    backgroundColor: "#9747FF",
    borderRadius: 2,
  },
  description: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
    marginLeft: 46,
    fontFamily: theme.fonts.regular,
  },
  card: {
    width: 280,
    height: 209,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#736AD6",
  },
  gradientOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  descItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  descDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginRight: 6,
    marginTop: 2,
  },
  descText: {
    color: "#fff",
    fontSize: 12,
    flex: 1,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  checkButton: {
    backgroundColor: "rgba(103,198,148,0.9)",
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.08,
    borderRadius: (SCREEN_WIDTH * 0.1) / 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checkButtonText: {
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fallbackContainer: {
    flex: 1,
    backgroundColor: "#736AD6",
    padding: 16,
    justifyContent: "space-between",
  },
});
