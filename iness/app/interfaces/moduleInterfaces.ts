import { GestureResponderEvent } from "react-native";
import { ImageSourcePropType } from "react-native";
interface AnimatedSubmitButtonProps {
  loading: boolean;
  // ✅ After (no argument needed)
  onPress?: () => void;
  title?: string;
}
interface CustomSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  bgColor: string;
  duration?: number;
}
interface BannerCardProps {
  cardData: {
    title: string;
    backgroundColor: string;
    subtitle: string;
    buttonText: string;
    icon: string;
    imageSource: ImageSourcePropType;
    textColor?: string; // optional, default is white
  };
}
interface TransformationImageUploadModalInterface {
  visible: boolean;
  onClose: () => void;
}
export type {
  AnimatedSubmitButtonProps,
  CustomSnackbarProps,
  BannerCardProps,
  TransformationImageUploadModalInterface,
};
