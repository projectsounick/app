import { config } from "../shared/config";
import { fetchWrapper } from "../helpers/fetchWrapper";

const baseUrl = `${config.apiUrl}/api`;

export interface MealIngredient {
  name: string;
  quantity?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface MealLogItem {
  _id: string;
  userId: string;
  date: string;
  time: string;
  mealName: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  imageUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: MealIngredient[];
  notes?: string;
  healthScore?: number;
  confidence?: string;
  dietaryTags?: string[];
  allergenAlerts?: string[];
  createdAt: string;
}

export interface DailyMacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyMacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyMealsResponse {
  success: boolean;
  date: string;
  meals: MealLogItem[];
  loggedCount: number;
  maxMeals: number;
  remainingMeals: number;
  dailyTotals: DailyMacroTotals;
  targets: DailyMacroTargets;
  streak?: number;
  isLocked?: boolean;
}

export interface DaySummary {
  date: string;
  dayOfWeek: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealCount: number;
  avgHealthScore: number;
}

export interface WeeklyNutritionTrendsResponse {
  success: boolean;
  dailySummaries: DaySummary[];
  weeklyAverageCalories: number;
  totalCalories: number;
  macroSplit: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  bestProteinDay: {
    date: string;
    dayOfWeek: string;
    protein: number;
  } | null;
  cleanestDay: {
    date: string;
    dayOfWeek: string;
    healthScore: number;
    calories: number;
  } | null;
  message?: string;
}

export interface UserStreakDataResponse {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
  totalMealsLogged: number;
  streakMaintainedToday: boolean;
  message?: string;
}

export interface MealAnalysisResult {
  mealName: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number;
  confidence: string;
  nutritionNotes: string;
  ingredients: MealIngredient[];
  dietaryTags?: string[];
  allergenAlerts?: string[];
  remainingMeals: number;
  maxMeals: number;
}

export const mealLogService = {
  // 1. Analyze Meal Image with Google Gemini (Synchronous)
  analyzeMeal: async (params: {
    base64Image: string;
    mimeType?: string;
    hint?: string;
    scanMode?: "food" | "label";
  }): Promise<{
    success: boolean;
    data?: MealAnalysisResult;
    limitReached?: boolean;
    isLocked?: boolean;
    message?: string;
  }> => {
    try {
      const response = await fetchWrapper.post(`${baseUrl}/meal-analyze`, params);
      return response;
    } catch (error: any) {
      console.error("mealLogService.analyzeMeal error:", error);
      return {
        success: false,
        message: error?.message || "Failed to analyze meal image. Please check your connection.",
      };
    }
  },

  // 1b. Analyze Meal Image with Queue Background Processing (Asynchronous)
  analyzeMealAsync: async (params: {
    base64Image: string;
    mimeType?: string;
    hint?: string;
    scanMode?: "food" | "label";
  }): Promise<{
    success: boolean;
    async?: boolean;
    jobId?: string;
    status?: "pending" | "processing" | "completed" | "failed";
    imageUrl?: string;
    limitReached?: boolean;
    isLocked?: boolean;
    message?: string;
  }> => {
    try {
      const response = await fetchWrapper.post(`${baseUrl}/meal-analyze`, {
        ...params,
        mode: "async",
      });
      return response;
    } catch (error: any) {
      console.error("mealLogService.analyzeMealAsync error:", error);
      return {
        success: false,
        message: error?.message || "Failed to start async meal analysis. Please check your connection.",
      };
    }
  },

  // 1c. Poll or retrieve status of background meal analysis job
  getMealAnalysisJobStatus: async (
    jobId?: string,
    latest?: boolean
  ): Promise<{
    success: boolean;
    jobId?: string;
    status?: "pending" | "processing" | "completed" | "failed";
    data?: MealAnalysisResult;
    imageUrl?: string;
    isReviewed?: boolean;
    error?: string;
    message?: string;
  }> => {
    try {
      const query = jobId
        ? `?jobId=${encodeURIComponent(jobId)}`
        : latest
        ? "?latest=true"
        : "";
      const response = await fetchWrapper.get(`${baseUrl}/meal-analyze-status${query}`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.getMealAnalysisJobStatus error:", error);
      return {
        success: false,
        status: "failed",
        message: error?.message || "Failed to fetch job status",
      };
    }
  },

  // 1d. Mark background meal analysis job as reviewed
  markJobReviewed: async (jobId: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetchWrapper.put(
        `${baseUrl}/meal-analyze-status?action=reviewed&jobId=${encodeURIComponent(jobId)}`,
        {}
      );
      return response;
    } catch {
      return { success: false };
    }
  },

  // 2. Save Meal Log to Database
  saveMeal: async (mealData: {
    mealName: string;
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    ingredients?: MealIngredient[];
    notes?: string;
    healthScore?: number;
    confidence?: string;
    dietaryTags?: string[];
    allergenAlerts?: string[];
    base64Image?: string;
    imageUrl?: string;
    mimeType?: string;
    date?: string;
  }): Promise<{
    success: boolean;
    data?: MealLogItem;
    dailySummary?: DailyMacroTotals;
    remainingMeals?: number;
    maxMeals?: number;
    limitReached?: boolean;
    isLocked?: boolean;
    message?: string;
  }> => {
    try {
      const response = await fetchWrapper.post(`${baseUrl}/meal-log`, mealData);
      return response;
    } catch (error: any) {
      console.error("mealLogService.saveMeal error:", error);
      return {
        success: false,
        message: error?.message || "Failed to save meal log.",
      };
    }
  },

  // 3. Get Daily Meal Logs and Macro Progress
  getDailyMeals: async (date?: string): Promise<DailyMealsResponse> => {
    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : "";
      const response = await fetchWrapper.get(`${baseUrl}/meal-log${query}`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.getDailyMeals error:", error);
      return {
        success: false,
        date: date || new Date().toISOString().split("T")[0],
        meals: [],
        loggedCount: 0,
        maxMeals: 6,
        remainingMeals: 6,
        dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
        targets: { calories: 2200, protein: 130, carbs: 250, fat: 65, fiber: 30 },
      };
    }
  },

  // 4. Get Meal History for Calendar
  getMealHistory: async (
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    history?: Record<
      string,
      {
        date: string;
        mealsCount: number;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        meals: MealLogItem[];
      }
    >;
    totalMeals?: number;
    message?: string;
  }> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetchWrapper.get(`${baseUrl}/meal-history${query}`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.getMealHistory error:", error);
      return {
        success: false,
        history: {},
        totalMeals: 0,
        message: error?.message,
      };
    }
  },

