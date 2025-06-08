export interface SessionWorkout {
  sessionId: string;
  exercise: string;
  sets: number;
  reps: number;
  timer: string;
  isComplete: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Trainer Interface
export interface Trainer {
  __v: number;
  _id: string;
  createdAt: string;
  dob: string;
  email: string;
  isActive: boolean;
  name: string;
  onboarding: boolean;
  phoneNumber: string;
  role: "trainer";
  sex: "M" | "F" | "O";
  trainerDetails: any; // Replace with a specific type if known
  updatedAt: string;
}

// Session Interface
export interface Session {
  _id: string;
  activePlanDetails: any; // Replace with actual type if available
  activePlanId: string;
  color: string;
  createdAt: string;
  end: string;
  isActive: boolean;
  sessionAgainstPlan: boolean;
  sessionDate: string;
  sessionDuration: string;
  sessionStatus: "scheduled" | "completed" | "missed"; // Extend as needed
  sessionTime: string;
  sessionType: "online" | "offline";
  sessionAddress?: string;
  start: string;
  trainer: Trainer;
  trainerId: string;
  updatedAt: string;
  userId: string;
  workouts: SessionWorkout[];
}
