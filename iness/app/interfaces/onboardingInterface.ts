interface OnboardingCardStyle {
  fontSize?: number;
}

interface OnboardingCardInterface {
  index: any;
  option: string;
  state: string | string[];
  updateState: (value: string) => void;
  height: number;
  description?: string;
  icon?: string;
  style?: OnboardingCardStyle;
}

export type { OnboardingCardInterface };
