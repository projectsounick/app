import FitnessGoalsCard from "@/app/modules/FitnessCard";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

///// Main funcitonal component for the NameHeader----------------------------/
export default function NameHeader({ userData }: any) {
  return (
    <>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "white",
          marginTop: 4,
        }}
      >
        Namaste {userData?.name?.split(" ")[0]}! 🙏
      </Text>
      <Text style={{ color: "white" }}>
        Get ready to crush your fitness goals today.
      </Text>

      <FitnessGoalsCard />
    </>
  );
}
