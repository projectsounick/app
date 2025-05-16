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
          marginTop: 8,
        }}
      >
        Namaste {userData?.name?.split(" ")[0]}! 🙏
      </Text>
      <Text style={{ color: "white" }}>
        Get ready to crush your fitness goals today.
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "4%",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#4A2A75",
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            borderColor: "#A4FF55",
            borderWidth: 1,
          }}
          onPress={() => router.push("/dashboard/supportchat")}
        >
          <Text style={{ color: "#A4FF55" }}>💬 Chat with us</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
