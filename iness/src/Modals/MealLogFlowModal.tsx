import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalTheme, useTheme } from "@/src/Theme/ThemeContext";
import {
  mealLogService,
  MealAnalysisResult,
  MealIngredient,
} from "../services/mealLog.service";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import eventBus from "@/event";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MealLogFlowModalProps {
  visible: boolean;
  onClose: () => void;
  onMealSaved?: () => void;
  initialImageUri?: string;
  initialBase64?: string;
}

export default function MealLogFlowModal({
  visible,
  onClose,
  onMealSaved,
  initialImageUri,
  initialBase64,
}: MealLogFlowModalProps) {
  const theme = useGlobalTheme();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // State
  const [step, setStep] = useState<"capture" | "review">("capture");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Camera Mode: "food" (Plate estimation) or "label" (Packaged Nutrition Facts OCR)
  const [scanMode, setScanMode] = useState<"food" | "label">("food");
  // Full-Screen Image Viewer State
  const [fullScreenViewerVisible, setFullScreenViewerVisible] = useState<boolean>(false);

  // AI Nutrition & Camera Policy Consent State
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(true);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState<boolean>(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [hint, setHint] = useState<string>("");

  // Review & Editable Fields
  const [mealName, setMealName] = useState<string>("");
  const [mealType, setMealType] = useState<
    "Breakfast" | "Lunch" | "Dinner" | "Snack"
  >("Lunch");
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [baseNutrition, setBaseNutrition] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
  const [baseIngredients, setBaseIngredients] = useState<MealIngredient[]>([]);

  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(7.5);
  const [nutritionNotes, setNutritionNotes] = useState<string>("");
  const [ingredients, setIngredients] = useState<MealIngredient[]>([]);

  // Edit Macros Bottom Sheet State
  const [editMacrosVisible, setEditMacrosVisible] = useState<boolean>(false);
  const [tempCalories, setTempCalories] = useState<string>("0");
  const [tempProtein, setTempProtein] = useState<string>("0");
  const [tempCarbs, setTempCarbs] = useState<string>("0");
  const [tempFat, setTempFat] = useState<string>("0");
  const [tempFiber, setTempFiber] = useState<string>("0");

  // Dietary & Allergen Safety Guardrails
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [allergenAlerts, setAllergenAlerts] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [showAddCustomTag, setShowAddCustomTag] = useState<boolean>(false);

  // Recent Meals (1-Tap Re-Log) & Water Integration
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [waterToAdd, setWaterToAdd] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      if (initialImageUri && initialBase64) {
        setImageUri(initialImageUri);
        setImageBase64(initialBase64);
        setStep("capture");
      } else {
        resetState();
      }

      // Check if user has previously accepted AI meal & camera policy
      AsyncStorage.getItem("@iness_meal_ai_consent_accepted")
        .then((val) => {
          if (val !== "true") {
            setPolicyAccepted(false);
            setShowConsentModal(true);
          } else {
            setPolicyAccepted(true);
          }
        })
        .catch(() => {});

      // Fetch user's recent meals for 1-tap re-log
      mealLogService
        .getRecentMeals()
        .then((res) => {
          if (res && res.success && Array.isArray(res.meals)) {
            setRecentMeals(res.meals);
          }
        })
        .catch(() => {});
    }
  }, [visible, initialImageUri, initialBase64]);

  const handleAcceptPolicy = async () => {
    try {
      await AsyncStorage.setItem("@iness_meal_ai_consent_accepted", "true");
      setPolicyAccepted(true);
      setShowConsentModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      setShowConsentModal(false);
    }
  };

  const resetState = () => {
    setStep("capture");
    setAnalyzing(false);
    setSaving(false);
    setImageUri(null);
    setImageBase64(null);
    setHint("");
    setMealName("");
    setMealType("Lunch");
    setPortionMultiplier(1.0);
    setBaseNutrition({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    setBaseIngredients([]);
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setFiber(0);
    setHealthScore(7.5);
    setNutritionNotes("");
    setIngredients([]);
    setDietaryTags([]);
    setAllergenAlerts([]);
    setCustomTagInput("");
    setShowAddCustomTag(false);
    setEditMacrosVisible(false);
    setScanMode("food");
    setFullScreenViewerVisible(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Launch Camera
  const handleLaunchCamera = async () => {
    if (!policyAccepted) {
      setShowConsentModal(true);
      return;
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to capture meal photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
      }
    } catch (err: any) {
      Alert.alert("Camera Error", err.message || "Could not open camera.");
    }
  };

  // Launch Gallery
  const handleLaunchGallery = async () => {
    if (!policyAccepted) {
      setShowConsentModal(true);
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
      }
    } catch (err: any) {
      Alert.alert("Gallery Error", err.message || "Could not select photo.");
    }
  };

  // Analyze Meal Image with AI
  const handleAnalyzeMeal = async () => {
    if (!imageBase64) {
      Alert.alert("Photo Required", "Please take or choose a meal picture first.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setAnalyzing(true);

    try {
      const response = await mealLogService.analyzeMeal({
        base64Image: imageBase64,
        mimeType: "image/jpeg",
        hint: hint.trim(),
        scanMode,
      });

      if (response.success && response.data) {
        const data: MealAnalysisResult = response.data;
        const initialCals = data.calories || 0;
        const initialProt = data.protein || 0;
        const initialCarbs = data.carbs || 0;
        const initialFat = data.fat || 0;
        const initialFib = data.fiber || 0;
        const initialIngs = data.ingredients || [];

        setBaseNutrition({
          calories: initialCals,
          protein: initialProt,
          carbs: initialCarbs,
          fat: initialFat,
          fiber: initialFib,
        });
        setBaseIngredients(initialIngs);
        setPortionMultiplier(1.0);

        setMealName(data.mealName || "Nutritious Meal");
        setMealType(data.mealType || "Lunch");
        setCalories(initialCals);
        setProtein(initialProt);
        setCarbs(initialCarbs);
        setFat(initialFat);
        setFiber(initialFib);
        setHealthScore(data.healthScore || 7.5);
        setNutritionNotes(data.nutritionNotes || "");
        setIngredients(initialIngs);
        setDietaryTags(Array.isArray(data.dietaryTags) ? data.dietaryTags : []);
        setAllergenAlerts(Array.isArray(data.allergenAlerts) ? data.allergenAlerts : []);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setStep("review");
      } else if (response.isLocked) {
        Alert.alert(
          "Under Maintenance 🛠️",
          response.message || "Meal logging is currently undergoing maintenance. Please check back shortly.",
          [{ text: "OK", onPress: handleClose }]
        );
      } else if (response.limitReached) {
        Alert.alert("Daily Meal Limit Reached", response.message || "Daily limit reached.");
      } else {
        Alert.alert("AI Analysis", response.message || "Could not analyze meal. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Analysis Failed", err.message || "An unexpected error occurred.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Adjust Portion Multiplier
  const handleMultiplierChange = (mult: number) => {
    Haptics.selectionAsync().catch(() => {});
    setPortionMultiplier(mult);
    setCalories(Math.max(0, Math.round(baseNutrition.calories * mult)));
    setProtein(Math.max(0, Math.round(baseNutrition.protein * mult)));
    setCarbs(Math.max(0, Math.round(baseNutrition.carbs * mult)));
    setFat(Math.max(0, Math.round(baseNutrition.fat * mult)));
    setFiber(Math.max(0, Math.round(baseNutrition.fiber * mult)));

    setIngredients(
      baseIngredients.map((ing) => ({
        ...ing,
        calories: Math.max(0, Math.round((ing.calories || 0) * mult)),
        protein: Math.max(0, Math.round((ing.protein || 0) * mult)),
        carbs: Math.max(0, Math.round((ing.carbs || 0) * mult)),
        fat: Math.max(0, Math.round((ing.fat || 0) * mult)),
        fiber: Math.max(0, Math.round((ing.fiber || 0) * mult)),
      }))
    );
  };

  // Remove individual hallucinated or uneaten ingredient
  const handleRemoveIngredient = (idxToRemove: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const item = ingredients[idxToRemove];
    if (!item) return;

    const updated = ingredients.filter((_, idx) => idx !== idxToRemove);
    setIngredients(updated);

    const nextCals = Math.max(0, calories - (item.calories || 0));
    const nextProt = Math.max(0, protein - (item.protein || 0));
    const nextCarbs = Math.max(0, carbs - (item.carbs || 0));
    const nextFat = Math.max(0, fat - (item.fat || 0));
    const nextFib = Math.max(0, fiber - (item.fiber || 0));

    setCalories(nextCals);
    setProtein(nextProt);
    setCarbs(nextCarbs);
    setFat(nextFat);
    setFiber(nextFib);

    if (portionMultiplier > 0) {
      setBaseNutrition({
        calories: Math.round(nextCals / portionMultiplier),
        protein: Math.round(nextProt / portionMultiplier),
        carbs: Math.round(nextCarbs / portionMultiplier),
        fat: Math.round(nextFat / portionMultiplier),
        fiber: Math.round(nextFib / portionMultiplier),
      });
      setBaseIngredients((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    }
  };

  // 1-Tap Re-Log from Recent Meals
  const handleSelectRecentMeal = (recent: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const c = recent.calories || 0;
    const p = recent.protein || 0;
    const cb = recent.carbs || 0;
    const f = recent.fat || 0;
    const fb = recent.fiber || 0;
    const ings = recent.ingredients || [];

    setMealName(recent.mealName || "Nutritious Meal");
    setMealType(recent.mealType || "Lunch");
    setCalories(c);
    setProtein(p);
    setCarbs(cb);
    setFat(f);
    setFiber(fb);
    setHealthScore(recent.healthScore || 7.5);
    setNutritionNotes(recent.notes || "Re-logged from recent history.");
    setIngredients(ings);
    setDietaryTags(Array.isArray(recent.dietaryTags) ? recent.dietaryTags : []);
    setAllergenAlerts(Array.isArray(recent.allergenAlerts) ? recent.allergenAlerts : []);

    setBaseNutrition({
      calories: c,
      protein: p,
      carbs: cb,
      fat: f,
      fiber: fb,
    });
    setBaseIngredients(ings);
    setPortionMultiplier(1.0);

    if (recent.imageUrl) {
      setImageUri(recent.imageUrl);
    }
    setStep("review");
  };

  // Open Edit Macros Bottom Sheet
  const handleOpenEditMacros = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTempCalories(String(calories));
    setTempProtein(String(protein));
    setTempCarbs(String(carbs));
    setTempFat(String(fat));
    setTempFiber(String(fiber));
    setEditMacrosVisible(true);
  };

  // Adjust numeric value with stepper
  const handleStepValue = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    currentVal: string,
    delta: number
  ) => {
    Haptics.selectionAsync().catch(() => {});
    const num = Math.max(0, Math.round((parseFloat(currentVal) || 0) + delta));
    setter(String(num));
  };

  // Auto calculate calories based on (P * 4 + C * 4 + F * 9)
  const handleAutoCalculateCalories = () => {
    const p = parseFloat(tempProtein) || 0;
    const c = parseFloat(tempCarbs) || 0;
    const f = parseFloat(tempFat) || 0;
    const calculated = Math.round(p * 4 + c * 4 + f * 9);
    setTempCalories(String(calculated));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  // Save manually edited macros
  const handleSaveEditedMacros = () => {
    const newCal = Math.max(0, Math.round(parseFloat(tempCalories) || 0));
    const newProt = Math.max(0, Math.round(parseFloat(tempProtein) || 0));
    const newCarbs = Math.max(0, Math.round(parseFloat(tempCarbs) || 0));
    const newFat = Math.max(0, Math.round(parseFloat(tempFat) || 0));
    const newFib = Math.max(0, Math.round(parseFloat(tempFiber) || 0));

    setCalories(newCal);
    setProtein(newProt);
    setCarbs(newCarbs);
    setFat(newFat);
    setFiber(newFib);

    if (portionMultiplier > 0) {
      setBaseNutrition({
        calories: Math.round(newCal / portionMultiplier),
        protein: Math.round(newProt / portionMultiplier),
        carbs: Math.round(newCarbs / portionMultiplier),
        fat: Math.round(newFat / portionMultiplier),
        fiber: Math.round(newFib / portionMultiplier),
      });
    }

    setEditMacrosVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  // Save Meal to Database
  const handleSaveMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert("Meal Name Required", "Please provide a name for this meal.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setSaving(true);

    try {
      const response = await mealLogService.saveMeal({
        mealName: mealName.trim(),
        mealType,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        ingredients,
        notes: hint.trim(),
        healthScore,
        dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined,
        allergenAlerts: allergenAlerts.length > 0 ? allergenAlerts : undefined,
        base64Image: imageBase64 || undefined,
        mimeType: "image/jpeg",
      });

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        eventBus.emit("meal-logged", response.data);
        onMealSaved?.();
        Alert.alert(
          "Meal Logged! 🎉",
          `${mealName} saved successfully to your nutrition diary.`,
          [{ text: "Done", onPress: handleClose }]
        );
      } else if (response.isLocked) {
        Alert.alert(
          "Under Maintenance 🛠️",
          response.message || "Meal logging is currently undergoing maintenance. Please check back shortly.",
          [{ text: "OK", onPress: handleClose }]
        );
      } else if (response.limitReached) {
        Alert.alert("Daily Limit Reached", response.message || "Daily limit reached.");
      } else {
        Alert.alert("Save Failed", response.message || "Could not save meal log.");
      }
    } catch (err: any) {
      Alert.alert("Save Error", err.message || "Failed to save meal log.");
    } finally {
      setSaving(false);
    }
  };

  const mealTypes: Array<"Breakfast" | "Lunch" | "Dinner" | "Snack"> = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 16),
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <LinearGradient
              colors={["#9747FF", "#7C3AED"]}
              style={styles.headerIconBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="food-apple" size={14} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {step === "capture" ? "Log Meal with AI" : "Review Nutrition"}
            </Text>
          </View>

          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: CAPTURE & OPTIONAL HINT */}
          {step === "capture" && (
            <View style={styles.stepContainer}>
              {/* CAMERA / SCAN MODE SELECTOR */}
              <View
                style={[
                  styles.modeSelectorBar,
                  {
                    backgroundColor: isDark ? "#1E2028" : "#EEF2F6",
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.modeOptionBtn,
                    scanMode === "food" && [
                      styles.modeOptionBtnActive,
                      {
                        backgroundColor: isDark ? "#2C303E" : "#FFFFFF",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      },
                    ],
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setScanMode("food");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={15}
                    color={scanMode === "food" ? "#9747FF" : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeOptionText,
                      {
                        color: scanMode === "food" ? theme.colors.text : theme.colors.textSecondary,
                        fontWeight: scanMode === "food" ? "700" : "500",
                      },
                    ]}
                  >
                    Food Plate
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeOptionBtn,
                    scanMode === "label" && [
                      styles.modeOptionBtnActive,
                      {
                        backgroundColor: isDark ? "#2C303E" : "#FFFFFF",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      },
                    ],
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setScanMode("label");
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="barcode-scan"
                    size={15}
                    color={scanMode === "label" ? "#9747FF" : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeOptionText,
                      {
                        color: scanMode === "label" ? theme.colors.text : theme.colors.textSecondary,
                        fontWeight: scanMode === "label" ? "700" : "500",
                      },
                    ]}
                  >
                    Nutrition Table
                  </Text>
                  <View style={styles.proModeBadge}>
                    <Text style={styles.proModeBadgeText}>100% OCR</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Photo Card / Preview */}
              {imageUri ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.retakeFloatingBtn}
                    onPress={() => setImageUri(null)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera-reverse" size={16} color="#FFF" />
                    <Text style={styles.retakeText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    styles.capturePlaceholder,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={scanMode === "label" ? ["#7C3AED", "#4F46E5"] : ["#9747FF", "#6825C9"]}
                    style={styles.cameraEmblem}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {scanMode === "label" ? (
                      <MaterialCommunityIcons name="barcode-scan" size={32} color="#FFF" />
                    ) : (
                      <Ionicons name="camera" size={32} color="#FFF" />
                    )}
                  </LinearGradient>
                  <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
                    {scanMode === "label" ? "Scan Nutrition Facts Table" : "Snap Your Meal"}
                  </Text>
                  <Text style={[styles.placeholderDesc, { color: theme.colors.textSecondary }]}>
                    {scanMode === "label"
                      ? "Point your camera directly at the printed Nutrition Table on packaged foods, protein bars, yogurt, or supplements for 100% precision."
                      : "Point your camera at your food plate. Iness AI will automatically estimate portions and count macros."}
                  </Text>

                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.primaryActionBtn, { backgroundColor: "#9747FF" }]}
                      onPress={handleLaunchCamera}
                      activeOpacity={0.85}
                    >
                      {scanMode === "label" ? (
                        <MaterialCommunityIcons name="barcode-scan" size={18} color="#FFF" />
                      ) : (
                        <Ionicons name="camera" size={18} color="#FFF" />
                      )}
                      <Text style={styles.actionBtnText}>
                        {scanMode === "label" ? "Scan Nutrition Table" : "Take Photo"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.secondaryActionBtn,
                        {
                          backgroundColor: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.05)",
                          borderColor: theme.colors.border,
                        },
                      ]}
                      onPress={handleLaunchGallery}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="images" size={18} color={theme.colors.text} />
                      <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>
                        Gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* RECENT MEALS (1-TAP QUICK RE-LOG) */}
              {!imageUri && recentMeals && recentMeals.length > 0 && (
                <View style={styles.recentSection}>
                  <View style={styles.recentHeaderRow}>
                    <MaterialCommunityIcons name="history" size={16} color="#9747FF" />
                    <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
                      Quick Re-Log (Recent Meals)
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recentScrollContent}
                  >
                    {recentMeals.map((m, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.recentCard,
                          {
                            backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => handleSelectRecentMeal(m)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.recentCardTop}>
                          <Text
                            style={[styles.recentCardName, { color: theme.colors.text }]}
                            numberOfLines={1}
                          >
                            {m.mealName}
                          </Text>
                          <View style={styles.recentTypePill}>
                            <Text style={styles.recentTypeText}>{m.mealType}</Text>
                          </View>
                        </View>
                        <View style={styles.recentCardMacros}>
                          <Text style={[styles.recentCal, { color: theme.colors.text }]}>
                            {m.calories} <Text style={{ fontSize: 9 }}>kcal</Text>
                          </Text>
                          <Text style={styles.recentProt}>
                            {m.protein}g protein
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Optional Hint Input */}
              {imageUri && (
                <View
                  style={[
                    styles.hintCard,
                    {
                      backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.hintHeaderRow}>
                    <Ionicons
                      name={scanMode === "label" ? "barcode-outline" : "chatbubble-ellipses-outline"}
                      size={16}
                      color="#9747FF"
                    />
                    <Text style={[styles.hintTitle, { color: theme.colors.text }]}>
                      {scanMode === "label" ? "Packaged Item Details (Optional)" : "Add a Hint (Optional)"}
                    </Text>
                  </View>
                  <Text style={[styles.hintSubtitle, { color: theme.colors.textSecondary }]}>
                    {scanMode === "label"
                      ? "Mention brand name, flavor, or serving size (e.g. 1 whole bar or 2 scoops) for exact precision."
                      : "Mention hidden ingredients like butter, olive oil, whey powder, or exact portions for better accuracy."}
                  </Text>
                  <TextInput
                    style={[
                      styles.hintInput,
                      {
                        color: theme.colors.text,
                        backgroundColor: isDark ? "#1E2028" : "#F4F6F9",
                        borderColor: theme.colors.border,
                      },
                    ]}
                    placeholder={
                      scanMode === "label"
                        ? "e.g. Whole Truth Peanut Butter Bar (60g) or 1 scoop whey"
                        : "e.g. 2 whole scrambled eggs with brown bread and 1 tsp butter"
                    }
                    placeholderTextColor={theme.colors.textMuted}
                    value={hint}
                    onChangeText={setHint}
                    multiline
                    maxLength={200}
                  />

                  {/* Analyze with AI Button */}
                  <TouchableOpacity
                    style={[styles.analyzeBtn, { backgroundColor: "#9747FF" }]}
                    onPress={handleAnalyzeMeal}
                    activeOpacity={0.85}
                    disabled={analyzing}
                  >
                    <LinearGradient
                      colors={scanMode === "label" ? ["#7C3AED", "#4F46E5"] : ["#9747FF", "#7C3AED"]}
                      style={styles.gradientBtnBg}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons
                        name={scanMode === "label" ? "barcode-outline" : "sparkles"}
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.analyzeBtnText}>
                        {scanMode === "label" ? "Extract Nutrition Facts with AI" : "Analyze with Iness AI"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* Policy & Disclaimers Link */}
              <TouchableOpacity
                style={styles.policyFooterLink}
                onPress={() => setShowConsentModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="shield-checkmark-outline" size={13} color={theme.colors.textMuted} />
                <Text style={[styles.policyFooterText, { color: theme.colors.textMuted }]}>
                  AI Nutrition & Camera Policy • Disclaimers
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: REVIEW & BREAKDOWN */}
          {step === "review" && (
            <View style={styles.stepContainer}>
              {/* Photo Thumbnail + Editable Title */}
              <View
                style={[
                  styles.reviewHeaderCard,
                  {
                    backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {imageUri && (
                  <TouchableOpacity
                    style={styles.reviewThumbWrapper}
                    onPress={() => setFullScreenViewerVisible(true)}
                    activeOpacity={0.85}
                    accessibilityLabel="View full screen food photo"
                  >
                    <Image source={{ uri: imageUri }} style={styles.reviewThumb} />
                    <View style={styles.zoomBadge}>
                      <Ionicons name="expand" size={11} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[styles.inputLabelSmall, { color: theme.colors.textMuted }]}>
                      MEAL NAME
                    </Text>
                    {scanMode === "label" && (
                      <View style={styles.labelDetectedBadge}>
                        <MaterialCommunityIcons name="barcode-scan" size={10} color="#9747FF" />
                        <Text style={styles.labelDetectedText}>Label OCR</Text>
                      </View>
                    )}
                  </View>
                  <TextInput
                    style={[
                      styles.mealNameInput,
                      { color: theme.colors.text, borderBottomColor: theme.colors.border },
                    ]}
                    value={mealName}
                    onChangeText={setMealName}
                    placeholder="Meal Name"
                    placeholderTextColor={theme.colors.textMuted}
                  />

                  {/* Health Score Pill */}
                  <View style={styles.healthScoreRow}>
                    <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                    <Text style={styles.healthScoreText}>
                      Health Score: {healthScore.toFixed(1)}/10
                    </Text>
                  </View>
                </View>
              </View>

              {/* Meal Type Pills */}
              <View style={styles.mealTypeRow}>
                {mealTypes.map((type) => {
                  const isSelected = mealType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.mealTypePill,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? "rgba(151,71,255,0.25)"
                              : "rgba(151,71,255,0.12)"
                            : theme.colors.backgroundSecondary,
                          borderColor: isSelected ? "#9747FF" : theme.colors.border,
                        },
                      ]}
                      onPress={() => setMealType(type)}
                    >
                      <Text
                        style={[
                          styles.mealTypeText,
                          {
                            color: isSelected ? "#9747FF" : theme.colors.textSecondary,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 🥗 DIETARY & ALLERGEN SAFETY GUARDRAILS */}
              <View
                style={[
                  styles.guardrailCard,
                  {
                    backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.guardrailHeaderRow}>
                  <View style={styles.guardrailTitleLeft}>
                    <MaterialCommunityIcons name="shield-check" size={17} color="#10B981" />
                    <Text style={[styles.guardrailTitle, { color: theme.colors.text }]}>
                      Dietary & Allergen Guardrails
                    </Text>
                  </View>
                  <View style={styles.aiTagBadge}>
                    <Ionicons name="sparkles" size={10} color="#9747FF" />
                    <Text style={styles.aiTagBadgeText}>AI Vision Scan</Text>
                  </View>
                </View>

                {/* Allergen Advisories */}
                {allergenAlerts.length > 0 && (
                  <View style={styles.allergenSectionBox}>
                    <View style={styles.allergenSectionTitleRow}>
                      <Ionicons name="warning-outline" size={12} color="#D97706" />
                      <Text style={styles.allergenSectionTitleText}>Allergen Advisories</Text>
                    </View>
                    <View style={styles.guardrailsWrapRow}>
                      {allergenAlerts.map((alert, idx) => (
                        <View key={`alert-${idx}`} style={styles.allergenAlertPill}>
                          <Text style={styles.allergenAlertPillText}>⚠️ {alert}</Text>
                          <TouchableOpacity
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                              setAllergenAlerts((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            style={styles.tagDismissBtn}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            <Ionicons name="close-circle" size={14} color="#D97706" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Dietary Tags */}
                <View style={{ marginTop: allergenAlerts.length > 0 ? 8 : 2 }}>
                  <View style={styles.dietarySectionTitleRow}>
                    <MaterialCommunityIcons name="leaf" size={13} color="#10B981" />
                    <Text style={[styles.dietarySectionTitleText, { color: theme.colors.textSecondary }]}>
                      Dietary Classification
                    </Text>
                  </View>

                  <View style={styles.guardrailsWrapRow}>
                    {dietaryTags.map((tag, idx) => (
                      <View key={`diet-${idx}`} style={styles.dietaryVerifiedPill}>
                        <Text style={styles.dietaryVerifiedPillText}>🌱 {tag}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setDietaryTags((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          style={styles.tagDismissBtn}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="close-circle" size={14} color="#059669" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {dietaryTags.length === 0 && allergenAlerts.length === 0 && (
                      <View style={styles.safeNeutralPill}>
                        <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                        <Text style={styles.safeNeutralPillText}>
                          No common allergens or restrictions flagged
                        </Text>
                      </View>
                    )}

                    {/* Quick Add Presets */}
                    {["Vegetarian", "Vegan", "Gluten-Free", "High-Protein", "Dairy-Free", "Nut-Free"]
                      .filter((preset) => !dietaryTags.includes(preset))
                      .map((preset) => (
                        <TouchableOpacity
                          key={`preset-${preset}`}
                          style={[
                            styles.presetAddPill,
                            {
                              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                            },
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                            setDietaryTags((prev) => [...prev, preset]);
                          }}
                        >
                          <Ionicons name="add" size={11} color={theme.colors.textMuted} />
                          <Text style={[styles.presetAddText, { color: theme.colors.textMuted }]}>
                            {preset}
                          </Text>
                        </TouchableOpacity>
                      ))}

                    {/* Toggle Custom Tag Input Button */}
                    {!showAddCustomTag && (
                      <TouchableOpacity
                        style={[
                          styles.presetAddPill,
                          {
                            borderColor: "rgba(151,71,255,0.3)",
                            backgroundColor: isDark ? "rgba(151,71,255,0.1)" : "rgba(151,71,255,0.05)",
                          },
                        ]}
                        onPress={() => setShowAddCustomTag(true)}
                      >
                        <Ionicons name="add" size={11} color="#9747FF" />
                        <Text style={[styles.presetAddText, { color: "#9747FF", fontWeight: "600" }]}>
                          Custom Tag
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Inline Custom Tag Input */}
                  {showAddCustomTag && (
                    <View style={styles.customTagInputRow}>
                      <TextInput
                        style={[
                          styles.customTagTextInput,
                          {
                            color: theme.colors.text,
                            backgroundColor: isDark ? "#1E2028" : "#F4F6F9",
                            borderColor: theme.colors.border,
                          },
                        ]}
                        placeholder="e.g. Nut Allergy, Keto, Halal"
                        placeholderTextColor={theme.colors.textMuted}
                        value={customTagInput}
                        onChangeText={setCustomTagInput}
                        autoFocus
                        maxLength={30}
                      />
                      <TouchableOpacity
                        style={[styles.customTagAddBtn, { backgroundColor: "#9747FF" }]}
                        onPress={() => {
                          const trimmed = customTagInput.trim();
                          if (trimmed && !dietaryTags.includes(trimmed)) {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                            setDietaryTags((prev) => [...prev, trimmed]);
                          }
                          setCustomTagInput("");
                          setShowAddCustomTag(false);
                        }}
                      >
                        <Text style={styles.customTagAddBtnText}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.customTagCancelBtn, { borderColor: theme.colors.border }]}
                        onPress={() => {
                          setCustomTagInput("");
                          setShowAddCustomTag(false);
                        }}
                      >
                        <Ionicons name="close" size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Portion Multiplier / Serving Size Scale */}
              <View
                style={[
                  styles.portionSection,
                  {
                    backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.portionHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialCommunityIcons name="scale-bathroom" size={16} color="#9747FF" />
                    <Text style={[styles.portionTitle, { color: theme.colors.text }]}>
                      Serving Portion Size
                    </Text>
                  </View>
                  <View style={styles.portionBadge}>
                    <Text style={styles.portionBadgeText}>{portionMultiplier}x</Text>
                  </View>
                </View>

                <View style={styles.portionPillsRow}>
                  {[0.5, 0.75, 1.0, 1.5, 2.0].map((mult) => {
                    const isSelected = portionMultiplier === mult;
                    return (
                      <TouchableOpacity
                        key={mult}
                        style={[
                          styles.portionPill,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(151,71,255,0.25)"
                                : "rgba(151,71,255,0.12)"
                              : theme.colors.backgroundSecondary,
                            borderColor: isSelected ? "#9747FF" : theme.colors.border,
                          },
                        ]}
                        onPress={() => handleMultiplierChange(mult)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.portionPillText,
                            {
                              color: isSelected ? "#9747FF" : theme.colors.textSecondary,
                              fontWeight: isSelected ? "700" : "500",
                            },
                          ]}
                        >
                          {mult === 1.0 ? "1x Normal" : `${mult}x`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Primary Macro Rings / Cards */}
              <View style={styles.macrosSection}>
                <View style={styles.macroHeaderRow}>
                  <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                    Macro Breakdown
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.macroEditHeaderBtn,
                      {
                        backgroundColor: isDark
                          ? "rgba(151,71,255,0.22)"
                          : "rgba(151,71,255,0.12)",
                        borderColor: isDark
                          ? "rgba(151,71,255,0.4)"
                          : "rgba(151,71,255,0.25)",
                      },
                    ]}
                    onPress={handleOpenEditMacros}
                    activeOpacity={0.8}
                    accessibilityLabel="Edit macro sizes"
                  >
                    <Ionicons name="pencil" size={13} color="#9747FF" />
                    <Text style={styles.macroEditHeaderBtnText}>Edit Macros</Text>
                  </TouchableOpacity>
                </View>

                {/* Calories Highlight Card */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleOpenEditMacros}
                >
                  <LinearGradient
                    colors={["#9747FF", "#7C3AED"]}
                    style={styles.caloriesBanner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.caloriesLabel}>TOTAL ENERGY</Text>
                        <Ionicons name="pencil" size={11} color="rgba(255,255,255,0.8)" />
                      </View>
                      <Text style={styles.caloriesValue}>{calories} kcal</Text>
                    </View>
                    <MaterialCommunityIcons name="fire" size={36} color="rgba(255,255,255,0.8)" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* 4 Macro Cards: Protein, Carbs, Fat, Fiber */}
                <View style={styles.macroCardsGrid}>
                  {/* Protein */}
                  <TouchableOpacity
                    style={[
                      styles.macroCard,
                      {
                        backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleOpenEditMacros}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.macroPillBadge, { backgroundColor: "rgba(151,71,255,0.15)" }]}>
                      <Text style={[styles.macroPillText, { color: "#9747FF" }]}>PROTEIN</Text>
                    </View>
                    <Text style={[styles.macroNum, { color: theme.colors.text }]}>{protein}g</Text>
                    <Text style={[styles.macroSub, { color: theme.colors.textMuted }]}>
                      {Math.round(protein * 4)} kcal
                    </Text>
                  </TouchableOpacity>

                  {/* Carbs */}
                  <TouchableOpacity
                    style={[
                      styles.macroCard,
                      {
                        backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleOpenEditMacros}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.macroPillBadge, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                      <Text style={[styles.macroPillText, { color: "#F59E0B" }]}>CARBS</Text>
                    </View>
                    <Text style={[styles.macroNum, { color: theme.colors.text }]}>{carbs}g</Text>
                    <Text style={[styles.macroSub, { color: theme.colors.textMuted }]}>
                      {Math.round(carbs * 4)} kcal
                    </Text>
                  </TouchableOpacity>

                  {/* Fat */}
                  <TouchableOpacity
                    style={[
                      styles.macroCard,
                      {
                        backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleOpenEditMacros}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.macroPillBadge, { backgroundColor: "rgba(236,72,153,0.15)" }]}>
                      <Text style={[styles.macroPillText, { color: "#EC4899" }]}>FAT</Text>
                    </View>
                    <Text style={[styles.macroNum, { color: theme.colors.text }]}>{fat}g</Text>
                    <Text style={[styles.macroSub, { color: theme.colors.textMuted }]}>
                      {Math.round(fat * 9)} kcal
                    </Text>
                  </TouchableOpacity>

                  {/* Fiber */}
                  <TouchableOpacity
                    style={[
                      styles.macroCard,
                      {
                        backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={handleOpenEditMacros}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.macroPillBadge, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
                      <Text style={[styles.macroPillText, { color: "#10B981" }]}>FIBER</Text>
                    </View>
                    <Text style={[styles.macroNum, { color: theme.colors.text }]}>{fiber}g</Text>
                    <Text style={[styles.macroSub, { color: theme.colors.textMuted }]}>Digestion</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nutritionist Notes */}
              {nutritionNotes ? (
                <View
                  style={[
                    styles.notesBox,
                    {
                      backgroundColor: isDark ? "rgba(151,71,255,0.12)" : "rgba(151,71,255,0.06)",
                      borderColor: isDark ? "rgba(151,71,255,0.3)" : "rgba(151,71,255,0.2)",
                    },
                  ]}
                >
                  <Ionicons name="sparkles" size={16} color="#9747FF" style={{ marginTop: 2 }} />
                  <Text style={[styles.notesText, { color: theme.colors.text }]}>
                    {nutritionNotes}
                  </Text>
                </View>
              ) : null}

              {/* Detected Ingredients List */}
              {ingredients.length > 0 && (
                <View style={styles.ingredientsSection}>
                  <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                    Detected Ingredients ({ingredients.length})
                  </Text>
                  <View
                    style={[
                      styles.ingredientsCard,
                      {
                        backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    {ingredients.map((ing, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.ingredientRow,
                          idx < ingredients.length - 1 && {
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: theme.colors.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={[styles.ingredientName, { color: theme.colors.text }]}>
                            {ing.name}
                          </Text>
                          {ing.quantity ? (
                            <Text style={[styles.ingredientQty, { color: theme.colors.textMuted }]}>
                              {ing.quantity}
                            </Text>
                          ) : null}
                        </View>
                        <View style={styles.ingredientMacros}>
                          <Text style={[styles.ingredientCal, { color: theme.colors.text }]}>
                            {ing.calories} kcal
                          </Text>
                          <Text style={[styles.ingredientMacroText, { color: theme.colors.textSecondary }]}>
                            P: {ing.protein}g • C: {ing.carbs}g • F: {ing.fat}g
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeIngBtn}
                          onPress={() => handleRemoveIngredient(idx)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          accessibilityLabel={`Remove ${ing.name}`}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={isDark ? "#F87171" : "#EF4444"}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Water Quick-Log Chip Row */}
              <View
                style={[
                  styles.waterQuickLogBox,
                  {
                    backgroundColor: theme.colors.backgroundCard || theme.colors.backgroundSecondary,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="water" size={16} color="#38BDF8" />
                  <Text style={[styles.waterBoxLabel, { color: theme.colors.text }]}>
                    Hydration with this meal:
                  </Text>
                </View>
                <View style={styles.waterPillsRow}>
                  {[0, 250, 500].map((amt) => {
                    const isSelected = waterToAdd === amt;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[
                          styles.waterPill,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(56,189,248,0.25)"
                                : "rgba(56,189,248,0.12)"
                              : theme.colors.backgroundSecondary,
                            borderColor: isSelected ? "#38BDF8" : theme.colors.border,
                          },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          setWaterToAdd(amt);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.waterPillText,
                            {
                              color: isSelected ? "#38BDF8" : theme.colors.textSecondary,
                              fontWeight: isSelected ? "700" : "500",
                            },
                          ]}
                        >
                          {amt === 0 ? "No Water" : `+${amt}ml`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Action Buttons: Save & Retake */}
              <View style={styles.bottomButtonsRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: "#9747FF" }]}
                  onPress={handleSaveMeal}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                      <Text style={styles.saveBtnText}>Save Meal</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.retakeBtn,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setStep("capture")}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  <Ionicons name="reload" size={16} color={theme.colors.text} />
                  <Text style={[styles.retakeBtnText, { color: theme.colors.text }]}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* AI ANALYZING BOTTOM SHEET DIALOG */}
        <Modal
          visible={analyzing}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.analyzingOverlay}>
            <View
              style={[
                styles.analyzingCard,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <LinearGradient
                colors={["#9747FF", "#6825C9"]}
                style={styles.analyzingEmblem}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={28} color="#FFF" />
              </LinearGradient>

              <Text style={[styles.analyzingTitle, { color: theme.colors.text }]}>
                Iness AI is Analyzing Your Meal...
              </Text>
              <Text style={[styles.analyzingSubtitle, { color: theme.colors.textSecondary }]}>
                Detecting food items, estimating portion sizes, and computing calories, protein, carbs & fat.
              </Text>

              <ActivityIndicator
                size="large"
                color="#9747FF"
                style={{ marginVertical: 20 }}
              />

              <View
                style={[
                  styles.analyzingTipBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(151,71,255,0.1)"
                      : "rgba(151,71,255,0.06)",
                  },
                ]}
              >
                <Ionicons name="bulb-outline" size={16} color="#9747FF" />
                <Text style={[styles.analyzingTipText, { color: theme.colors.textSecondary }]}>
                  Consistency is key. Logging your meals helps Iness AI adapt your workout and recovery guidance!
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* EDIT MACROS BOTTOM SHEET MODAL */}
        <Modal
          visible={editMacrosVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setEditMacrosVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetOverlay}
          >
            <TouchableOpacity
              style={styles.sheetBackdrop}
              activeOpacity={1}
              onPress={() => setEditMacrosVisible(false)}
            />
            <View
              style={[
                styles.sheetCard,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  paddingBottom: Math.max(insets.bottom, 20) + 10,
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.sheetHandlePill} />

              {/* Sheet Header */}
              <View style={styles.sheetHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                    Edit Meal Macros
                  </Text>
                  <Text style={[styles.sheetSubtitle, { color: theme.colors.textSecondary }]}>
                    Fine-tune calories or individual macros
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.sheetCloseBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                  onPress={() => setEditMacrosVisible(false)}
                >
                  <Ionicons name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 370 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* CALORIES ROW */}
                <View
                  style={[
                    styles.macroEditRow,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.macroRowLabelBox}>
                    <MaterialCommunityIcons name="fire" size={22} color="#FF5722" />
                    <View>
                      <Text style={[styles.macroRowTitle, { color: theme.colors.text }]}>
                        Calories
                      </Text>
                      <Text style={[styles.macroRowSub, { color: theme.colors.textMuted }]}>
                        Energy (kcal)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.macroStepperBox}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempCalories, tempCalories, -25)}
                    >
                      <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.stepperInput,
                        {
                          color: theme.colors.text,
                          backgroundColor: isDark ? "#1E2028" : "#FFFFFF",
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={tempCalories}
                      onChangeText={setTempCalories}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempCalories, tempCalories, 25)}
                    >
                      <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* PROTEIN ROW */}
                <View
                  style={[
                    styles.macroEditRow,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.macroRowLabelBox}>
                    <View style={[styles.macroIconCircle, { backgroundColor: "rgba(151,71,255,0.15)" }]}>
                      <Text style={{ color: "#9747FF", fontSize: 11, fontWeight: "800" }}>P</Text>
                    </View>
                    <View>
                      <Text style={[styles.macroRowTitle, { color: theme.colors.text }]}>
                        Protein
                      </Text>
                      <Text style={[styles.macroRowSub, { color: theme.colors.textMuted }]}>
                        Grams (4 kcal/g)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.macroStepperBox}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempProtein, tempProtein, -5)}
                    >
                      <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.stepperInput,
                        {
                          color: theme.colors.text,
                          backgroundColor: isDark ? "#1E2028" : "#FFFFFF",
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={tempProtein}
                      onChangeText={setTempProtein}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempProtein, tempProtein, 5)}
                    >
                      <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* CARBS ROW */}
                <View
                  style={[
                    styles.macroEditRow,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.macroRowLabelBox}>
                    <View style={[styles.macroIconCircle, { backgroundColor: "rgba(245,158,11,0.15)" }]}>
                      <Text style={{ color: "#F59E0B", fontSize: 11, fontWeight: "800" }}>C</Text>
                    </View>
                    <View>
                      <Text style={[styles.macroRowTitle, { color: theme.colors.text }]}>
                        Carbs
                      </Text>
                      <Text style={[styles.macroRowSub, { color: theme.colors.textMuted }]}>
                        Grams (4 kcal/g)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.macroStepperBox}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempCarbs, tempCarbs, -5)}
                    >
                      <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.stepperInput,
                        {
                          color: theme.colors.text,
                          backgroundColor: isDark ? "#1E2028" : "#FFFFFF",
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={tempCarbs}
                      onChangeText={setTempCarbs}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempCarbs, tempCarbs, 5)}
                    >
                      <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* FAT ROW */}
                <View
                  style={[
                    styles.macroEditRow,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.macroRowLabelBox}>
                    <View style={[styles.macroIconCircle, { backgroundColor: "rgba(236,72,153,0.15)" }]}>
                      <Text style={{ color: "#EC4899", fontSize: 11, fontWeight: "800" }}>F</Text>
                    </View>
                    <View>
                      <Text style={[styles.macroRowTitle, { color: theme.colors.text }]}>
                        Fat
                      </Text>
                      <Text style={[styles.macroRowSub, { color: theme.colors.textMuted }]}>
                        Grams (9 kcal/g)
                      </Text>
                    </View>
                  </View>
                  <View style={styles.macroStepperBox}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempFat, tempFat, -2)}
                    >
                      <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.stepperInput,
                        {
                          color: theme.colors.text,
                          backgroundColor: isDark ? "#1E2028" : "#FFFFFF",
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={tempFat}
                      onChangeText={setTempFat}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempFat, tempFat, 2)}
                    >
                      <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* FIBER ROW */}
                <View
                  style={[
                    styles.macroEditRow,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.macroRowLabelBox}>
                    <View style={[styles.macroIconCircle, { backgroundColor: "rgba(16,185,129,0.15)" }]}>
                      <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "800" }}>Fib</Text>
                    </View>
                    <View>
                      <Text style={[styles.macroRowTitle, { color: theme.colors.text }]}>
                        Fiber
                      </Text>
                      <Text style={[styles.macroRowSub, { color: theme.colors.textMuted }]}>
                        Grams
                      </Text>
                    </View>
                  </View>
                  <View style={styles.macroStepperBox}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempFiber, tempFiber, -1)}
                    >
                      <Ionicons name="remove" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.stepperInput,
                        {
                          color: theme.colors.text,
                          backgroundColor: isDark ? "#1E2028" : "#FFFFFF",
                          borderColor: theme.colors.border,
                        },
                      ]}
                      value={tempFiber}
                      onChangeText={setTempFiber}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={[styles.stepperBtn, { backgroundColor: isDark ? "#2A2D3A" : "#E2E8F0" }]}
                      onPress={() => handleStepValue(setTempFiber, tempFiber, 1)}
                    >
                      <Ionicons name="add" size={16} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* AUTO CALCULATE BUTTON */}
                <TouchableOpacity
                  style={[
                    styles.autoCalcBtn,
                    {
                      borderColor: isDark
                        ? "rgba(151,71,255,0.3)"
                        : "rgba(151,71,255,0.2)",
                      backgroundColor: isDark
                        ? "rgba(151,71,255,0.1)"
                        : "rgba(151,71,255,0.06)",
                    },
                  ]}
                  onPress={handleAutoCalculateCalories}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calculator-outline" size={16} color="#9747FF" />
                  <Text style={styles.autoCalcText}>
                    Sync Calories from Macros (4×P + 4×C + 9×F)
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* ACTION BUTTONS */}
              <View style={styles.sheetButtonsRow}>
                <TouchableOpacity
                  style={[styles.sheetApplyBtn, { backgroundColor: "#9747FF" }]}
                  onPress={handleSaveEditedMacros}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#9747FF", "#7C3AED"]}
                    style={styles.sheetApplyGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                    <Text style={styles.sheetApplyBtnText}>Apply Macro Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sheetCancelBtn,
                    {
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => setEditMacrosVisible(false)}
                >
                  <Text style={[styles.sheetCancelBtnText, { color: theme.colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* FULL-SCREEN HIGH-RES PHOTO VIEWER MODAL WITH PINCH-TO-ZOOM */}
        <Modal
          visible={fullScreenViewerVisible}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setFullScreenViewerVisible(false)}
        >
          <View style={styles.viewerContainer}>
            {/* Top Toolbar */}
            <View style={[styles.viewerHeader, { paddingTop: Math.max(insets.top, 16) }]}>
              <TouchableOpacity
                style={styles.viewerCloseBtn}
                onPress={() => setFullScreenViewerVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.viewerTitleBox}>
                <Text style={styles.viewerTitleText} numberOfLines={1}>
                  {mealName || "High-Res Food Photo"}
                </Text>
                <Text style={styles.viewerSubtitleText}>
                  Pinch to zoom • Pan to inspect details
                </Text>
              </View>

              <View style={{ width: 36 }} />
            </View>

            {/* Pinch to Zoom ScrollView */}
            {imageUri && (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.viewerScrollContent}
                maximumZoomScale={4}
                minimumZoomScale={1}
                centerContent={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bouncesZoom={true}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              </ScrollView>
            )}
          </View>
        </Modal>

        {/* AI NUTRITION & CAMERA POLICY CONSENT MODAL */}
        <Modal
          visible={showConsentModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            if (!policyAccepted) {
              handleClose();
            } else {
              setShowConsentModal(false);
            }
          }}
        >
          <View style={styles.consentOverlay}>
            <View
              style={[
                styles.consentCard,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  paddingBottom: Math.max(insets.bottom, 20) + 12,
                },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.sheetHandlePill} />

              <View style={styles.consentHeaderRow}>
                <LinearGradient
                  colors={["#9747FF", "#7C3AED"]}
                  style={styles.consentEmblem}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.consentTitle, { color: theme.colors.text }]}>
                    AI Nutrition & Camera Policy
                  </Text>
                  <Text style={[styles.consentSubtitle, { color: theme.colors.textSecondary }]}>
                    Please review our disclosures before logging meals
                  </Text>
                </View>
              </View>

              <ScrollView
                style={{ maxHeight: 340, marginTop: 14 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.consentPointsList}>
                  {/* Point 1 */}
                  <View
                    style={[
                      styles.consentPointCard,
                      {
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="camera-outline" size={20} color="#9747FF" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.consentPointTitle, { color: theme.colors.text }]}>
                        Camera & Food Photos
                      </Text>
                      <Text style={[styles.consentPointDesc, { color: theme.colors.textSecondary }]}>
                        We access your camera or gallery only to capture food plates and scan printed Nutrition Facts tables. Images are stored securely in your private diary and never sold to third parties.
                      </Text>
                    </View>
                  </View>

                  {/* Point 2 */}
                  <View
                    style={[
                      styles.consentPointCard,
                      {
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="robot-outline" size={20} color="#9747FF" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.consentPointTitle, { color: theme.colors.text }]}>
                        AI Vision & OCR Analysis
                      </Text>
                      <Text style={[styles.consentPointDesc, { color: theme.colors.textSecondary }]}>
                        Iness AI uses computer vision to detect meal items, portion weights, and optical character recognition for packaged nutrition labels.
                      </Text>
                    </View>
                  </View>

                  {/* Point 3 */}
                  <View
                    style={[
                      styles.consentPointCard,
                      {
                        backgroundColor: isDark
                          ? "rgba(245,158,11,0.08)"
                          : "rgba(245,158,11,0.05)",
                        borderColor: "rgba(245,158,11,0.25)",
                      },
                    ]}
                  >
                    <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.consentPointTitle, { color: isDark ? "#FBBF24" : "#D97706" }]}>
                        Health & Dietary Disclaimer
                      </Text>
                      <Text style={[styles.consentPointDesc, { color: theme.colors.textSecondary }]}>
                        Nutritional estimations (calories, protein, carbs, fat, fiber) and health scores are for fitness and wellness tracking only. They do not constitute certified medical or clinical nutrition advice.
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* View Full Privacy Policy Link */}
              <TouchableOpacity
                style={styles.fullPolicyLink}
                onPress={() => setPrivacyModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text-outline" size={14} color="#9747FF" />
                <Text style={styles.fullPolicyLinkText}>
                  Read Complete Iness Privacy Policy & Terms
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.consentButtonsRow}>
                <TouchableOpacity
                  style={[styles.consentAcceptBtn, { backgroundColor: "#9747FF" }]}
                  onPress={handleAcceptPolicy}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#9747FF", "#7C3AED"]}
                    style={styles.consentGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.consentAcceptBtnText}>I Understand & Agree</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {!policyAccepted && (
                  <TouchableOpacity
                    style={[
                      styles.consentDeclineBtn,
                      {
                        backgroundColor: theme.colors.backgroundSecondary,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => {
                      setShowConsentModal(false);
                      handleClose();
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.consentDeclineBtnText, { color: theme.colors.textSecondary }]}>
                      Decline & Exit
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* FULL PRIVACY POLICY MODAL */}
        <PrivacyPolicyModal
          visible={privacyModalVisible}
          onClose={() => setPrivacyModalVisible(false)}
          onAccept={() => {
            setPrivacyModalVisible(false);
            handleAcceptPolicy();
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepContainer: {
    gap: 16,
  },
  previewContainer: {
    position: "relative",
    width: "100%",
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  retakeFloatingBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  retakeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  capturePlaceholder: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  cameraEmblem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#9747FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  placeholderDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  hintCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  hintHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  hintSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  hintInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 56,
    textAlignVertical: "top",
  },
  analyzeBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
  },
  gradientBtnBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  analyzeBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  reviewHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  reviewThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  inputLabelSmall: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  mealNameInput: {
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 2,
    borderBottomWidth: 1,
  },
  healthScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  healthScoreText: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "700",
  },
  mealTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  mealTypePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  mealTypeText: {
    fontSize: 12,
  },
  portionSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  portionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  portionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(151,71,255,0.15)",
  },
  portionBadgeText: {
    color: "#9747FF",
    fontSize: 11,
    fontWeight: "800",
  },
  portionPillsRow: {
    flexDirection: "row",
    gap: 6,
  },
  portionPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  portionPillText: {
    fontSize: 11,
  },
  macrosSection: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
  },
  caloriesBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  caloriesLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  caloriesValue: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "800",
  },
  macroCardsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  macroCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  macroPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  macroPillText: {
    fontSize: 9,
    fontWeight: "800",
  },
  macroNum: {
    fontSize: 16,
    fontWeight: "800",
  },
  macroSub: {
    fontSize: 10,
    marginTop: 2,
  },
  notesBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  ingredientsSection: {
    gap: 8,
  },
  ingredientsCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: "600",
  },
  ingredientQty: {
    fontSize: 11,
    marginTop: 2,
  },
  ingredientMacros: {
    alignItems: "flex-end",
  },
  ingredientCal: {
    fontSize: 13,
    fontWeight: "700",
  },
  ingredientMacroText: {
    fontSize: 10,
    marginTop: 2,
  },
  removeIngBtn: {
    padding: 6,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  retakeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  analyzingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  analyzingCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  analyzingEmblem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  analyzingSubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  analyzingTipBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  analyzingTipText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  macroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  macroEditHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  macroEditHeaderBtnText: {
    color: "#9747FF",
    fontSize: 12,
    fontWeight: "700",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  sheetBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandlePill: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(150,150,150,0.4)",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  macroEditRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  macroRowLabelBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  macroIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  macroRowTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  macroRowSub: {
    fontSize: 10,
    marginTop: 1,
  },
  macroStepperBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  stepperInput: {
    width: 58,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
  autoCalcBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  autoCalcText: {
    color: "#9747FF",
    fontSize: 12,
    fontWeight: "700",
  },
  sheetButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  sheetApplyBtn: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  sheetApplyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  sheetApplyBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  sheetCancelBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  sheetCancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  recentSection: {
    marginTop: 14,
    gap: 8,
  },
  recentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  recentScrollContent: {
    gap: 10,
    paddingVertical: 2,
  },
  recentCard: {
    width: 150,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  recentCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  recentCardName: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  recentTypePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: "rgba(151,71,255,0.12)",
  },
  recentTypeText: {
    fontSize: 9,
    color: "#9747FF",
    fontWeight: "700",
  },
  recentCardMacros: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentCal: {
    fontSize: 12,
    fontWeight: "800",
  },
  recentProt: {
    fontSize: 10,
    color: "#9747FF",
    fontWeight: "700",
  },
  waterQuickLogBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    marginBottom: 8,
  },
  waterBoxLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  waterPillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  waterPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  waterPillText: {
    fontSize: 11,
  },
  // Camera Mode Switcher
  modeSelectorBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  modeOptionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modeOptionBtnActive: {},
  modeOptionText: {
    fontSize: 12,
  },
  proModeBadge: {
    backgroundColor: "#9747FF",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  proModeBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // Review thumbnail with zoom indicator
  reviewThumbWrapper: {
    position: "relative",
  },
  zoomBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  labelDetectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(151,71,255,0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelDetectedText: {
    color: "#9747FF",
    fontSize: 9,
    fontWeight: "700",
  },
  // Full-Screen Image Viewer
  viewerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  viewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  viewerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerTitleBox: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  viewerTitleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  viewerSubtitleText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 2,
  },
  viewerScrollContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  // Policy footer link
  policyFooterLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
  },
  policyFooterText: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Consent Modal
  consentOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  consentCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  consentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  consentEmblem: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  consentSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  consentPointsList: {
    gap: 10,
    paddingVertical: 4,
  },
  consentPointCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  consentPointTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  consentPointDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  fullPolicyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 6,
  },
  fullPolicyLinkText: {
    color: "#9747FF",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  consentButtonsRow: {
    gap: 8,
    marginTop: 8,
  },
  consentAcceptBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  consentGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  consentAcceptBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  consentDeclineBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  consentDeclineBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  // Guardrail Card Styles
  guardrailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  guardrailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  guardrailTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  guardrailTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  aiTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(151,71,255,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  aiTagBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9747FF",
  },
  allergenSectionBox: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(245,158,11,0.08)",
  },
  allergenSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  allergenSectionTitleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },
  dietarySectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  dietarySectionTitleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  guardrailsWrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  allergenAlertPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.16)",
    borderColor: "rgba(245,158,11,0.4)",
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  allergenAlertPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },
  dietaryVerifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.12)",
    borderColor: "rgba(16,185,129,0.35)",
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dietaryVerifiedPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  safeNeutralPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  safeNeutralPillText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#10B981",
  },
  presetAddPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  presetAddText: {
    fontSize: 11,
  },
  tagDismissBtn: {
    padding: 1,
    marginLeft: 2,
  },
  customTagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  customTagTextInput: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  customTagAddBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  customTagAddBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  customTagCancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
