import React, { memo } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";

const measurementItems = [
  { key: "chest", label: "Chest", icon: "body-outline", color: ["#9747FF", "#844ACF"] },
  { key: "waist", label: "Waist", icon: "ellipse-outline", color: ["#67C694", "#4CAF50"] },
  { key: "thigh", label: "Thigh", icon: "fitness-outline", color: ["#4FC3F7", "#29B6F6"] },
  { key: "armSizeLeft", label: "Left Arm", icon: "barbell-outline", color: ["#FF6B9D", "#FF8E9B"] },
  { key: "armSizeRight", label: "Right Arm", icon: "barbell-outline", color: ["#FFB74D", "#FFA726"] },
];

const MeasurementList = ({ measurements }: { measurements: any[] }) => {
  return (
    <FlatList
      data={measurements}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          {/* Header with Gradient */}
          <LinearGradient
            colors={["#9747FF", "#844ACF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardHeader}
          >
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="tape-measure"
                  size={18}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.recordLabel}>Record #{measurements.length - index}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="rgba(255, 255, 255, 0.9)"
              />
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </LinearGradient>

          {/* Measurements Grid - 2 columns */}
          <View style={styles.measurementsGrid}>
            {measurementItems.map(({ key, label, icon, color }) => {
              const value = item[key];
              return (
                <View key={key} style={styles.measurementItem}>
                  <View style={styles.measurementItemHeader}>
                    <LinearGradient
                      colors={color}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.measurementIconContainer}
                    >
                      <Ionicons name={icon as any} size={16} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.measurementLabel}>{label}</Text>
                  </View>
                  <View style={styles.measurementValueContainer}>
                    <Text style={styles.measurementValue}>
                      {value ?? "-"}
                    </Text>
                    {value && (
                      <Text style={styles.measurementUnit}>cm</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: theme.colors.secondPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: theme.fonts.bold,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: theme.fonts.medium,
    fontWeight: "600",
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  measurementItem: {
    width: "48%",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  measurementItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  measurementIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  measurementLabel: {
    fontSize: 13,
    color: "#666",
    fontFamily: theme.fonts.medium,
    fontWeight: "600",
    flex: 1,
  },
  measurementValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  measurementUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
    fontFamily: theme.fonts.regular,
  },
});

export default memo(MeasurementList);
