interface UserData {
  name: string;
  sex: string;
  timeCommitment: string;
  profilePic: string;
  goal: string;
  preferredWorkoutTime: string;
  workoutPreferences: string[];
  dob: Date;
  activityLevel: string;
  weight: string;
  height: string;
  weightUnit: string;
  healthSync: {
    stepSync: boolean;
    syncModalShown: boolean;
    sleepSync: boolean;
    lastSyncedStepsValue?: number | null;
    lastSyncedStepsDate?: Date | null;
    lastSyncedSleepValue?: number | null;
    lastSyncedSleepDate?: Date | null;
  };
  phoneNumber: string;
  email?: string;
  assignedCoupons: string[];
  _id: string;
  healthReport?: string;
  preferences?: {
    date: string;
    slot: string;
    address: string;
  };
  healthConnect: {
    stepSync: boolean;
    sleepSync: boolean;
    lastSync: Date;
  };
  expoPushToken: string | null;
  appPlatform?: "ios" | "android";
  versionModalClicked?: string;
  iosVersionModalClicked?: string;
  androidVersionModalClicked?: string;
  darkMode?: boolean;
  darkModeModalShown?: boolean;
}

export type { UserData };
