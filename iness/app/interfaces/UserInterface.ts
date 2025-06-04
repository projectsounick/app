interface UserData {
  name: string;
  sex: string;
  timeCommitment: string;
  profilePic: string;
  goal: string;
  preferredWorkoutTime: string;
  workoutPreferences: string[];
  activityLevel: string;
  weight: string;
  height: string;
  weightUnit: string;
  phoneNumber: string;
  assignedCoupons: string[];
  _id: string;
  preferences?: {
    date: string;
    slot: string;
    address: string;
  };
}

export type { UserData };
