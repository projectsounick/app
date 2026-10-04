import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image as ExpoImage, type ImageContentFit } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalTheme } from "@/src/Theme/ThemeContext";
import { useDashboardActivity } from "./DashboardActivityContext";

type CachedRemoteImageProps = {
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  accessibilityLabel: string;
  recyclingKey?: string;
};

function CachedRemoteImageContent({
  uri,
  style,
  contentFit = "cover",
  accessibilityLabel,
  recyclingKey,
}: CachedRemoteImageProps) {
  const theme = useGlobalTheme();
  const { reduceMotion } = useDashboardActivity();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!uri);

  const cleanUri = useMemo(() => {
    if (!uri || typeof uri !== "string") return null;
    const trimmed = uri.trim();
    if (!trimmed) return null;
    try {
      const queryIndex = trimmed.indexOf("?");
      if (queryIndex === -1) {
        return trimmed.replace(/ /g, "%20");
      }
      const path = trimmed.slice(0, queryIndex).replace(/ /g, "%20");
      const query = trimmed.slice(queryIndex);
      return path + query;
    } catch {
      return trimmed;
    }
  }, [uri]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundSecondary },
        style,
      ]}
    >
      {!loaded && !failed ? (
        <ActivityIndicator
          accessibilityLabel={`Loading ${accessibilityLabel}`}
          color={theme.colors.secondPrimary}
        />
      ) : null}

      {!failed && cleanUri ? (
        <ExpoImage
          source={{ uri: cleanUri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          cachePolicy="memory-disk"
          allowDownscaling
          recyclingKey={recyclingKey ?? cleanUri}
          transition={reduceMotion ? 0 : 150}
          accessibilityLabel={accessibilityLabel}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <Ionicons
          accessibilityLabel={`${accessibilityLabel} unavailable`}
          name="image-outline"
          size={28}
          color={theme.colors.textMuted}
        />
      )}
    </View>
  );
}

export default function CachedRemoteImage(props: CachedRemoteImageProps) {
  return (
    <CachedRemoteImageContent
      key={props.uri || "missing-dashboard-image"}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
