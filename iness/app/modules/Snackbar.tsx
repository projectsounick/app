import { Snackbar } from "react-native-paper";
import { Animated, Easing, Dimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import theme from "../Theme/globalTheme";
import { CustomSnackbarProps } from "../interfaces/moduleInterfaces";

const { height } = Dimensions.get("window");

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  visible,
  message,
  onDismiss,
  bgColor,
  duration = 2000,
}) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const [showBackdrop, setShowBackdrop] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowBackdrop(true);

      Animated.timing(translateY, {
        toValue: height / 2.5,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          setShowBackdrop(false);
          onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setShowBackdrop(false);
    }
  }, [visible]);

  return (
    <>
      {showBackdrop && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)", // 👈 semi-transparent dark background
            zIndex: 9998,
          }}
        />
      )}
      <Animated.View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          transform: [{ translateY }],
          zIndex: 9999,
        }}
      >
        <Snackbar
          visible={visible}
          onDismiss={onDismiss}
          duration={duration}
          action={{
            label: "Close",
            onPress: onDismiss,
            labelStyle: {
              color: theme.colors.black,
              fontWeight: "bold",
            },
          }}
          style={{
            backgroundColor: bgColor,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View>
            <Animated.Text
              style={{
                color: theme.colors.black,
                fontSize: theme.fontSizes.medium,
                fontWeight: "600",
              }}
            >
              {message}
            </Animated.Text>
          </View>
        </Snackbar>
      </Animated.View>
    </>
  );
};

export default CustomSnackbar;
