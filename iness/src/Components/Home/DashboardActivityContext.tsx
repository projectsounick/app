import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AccessibilityInfo,
  AppState,
  type AppStateStatus,
} from "react-native";
import { useIsFocused } from "expo-router";

type DashboardActivity = {
  isActive: boolean;
  reduceMotion: boolean;
};

const DashboardActivityContext = createContext<DashboardActivity>({
  isActive: true,
  reduceMotion: false,
});

export function DashboardActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      setAppState
    );
    const motionSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );

    return () => {
      mounted = false;
      appStateSubscription.remove();
      motionSubscription.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      isActive: isFocused && appState === "active",
      reduceMotion,
    }),
    [appState, isFocused, reduceMotion]
  );

  return (
    <DashboardActivityContext.Provider value={value}>
      {children}
    </DashboardActivityContext.Provider>
  );
}

export const useDashboardActivity = () =>
  useContext(DashboardActivityContext);