  // 5. Delete a logged meal
  deleteMeal: async (mealId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetchWrapper.delete(`${baseUrl}/meal-log?mealId=${mealId}`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.deleteMeal error:", error);
      return {
        success: false,
        message: error?.message || "Failed to delete meal log.",
      };
    }
  },

  // 6. Get Recent Unique Meals for 1-Tap Quick Re-Log
  getRecentMeals: async (): Promise<{
    success: boolean;
    meals: MealLogItem[];
    message?: string;
  }> => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/meal-log?action=recent`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.getRecentMeals error:", error);
      return {
        success: false,
        meals: [],
        message: error?.message,
      };
    }
  },

  // 7. Get 7-Day Weekly Nutrition Trends & Best/Worst Days
  getWeeklyNutritionTrends: async (
    endDate?: string
  ): Promise<WeeklyNutritionTrendsResponse> => {
    try {
      const query = endDate ? `?action=trends&endDate=${endDate}` : `?action=trends`;
      const response = await fetchWrapper.get(`${baseUrl}/meal-log${query}`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.getWeeklyNutritionTrends error:", error);
      return {
        success: false,
        dailySummaries: [],
        weeklyAverageCalories: 0,
        totalCalories: 0,
        macroSplit: { proteinPercent: 30, carbsPercent: 45, fatPercent: 25 },
        bestProteinDay: null,
        cleanestDay: null,
        message: error?.message,
      };
    }
  },

  // 8. Get User Streak Data & Cache
  getUserStreakData: async (): Promise<UserStreakDataResponse> => {
    try {
      const response = await fetchWrapper.get(`${baseUrl}/meal-log?action=streak`);
      return response;
    } catch (error: any) {
      console.error("mealLogService.getUserStreakData error:", error);
      return {
        success: false,
        currentStreak: 0,
        longestStreak: 0,
        lastLoggedDate: null,
        totalMealsLogged: 0,
        streakMaintainedToday: false,
        message: error?.message,
      };
    }
  },

  // 9. Toggle Favorite Meal Bookmark
  toggleFavoriteMeal: async (
    mealId: string
  ): Promise<{ success: boolean; meal?: MealLogItem; message?: string }> => {
    try {
      const response = await fetchWrapper.put(
        `${baseUrl}/meal-log?action=favorite&mealId=${mealId}`,
        {}
      );
      return response;
    } catch (error: any) {
      console.error("mealLogService.toggleFavoriteMeal error:", error);
      return { success: false, message: error?.message };
    }
  },

  // 10. Update Meal Macros
  updateMealMacros: async (
    mealId: string,
    macros: Partial<DailyMacroTotals>
  ): Promise<{ success: boolean; meal?: MealLogItem; message?: string }> => {
    try {
      const response = await fetchWrapper.put(
        `${baseUrl}/meal-log?action=macros&mealId=${mealId}`,
        macros
      );
      return response;
    } catch (error: any) {
      console.error("mealLogService.updateMealMacros error:", error);
      return { success: false, message: error?.message };
    }
  },
};
