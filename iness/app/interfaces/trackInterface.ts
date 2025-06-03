interface StepsData {
  steps: number;
  date: string;
  userId: string;
}

interface SleepData {
  sleepDuration: number;
  date: string;
  userId: string;
}

interface WaterData {
  waterIntake: number;
  date: string;
  userId: string;
}

interface TrackingData {
  steps: { steps: number; date: string; userId: string; _id: string } | null;
  sleep: {
    sleepDuration: number;
    date: string;
    userId: string;
    _id: string;
  } | null;
  water: {
    waterIntake: number;
    date: string;
    userId: string;
    _id: string;
  } | null;
}

// Generic update payload type
interface UpdateTrackingPayload {
  type: "steps" | "sleep" | "water";
  data: StepsData | SleepData | WaterData;
}
interface TrackingState {
  currentDateTrackData: TrackingData;
  totalTrackData: TrackingData[];
}

export {
  TrackingData,
  SleepData,
  StepsData,
  WaterData,
  UpdateTrackingPayload,
  TrackingState,
};
