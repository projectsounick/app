export interface ExerciseInterface {
  _id: string;
  name: string;
  images: string[];
  videos: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetItem {
  repRange: number;
  timer: string;
}

export interface EachexerciseItem {
  sets: SetItem[];
  exercise: ExerciseInterface;
}

export interface WorkoutPlanInterface {
  _id?: string;
  planName: string;
  description?: string;
  goals?: string[];
  importantNotes?: string[];
  weekendRecommendations?: string[];
  sourceText?: string;
  sourceDocumentUrl?: string;
  sourceDocumentName?: string;
  sourceDocumentMimeType?: string;
  sourceDocumentOriginalName?: string;
  sun: EachexerciseItem[];
  mon: EachexerciseItem[];
  tue: EachexerciseItem[];
  wed: EachexerciseItem[];
  thu: EachexerciseItem[];
  fri: EachexerciseItem[];
  sat: EachexerciseItem[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface ActiveManualWorkoutPlanInterface {
  _id?: string;
  userId: any; // Only _id
  assignerId: any; // Only _id
  workoutPlanId: WorkoutPlanInterface;
  startDate: string; // ISO String
  endDate: string; // ISO String (from frontend)
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
