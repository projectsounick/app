/// Static value for onboarding commitment ---------------/
export const onboardingCommitmentOptions = [
  "15-30 minutes",
  "30-60 minutes",
  "One hour or more",
];

//// Static value for onboarding preferred workout time ---------------/
export const onboardingPreferredWorkoutTimeOptions = [
  "Morning",
  "Afternoon",
  "Evening",
];

//// Onboarding steps ------------------------------------------------/
export const onboardingSteps = [
  "Name",
  "Phone Number",

  "Sex",
  "Weight",
  "Height",
  "DOB",
  "Primary Goal",
  "Time Commitment",
  "Preffered Workout Time",
  "Workout Preferences",
  "Activity Level",
];

//// Onboarding Workout Preference Options ----------------------------/
export const workoutPreferenceOptions = [
  {
    label: "Strength Training",
    icon: "weight-lifter", // MaterialCommunityIcons
  },
  {
    label: "Cardio",
    icon: "run-fast", // MaterialCommunityIcons
  },
  {
    label: "Yoga",
    icon: "yoga", // MaterialCommunityIcons
  },
  {
    label: "Pilates",
    icon: "human-handsup", // MaterialCommunityIcons (closest fit)
  },
  {
    label: "Functional Activities",
    icon: "walk", // MaterialCommunityIcons (general fitness symbol)
  },
];

//// Onboarding Goal Options ----------------------------------------/
export const goalOptionsOnboarding = [
  { label: "Lose weight", icon: "scale-bathroom" },
  { label: "Gain Muscle", icon: "arm-flex" },
  { label: "Improve Stamina", icon: "run" },
  { label: "Stay Active", icon: "heart" },
  { label: "Manage stress & Health", icon: "meditation" },
];

//// Onboarding activity level option -------------------------------/
export const activityLevelOptions = [
  {
    label: "Sedentary (Desk Job)",
    description: "Typical Steps: Less than 3k daily",
    icon: "seat-outline", // 🪑 Sitting
  },
  {
    label: "Light Movement",
    description: "Typical Steps: 3k - 7k daily",
    icon: "walk", // 🚶‍♂️ Light walking
  },
  {
    label: "Active Lifestyle ",
    description: "Typical Steps: 7k - 10k daily",
    icon: "run-fast", // 🏃‍♂️ Jogging / running
  },
  {
    label: "Intense Daily Exercise",
    description: "Typical Steps: More than 10k daily",
    icon: "dumbbell", // 🏋️‍♂️ Weight lifting / physical work
  },
  {
    label: "Dynamic Movement",
    description: "Typical Steps: 5k - 20k+; varies daily",
    icon: "pulse", // 📈 Dynamic / changing
  },
];
