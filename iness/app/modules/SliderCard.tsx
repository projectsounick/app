import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => {
              dispatch(setCurrentService(item));
              router.push({
                pathname: "/dashboard/servicedetails",
                params: { serviceId: item._id },
              });
            }}
            style={[
              styles.card,
              {
                marginRight: index === availableServices.length - 1 ? 0 : 12,
              },
            ]}
          >
            {/* Image and Content Layout */}
            {item.imgUrl ? (
              <View style={{ flexDirection: "row", flex: 1 }}>
                {/* Image Section */}
                <View
                  style={{
                    width: 140,
                    height: 200,
                    backgroundColor: "#F9F9F9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ImageBackground
                    source={{ uri: item.imgUrl }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    resizeMode="contain"
                    imageStyle={{
                      borderTopLeftRadius: 16,
                      borderBottomLeftRadius: 16,
                    }}
                  >
                    <LinearGradient
                      colors={["rgba(0,0,0,0.05)", "transparent"]}
                      style={{
                        flex: 1,
                      }}
                    />
                  </ImageBackground>
                </View>

                {/* Content Section */}
                <View
                  style={{
                    flex: 1,
                    padding: 14,
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexShrink: 1 }}>
                    {/* Title */}
                    <Text
                      style={styles.cardTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>

                    {/* Description Items - Max 2 */}
                    <View>
                      {item.descItems?.slice(0, 2).map((desc: string, idx: number) => (
                        <View key={idx} style={styles.descItem}>
                          <View style={styles.descDot} />
                          <Text
                            style={styles.descText}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {desc}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Button */}
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
              </View>
            ) : (
              // Fallback if no image
              <View
                style={{
                  flex: 1,
                  padding: 14,
                  justifyContent: "space-between",
                  backgroundColor: "#F9F9F9",
                  height: 200,
                }}
              >
                <View style={{ flexShrink: 1 }}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>

                  {item.descItems?.length > 0 && (
                    <View>
                      {item.descItems.slice(0, 2).map((desc: string, idx: number) => (
                        <View key={idx} style={styles.descItem}>
                          <View style={styles.descDot} />
                          <Text
                            style={styles.descText}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {desc}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
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
            )}
          </TouchableOpacity>
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
    marginBottom: 4,
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
    marginTop: 2,
    fontFamily: theme.fonts.regular,
  },
  card: {
    width: 340,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  cardTitle: {
    fontWeight: theme.fontWeights.bold,
    fontSize: 15,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  descItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  descDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#9747FF",
    marginRight: 6,
    marginTop: 5,
  },
  descText: {
    color: "#666",
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
    fontWeight: "400",
  },
  checkButton: {
    backgroundColor: "#67C694",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 30,
    alignSelf: "flex-start",
    marginTop: 8,
    shadowColor: "#67C694",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  checkButtonText: {
    fontWeight: "700",
    fontSize: 12,
    color: "#fff",
  },
});
