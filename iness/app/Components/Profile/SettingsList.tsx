import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/app/Theme/globalTheme";
import { router } from "expo-router";
import { userService } from "@/app/services/user.service";

const handleCoupons = () => {
  router.push("/dashboard/coupon");
};

const handlePolicy = () => {
  router.push("/dashboard/policy");
};

const handleLogout = async () => {
  await userService.logout();
};

const handleSupport = () => {
  router.push("/dashboard/supportchat");
};
const handleCalculator = () => {
  router.push("/dashboard/calculator");
};
const handleYourPurchases = () => {
  router.push("/dashboard/purchases");
};
const handlePreferences = () => {
  router.push("/dashboard/preferences");
};
const handleMeasurements = () => {
  router.push("/dashboard/measurement");
};
const settings = [
  { icon: "pricetags-outline", label: "Coupons", onPress: handleCoupons },
  // { icon: "settings-outline", label: "Settings", onPress: handleSettings },
  {
    icon: "cart-outline",
    label: "Your Purchases",
    onPress: handleYourPurchases,
  },

  {
    icon: "chatbox-ellipses-outline",
    label: "Support",
    onPress: handleSupport,
  },
  {
    icon: "calculator-outline",
    label: "Calculator",
    onPress: handleCalculator,
  },
  {
    icon: "scale-outline",
    label: "Measurements",
    onPress: handleMeasurements,
  },

  {
    icon: "settings-outline",
    label: "Preferences",
    onPress: handlePreferences,
  },

  { icon: "document-text-outline", label: "Policy", onPress: handlePolicy },
  { icon: "log-out-outline", label: "Logout", onPress: handleLogout },
];

export default function SettingsList() {
  return (
    <View>
      {settings.map((item: any, index) => (
        <TouchableOpacity
          key={index}
          onPress={item.onPress}
          style={{
            backgroundColor: theme.colors.cardLight,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={item.icon}
              size={20}
              color={theme.colors.dark}
              style={{ marginRight: 12 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.dark,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              {item.label}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.dark}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
