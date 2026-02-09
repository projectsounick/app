import React from "react";
import { View, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useGetDataHook from "@/hooks/useFetchHook";
import { sessionService } from "../services/sessionService";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";
import SessionCalendarContent from "@/app/Components/SessionCalendar/SessionCalendarContent";
import { Session } from "@/app/interfaces/sessionInterface";

interface SessionCalendarSheetProps {
  isVisible: boolean;
  onClose: () => void;
  setCurrentSession: (session: Session | null) => void;
  currentSession: Session | null;
  setShowFeedbackModal: (value: boolean) => void;
}

/**
 * Bottom sheet wrapper for the session calendar.
 * Uses modular SessionCalendarContent; when opened with initialDate (from Redux),
 * content opens directly to that day's sessions.
 */
function SessionCalendarSheet({
  isVisible,
  onClose,
  setCurrentSession,
  setShowFeedbackModal,
}: SessionCalendarSheetProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const styles = getStyles(theme, isDark);
  const calendarInitialDate = useSelector(
    (state: RootState) => state.componentOpen.calendarInitialDate
  );

  const { data: sessionData, loading, error } = useGetDataHook(
    sessionService.getSessions
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.backdrop}
        onPress={onClose}
      >
        <View
          style={styles.bottomSheetContainer}
          onStartShouldSetResponder={() => true}
        >
          <SessionCalendarContent
            sessionData={sessionData ?? undefined}
            loading={loading}
            error={error}
            initialDate={calendarInitialDate}
            onClose={onClose}
            setCurrentSession={setCurrentSession}
            setShowFeedbackModal={setShowFeedbackModal}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "flex-end",
    },
    bottomSheetContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
      ...(isDark
        ? {}
        : {
            shadowColor: theme.colors.black,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }),
    },
  });

export default SessionCalendarSheet;
