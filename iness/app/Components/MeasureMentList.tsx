import React, { memo } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import theme from "@/app/Theme/globalTheme";

const measurementItems = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "thigh", label: "Thigh" },
  { key: "armSizeLeft", label: "Left Arm" },
  { key: "armSizeRight", label: "Right Arm" },
];

const MeasurementList = ({ measurements }: { measurements: any[] }) => {
  return (
    <FlatList
      data={measurements}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item, index }) => (
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="tape-measure"
                  size={16}
                  color="#9747FF"
                />
              </View>
              <Text style={styles.recordLabel}>Record #{measurements.length - index}</Text>
            </View>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={12}
                color="#888"
              />
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Measurements Grid - 2 columns */}
          <View style={styles.measurementsGrid}>
            {measurementItems.map(({ key, label }) => {
              const value = item[key];
              return (
                <View key={key} style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>{label}</Text>
                  <Text style={styles.measurementValue}>
                    {value ?? "-"}{" "}
                    <Text style={styles.measurementUnit}>cm</Text>
                  </Text>
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
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F3EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  recordLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: "#888",
    fontFamily: theme.fonts.regular,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  measurementItem: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  measurementLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: theme.fonts.regular,
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    fontFamily: theme.fonts.bold,
  },
  measurementUnit: {
    fontSize: 10,
    fontWeight: "400",
    color: "#888",
  },
});

export default memo(MeasurementList);
