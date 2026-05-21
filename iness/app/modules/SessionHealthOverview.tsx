import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import {
  MeasurementEntry,
  UserMeasurement,
} from "@/app/interfaces/otherInterfaces";
import { measurementunitsService } from "@/app/services/measurement.service";

type SessionHealthUser = {
  _id?: string;
  name?: string;
  healthReport?: string;
  height?: string;
  weight?: string;
  targetWeight?: string;
  goal?: string;
};

const measurementConfig: Array<{
  key: keyof MeasurementEntry;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: [string, string];
}> = [
  { key: "chest", label: "Chest", icon: "body-outline", accent: ["#0EA5E9", "#2563EB"] },
  { key: "waist", label: "Waist", icon: "ellipse-outline", accent: ["#10B981", "#059669"] },
  { key: "thigh", label: "Thigh", icon: "walk-outline", accent: ["#F97316", "#EA580C"] },
  { key: "armSizeLeft", label: "Left Arm", icon: "barbell-outline", accent: ["#F43F5E", "#E11D48"] },
  { key: "armSizeRight", label: "Right Arm", icon: "fitness-outline", accent: ["#8B5CF6", "#6D28D9"] },
];

const formatDate = (value?: string | Date) => {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getReportName = (url?: string) => {
  if (!url) {
    return "No report uploaded yet";
  }

  try {
    const lastChunk = url.split("/").pop()?.split("?")[0] || "health-report.pdf";
    return decodeURIComponent(lastChunk);
  } catch (error) {
    return "health-report.pdf";
  }
};

const getVisibleMeasurements = (entry: MeasurementEntry) =>
  measurementConfig.filter(({ key }) => entry[key] !== undefined && entry[key] !== null);

export default function SessionHealthOverview({
  userId,
  userDetails,
  showHero = true,
  showQuickFacts = true,
  showReport = true,
  showMeasurements = true,
}: {
  userId?: string;
  userDetails?: SessionHealthUser | null;
  showHero?: boolean;
  showQuickFacts?: boolean;
  showReport?: boolean;
  showMeasurements?: boolean;
}) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);

  const [measurementHistory, setMeasurementHistory] = useState<MeasurementEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMeasurements = async () => {
      if (!userId || !showMeasurements) {
        if (isMounted) {
          setMeasurementHistory([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await measurementunitsService.getMeasurementUnits(userId);
        if (!isMounted) {
          return;
        }

        const data = response.data as UserMeasurement | null;
        if (response.success && data?.measurementUnits) {
          setMeasurementHistory(data.measurementUnits);
          return;
        }

        setMeasurementHistory([]);
        if (response.message && response.message !== "No measurement record found for this user") {
          setError(response.message);
        }
      } catch (fetchError: any) {
        if (!isMounted) {
          return;
        }
        setMeasurementHistory([]);
        setError(fetchError?.message || "Failed to load measurements");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMeasurements();

    return () => {
      isMounted = false;
    };
  }, [userId, showMeasurements]);

  const latestMeasurementDate = measurementHistory[0]?.date;
  const reportUrl = userDetails?.healthReport?.trim();
  const profileFacts = [
    { label: "Height", value: userDetails?.height },
    { label: "Weight", value: userDetails?.weight },
    { label: "Target", value: userDetails?.targetWeight },
    { label: "Goal", value: userDetails?.goal },
  ].filter((item) => item.value);

  const openReport = async () => {
    if (!reportUrl) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(reportUrl);
      if (!canOpen) {
        Alert.alert("Unable to open report", "The PDF link is not supported on this device.");
        return;
      }

      await Linking.openURL(reportUrl);
    } catch (openError) {
      Alert.alert("Unable to open report", "The health report could not be opened right now.");
    }
  };

  return (
    <View style={styles.wrapper}>
      {showHero && (
        <LinearGradient
          colors={isDark ? ["#0F172A", "#1D4ED8"] : ["#E0F2FE", "#DCFCE7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="pulse-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {measurementHistory.length} {measurementHistory.length === 1 ? "entry" : "entries"}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Health Snapshot</Text>
          <Text style={styles.heroSubtitle}>
            Review uploaded PDF reports and dated body measurements for this client in one place.
          </Text>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>Latest Measurement</Text>
              <Text style={styles.heroStatValue}>{formatDate(latestMeasurementDate)}</Text>
            </View>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatLabel}>PDF Report</Text>
              <Text style={styles.heroStatValue}>{reportUrl ? "Available" : "Pending"}</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {showQuickFacts && profileFacts.length > 0 && (
        <View style={styles.quickFactsRow}>
          {profileFacts.map((item) => (
            <View key={item.label} style={styles.quickFactChip}>
              <Text style={styles.quickFactLabel}>{item.label}</Text>
              <Text style={styles.quickFactValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      {showReport && (
        <View style={styles.surfaceCard}>
          <View style={styles.surfaceHeader}>
            <View style={styles.surfaceTitleWrap}>
              <View style={[styles.surfaceIconBox, styles.reportIconBox]}>
                <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.surfaceHeadingCopy}>
                <Text style={styles.surfaceTitle}>PDF Health Report</Text>
                <Text style={styles.surfaceSubtitle}>
                  {reportUrl ? "Latest uploaded report is ready to view." : "No PDF report has been uploaded yet."}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.reportCard}>
            <View style={styles.reportTextWrap}>
              <Text numberOfLines={1} style={styles.reportName}>
                {getReportName(reportUrl)}
              </Text>
              <Text style={styles.reportMeta}>{reportUrl ? "PDF document" : "Awaiting upload"}</Text>
            </View>

            <TouchableOpacity
              style={[styles.reportActionButton, !reportUrl && styles.reportActionButtonDisabled]}
              onPress={openReport}
              disabled={!reportUrl}
              activeOpacity={0.85}
            >
              <Ionicons
                name={reportUrl ? "open-outline" : "cloud-upload-outline"}
                size={16}
                color={reportUrl ? "#FFFFFF" : theme.colors.textMuted}
              />
              <Text
                style={[
                  styles.reportActionText,
                  !reportUrl && styles.reportActionTextDisabled,
                ]}
              >
                {reportUrl ? "Open PDF" : "No File"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showMeasurements && (
        <View style={styles.surfaceCard}>
          <View style={styles.surfaceHeader}>
            <View style={styles.surfaceTitleWrap}>
              <View style={[styles.surfaceIconBox, styles.measurementIconBox]}>
                <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.surfaceHeadingCopy}>
                <Text style={styles.surfaceTitle}>Measurement Timeline</Text>
                <Text style={styles.surfaceSubtitle}>
                  Every recorded measurement appears with its tracking date.
                </Text>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.stateCard}>
              <ActivityIndicator size="small" color={theme.colors.info} />
              <Text style={styles.stateText}>Loading measurements...</Text>
            </View>
          ) : measurementHistory.length > 0 ? (
            <View style={styles.historyList}>
              {measurementHistory.map((entry, index) => {
                const visibleMeasurements = getVisibleMeasurements(entry);

                return (
                  <View key={`${entry.date}-${index}`} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <View>
                        <Text style={styles.historyTitle}>Measurement #{measurementHistory.length - index}</Text>
                        <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                      </View>
                      <View style={styles.historyBadge}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.info} />
                        <Text style={styles.historyBadgeText}>Tracked</Text>
                      </View>
                    </View>

                    {visibleMeasurements.length > 0 ? (
                      <View style={styles.measurementGrid}>
                        {visibleMeasurements.map(({ key, label, icon, accent }) => (
                          <View key={String(key)} style={styles.measurementTile}>
                            <View style={styles.measurementTileHeader}>
                              <LinearGradient
                                colors={accent}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.measurementIconWrap}
                              >
                                <Ionicons name={icon} size={14} color="#FFFFFF" />
                              </LinearGradient>
                              <Text style={styles.measurementLabel}>{label}</Text>
                            </View>
                            <View style={styles.measurementValueRow}>
                              <Text style={styles.measurementValue}>{String(entry[key])}</Text>
                              <Text style={styles.measurementUnit}>cm</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={styles.stateCard}>
                        <Text style={styles.stateText}>Measurement values are unavailable for this entry.</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.stateCard}>
              <Ionicons name="stats-chart-outline" size={18} color={theme.colors.textMuted} />
              <Text style={styles.stateText}>
                {error || "No measurement history has been recorded yet."}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    heroCard: {
      borderRadius: 24,
      padding: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(14,165,233,0.18)",
      marginBottom: 14,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    heroIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "rgba(15, 23, 42, 0.18)",
    },
    heroBadgeText: {
      color: "#FFFFFF",
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: theme.fontSizes.large,
      fontFamily: theme.fonts.bold,
      marginBottom: 8,
    },
    heroSubtitle: {
      color: "rgba(255,255,255,0.88)",
      fontSize: theme.fontSizes.regularSmall,
      lineHeight: 20,
      fontFamily: theme.fonts.medium,
      marginBottom: 16,
    },
    heroStatsRow: {
      flexDirection: "row",
      gap: 10,
    },
    heroStatCard: {
      flex: 1,
      borderRadius: 18,
      padding: 12,
      backgroundColor: "rgba(255,255,255,0.14)",
    },
    heroStatLabel: {
      color: "rgba(255,255,255,0.72)",
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
      marginBottom: 6,
    },
    heroStatValue: {
      color: "#FFFFFF",
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
    },
    quickFactsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
    },
    quickFactChip: {
      minWidth: "47%",
      flexGrow: 1,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: isDark ? theme.colors.backgroundCard : "#F8FAFC",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickFactLabel: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
      marginBottom: 4,
    },
    quickFactValue: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
    },
    surfaceCard: {
      borderRadius: 24,
      padding: 16,
      backgroundColor: isDark ? theme.colors.backgroundCard : theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 14,
      shadowColor: isDark ? "#000000" : "#0F172A",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.12 : 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
    surfaceHeader: {
      marginBottom: 14,
    },
    surfaceTitleWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    surfaceHeadingCopy: {
      flex: 1,
    },
    surfaceIconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    reportIconBox: {
      backgroundColor: "#F97316",
    },
    measurementIconBox: {
      backgroundColor: "#0EA5E9",
    },
    surfaceTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
      marginBottom: 2,
    },
    surfaceSubtitle: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.medium,
      lineHeight: 18,
    },
    reportCard: {
      borderRadius: 18,
      padding: 14,
      backgroundColor: isDark ? theme.colors.backgroundSecondary : "#F8FAFC",
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    reportTextWrap: {
      flex: 1,
    },
    reportName: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
      marginBottom: 4,
    },
    reportMeta: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
    },
    reportActionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.info,
    },
    reportActionButtonDisabled: {
      backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundCard,
    },
    reportActionText: {
      color: "#FFFFFF",
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    reportActionTextDisabled: {
      color: theme.colors.textMuted,
    },
    historyList: {
      gap: 12,
    },
    historyCard: {
      borderRadius: 20,
      padding: 14,
      backgroundColor: isDark ? theme.colors.backgroundSecondary : "#FCFCFD",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      gap: 10,
    },
    historyTitle: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.regular,
      fontFamily: theme.fonts.bold,
      marginBottom: 2,
    },
    historyDate: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
    },
    historyBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: isDark ? "rgba(33,150,243,0.14)" : "#E0F2FE",
    },
    historyBadgeText: {
      color: theme.colors.info,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.bold,
    },
    measurementGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    measurementTile: {
      width: "48%",
      flexGrow: 1,
      borderRadius: 16,
      padding: 12,
      backgroundColor: isDark ? theme.colors.background : "#FFFFFF",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    measurementTileHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    measurementIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    measurementLabel: {
      color: theme.colors.textSecondary,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.medium,
      flex: 1,
    },
    measurementValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 4,
    },
    measurementValue: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.medium,
      fontFamily: theme.fonts.bold,
    },
    measurementUnit: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.small,
      fontFamily: theme.fonts.medium,
    },
    stateCard: {
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 14,
      backgroundColor: isDark ? theme.colors.backgroundSecondary : "#F8FAFC",
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    stateText: {
      color: theme.colors.textMuted,
      fontSize: theme.fontSizes.regularSmall,
      fontFamily: theme.fonts.medium,
      textAlign: "center",
      lineHeight: 20,
    },
  });
