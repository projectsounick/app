import { Snackbar } from "react-native-paper";
import { Animated, Easing, Dimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import theme from "../Theme/globalTheme";
import { CustomSnackbarProps } from "../interfaces/moduleInterfaces";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  visible,
  message,
  onDismiss,
  bgColor,
  duration = 2000,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom + 20; // 20px spacing from bottom

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          // Defer onDismiss to next tick to avoid useInsertionEffect warning
          setTimeout(() => {
            onDismiss();
          }, 0);
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: bottomOffset,
        transform: [{ translateY }],
        zIndex: 9999,
      }}
    >
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={duration}
        style={{
          backgroundColor: bgColor || "#FFFFFF",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <View>
          <Animated.Text
            style={{
              color: "#000000",
              fontSize: theme.fontSizes.regular,
              fontWeight: "500",
              fontFamily: theme.fonts.regular,
            }}
          >
            {message}
          </Animated.Text>
        </View>
      </Snackbar>
    </Animated.View>
  );
};

export default CustomSnackbar;
