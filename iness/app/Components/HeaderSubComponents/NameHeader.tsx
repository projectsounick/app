import FitnessGoalsCard from "@/app/modules/FitnessCard";
import theme from "@/app/Theme/globalTheme";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

///// Main funcitonal component for the NameHeader----------------------------/
export default function NameHeader({ userData }: any) {
  return (
    <>
      <Text
        style={{
          fontSize: theme.fontSizes.large,
          fontFamily: theme.fonts.bold,
          color: theme.colors.textWhite,
          marginTop: 8,
        }}
      >
        Namaste {userData?.name?.split(" ")[0]}! 🙏
      </Text>
      <Text
        style={{
          color: theme.colors.textWhite,
          fontFamily: theme.fonts.regular,
          marginTop: 4,
        }}
      >
        Get ready to crush your fitness goals today.
      </Text>

      <FitnessGoalsCard />
    </>
  );
}
