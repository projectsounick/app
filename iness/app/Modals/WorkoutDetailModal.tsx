import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useGlobalTheme, useTheme } from "@/app/Theme/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Workout {
  exercise: string;
  reps: number;
  sets: number;
  timer: string;
  isComplete: boolean;
}

interface WorkoutDetailModalProps {
  visible: boolean;
  onClose: () => void;
  workouts: Workout[];
}

const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  visible,
  onClose,
  workouts,
}) => {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();

  if (!workouts || workouts.length === 0) return null;

  const renderWorkoutCard = (workout: Workout, index: number) => (
    <View
      key={index}
      style={{
        backgroundColor: isDark ? theme.colors.background : "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isDark ? theme.colors.border : "#E8E8E8",
        ...(isDark ? {} : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        }),
      }}
    >
      {/* Workout Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? theme.colors.border : "#E8E8E8",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: isDark ? theme.colors.backgroundCard : "#F3EDFF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <MaterialCommunityIcons
            name="dumbbell"
            size={22}
            color={isDark ? theme.colors.secondPrimary : "#9747FF"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.medium,
              marginBottom: 4,
            }}
          >
            Exercise {index + 1} of {workouts.length}
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              fontFamily: theme.fonts.bold,
            }}
          >
            {workout.exercise}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {/* Reps Card */}
        <View
          style={{
            flex: 1,
            minWidth: "47%",
            backgroundColor: isDark ? theme.colors.backgroundCard : "#F8F9FA",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="repeat"
            size={18}
            color={isDark ? theme.colors.secondPrimary : "#9747FF"}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.medium,
              marginBottom: 4,
            }}
          >
            Reps
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              fontFamily: theme.fonts.bold,
            }}
          >
            {workout.reps}
          </Text>
        </View>

        {/* Sets Card */}
        <View
          style={{
            flex: 1,
            minWidth: "47%",
            backgroundColor: isDark ? theme.colors.backgroundCard : "#F8F9FA",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="format-list-numbered"
            size={18}
            color={isDark ? theme.colors.secondPrimary : "#9747FF"}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.medium,
              marginBottom: 4,
            }}
          >
            Sets
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              fontFamily: theme.fonts.bold,
            }}
          >
            {workout.sets}
          </Text>
        </View>

        {/* Timer Card */}
        <View
          style={{
            flex: 1,
            minWidth: "47%",
            backgroundColor: isDark ? theme.colors.backgroundCard : "#F8F9FA",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="timer-outline"
            size={18}
            color={isDark ? theme.colors.secondPrimary : "#9747FF"}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.medium,
              marginBottom: 4,
            }}
          >
            Timer
          </Text>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: theme.fontSizes.medium,
              fontWeight: "bold",
              fontFamily: theme.fonts.bold,
            }}
          >
            {workout.timer}
          </Text>
        </View>

        {/* Status Card */}
        <View
          style={{
            flex: 1,
            minWidth: "47%",
            backgroundColor: workout.isComplete
              ? (isDark ? theme.colors.greenLight : "#E8F5E9")
              : (isDark ? theme.colors.backgroundCard : "#FFF3E0"),
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name={workout.isComplete ? "check-circle" : "clock-outline"}
            size={18}
            color={workout.isComplete
              ? theme.colors.success
              : (isDark ? theme.colors.textSecondary : "#FF9800")}
            style={{ marginBottom: 6 }}
          />
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.small,
              fontFamily: theme.fonts.medium,
              marginBottom: 4,
            }}
          >
            Status
          </Text>
          <Text
            style={{
              color: workout.isComplete
                ? theme.colors.success
                : (isDark ? theme.colors.textSecondary : "#FF9800"),
              fontSize: theme.fontSizes.regularSmall,
              fontWeight: "600",
              fontFamily: theme.fonts.medium,
            }}
          >
            {workout.isComplete ? "Done" : "Pending"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: isDark ? theme.colors.background : "#FFFFFF",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "80%",
            paddingBottom: 40,
          }}
        >
          {/* Fixed Header with Handle Bar, Heading and Close Button */}
          <View
            style={{
              paddingTop: 8,
              paddingBottom: 12,
              paddingHorizontal: 16,
            }}
          >
            {/* Handle Bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: isDark ? theme.colors.border : "#D0D0D0",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 12,
              }}
            />

            {/* Heading and Close Button Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.large,
                  fontFamily: theme.fonts.bold,
                  flex: 1,
                }}
              >
                Workouts
              </Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDark ? theme.colors.backgroundCard : "#F5F5F5",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={isDark ? theme.colors.text : "#666"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal Content - Scrollable List of Workouts */}
          <FlatList
            data={workouts}
            renderItem={({ item, index }) => renderWorkoutCard(item, index)}
            keyExtractor={(item, index) => `workout-${index}`}
            contentContainerStyle={{ padding: 16, paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            pagingEnabled={false}
          />
        </View>
      </View>
    </Modal>
  );
};

export default WorkoutDetailModal;

