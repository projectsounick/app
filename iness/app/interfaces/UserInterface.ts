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
  phoneNumber: string;
  assignedCoupons: string[];
  _id: string;
  healthReport?: string;
  preferences?: {
    date: string;
    slot: string;
    address: string;
  };
  expoPushToken: string;
}

export type { UserData };
