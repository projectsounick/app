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
    sleepSync: boolean;
    lastSyncedStepsValue?: number | null;
    lastSyncedStepsDate?: Date | null;
    lastSyncedSleepValue?: number | null;
    lastSyncedSleepDate?: Date | null;
  };
  phoneNumber: string;
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
}

export type { UserData };
