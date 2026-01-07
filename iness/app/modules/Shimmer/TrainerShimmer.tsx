import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "../../Theme/ThemeContext";

interface TrainerShimmerProps {
  screenName: "train" | "session";
}

const TrainerShimmer: React.FC<TrainerShimmerProps> = ({ screenName }) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const shimmerColors = isDark 
    ? ["#1a1a1a", "#2a2a2a", "#1a1a1a"]
    : ["#E1E9EE", "#F2F8FC", "#E1E9EE"];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {screenName === "train" ? (
          <>
            {/* Train Screen Loader */}
            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.box}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.box}
                shimmerColors={shimmerColors}
              />
            </View>

            <View style={styles.card}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.title}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.subTitle}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.image}
                shimmerColors={shimmerColors}
              />
            </View>

            <View style={styles.card}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.title}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.subTitle}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.image}
                shimmerColors={shimmerColors}
              />
            </View>
          </>
        ) : (
          <>
            {/* Session Screen Loader */}
            {/* Purple header placeholder */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.headerPlaceholder}
              shimmerColors={shimmerColors}
            />

            {/* Title + subtitle */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.title}
            />
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.subTitle}
            />

            {/* Calendar row (date selector) */}
            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.calendarBox}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.calendarBox}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.calendarBox}
                shimmerColors={shimmerColors}
              />
            </View>

            {/* Buttons row (Info / Trainer / Workout) */}
            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.smallBox}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.smallBox}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.smallBox}
                shimmerColors={shimmerColors}
              />
            </View>

            {/* Stats row (Total Sessions, Session Time) */}
            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
                shimmerColors={shimmerColors}
              />
            </View>

            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
                shimmerColors={shimmerColors}
              />
            </View>

            {/* Session Info Block */}
            <View style={styles.infoCard}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.fullWidthLine}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.fullWidthLine}
                shimmerColors={shimmerColors}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.fullWidthLine}
                shimmerColors={shimmerColors}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  box: {
    width: "48%",
    height: 60,
    borderRadius: 12,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    width: "60%",
    height: 20,
    borderRadius: 6,
    marginBottom: 10,
  },
  subTitle: {
    width: "80%",
    height: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  headerPlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 20,
  },
  calendarBox: {
    width: "30%",
    height: 80,
    borderRadius: 12,
  },
  smallBox: {
    width: "30%",
    height: 60,
    borderRadius: 12,
  },
  statsBox: {
    width: "48%",
    height: 70,
    borderRadius: 12,
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
  },
  fullWidthLine: {
    width: "100%",
    height: 20,
    borderRadius: 6,
    marginBottom: 12,
  },
});

export default TrainerShimmer;

