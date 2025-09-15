import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ShimmerPlaceHolder from "react-native-shimmer-placeholder";
import { LinearGradient } from "expo-linear-gradient";

interface ShimmerLoaderProps {
  screenName: "train" | "session";
}

const ShimmerLoader: React.FC<ShimmerLoaderProps> = ({ screenName }) => {
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
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.box}
              />
            </View>

            <View style={styles.card}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.title}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.subTitle}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.image}
              />
            </View>

            <View style={styles.card}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.title}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.subTitle}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.image}
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
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.calendarBox}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.calendarBox}
              />
            </View>

            {/* Buttons row (Info / Trainer / Workout) */}
            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.smallBox}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.smallBox}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.smallBox}
              />
            </View>

            {/* Stats row (Total Sessions, Session Time) */}
            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
              />
            </View>

            <View style={styles.row}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.statsBox}
              />
            </View>

            {/* Session Info Block */}
            <View style={styles.infoCard}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.fullWidthLine}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.fullWidthLine}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.fullWidthLine}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f2f2f2",
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
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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

export default ShimmerLoader;
