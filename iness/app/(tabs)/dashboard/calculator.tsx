import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NormalHeader from "@/app/modules/NormalHeader";
import theme from "@/app/Theme/globalTheme";
const backgroundImg = require("../../../assets/images/basicBackground.jpeg");

export default function CalculatorScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmr, setBmr] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h && w) {
      const bmiValue = w / (h * h);
      setBmi(bmiValue);
    }
  };

  const calculateBMR = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseFloat(age);
    if (h && w && a) {
      const bmrValue =
        gender === "male"
          ? 10 * w + 6.25 * h - 5 * a + 5
          : 10 * w + 6.25 * h - 5 * a - 161;
      setBmr(bmrValue);
    }
  };

  const showInfo = (type: "bmi" | "bmr") => {
    if (type === "bmi") {
      setModalContent(
        "BMI (Body Mass Index) is a measure that uses your height and weight to estimate if your weight is healthy."
      );
    } else {
      setModalContent(
        "BMR (Basal Metabolic Rate) is the number of calories your body needs to perform basic life-sustaining functions."
      );
    }
    setModalVisible(true);
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1, padding: 20 }}
      resizeMode="cover"
    >
      <NormalHeader screenName="Health Calculator" />

      {/* BMI Calculator */}
      <View
        style={{
          backgroundColor: theme.colors.cardLight,
          padding: 20,
          borderRadius: 16,
          marginBottom: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          minHeight: 250,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: theme.colors.dark,
              flex: 1,
            }}
          >
            BMI Calculator
          </Text>
          <TouchableOpacity onPress={() => showInfo("bmi")}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.link}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Height (cm)"
          placeholderTextColor={theme.colors.mutedText}
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        />
        <TextInput
          placeholder="Weight (kg)"
          placeholderTextColor={theme.colors.mutedText}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 12,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        />

        <TouchableOpacity
          onPress={calculateBMI}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.dark, fontWeight: "bold" }}>
            Calculate BMI
          </Text>
        </TouchableOpacity>

        {bmi && (
          <View
            style={{
              marginTop: 20,
              alignItems: "center",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: theme.colors.secondPrimary,
                textAlign: "center",
              }}
            >
              Your BMI is:
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: theme.colors.dark,
                textAlign: "center",
              }}
            >
              {bmi.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* BMR Calculator */}
      <View
        style={{
          backgroundColor: theme.colors.cardLight,
          padding: 20,
          borderRadius: 16,
          marginBottom: 30,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          minHeight: 270,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: theme.colors.dark,
              flex: 1,
            }}
          >
            BMR Calculator
          </Text>
          <TouchableOpacity onPress={() => showInfo("bmr")}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.link}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Age"
          placeholderTextColor={theme.colors.mutedText}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        />

        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => setGender("male")}
            style={{
              flex: 1,
              padding: 12,
              marginRight: 6,
              backgroundColor:
                gender === "male" ? theme.colors.secondPrimary : "#fff",
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text
              style={{ color: gender === "male" ? "#fff" : theme.colors.dark }}
            >
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGender("female")}
            style={{
              flex: 1,
              padding: 12,
              marginLeft: 6,
              backgroundColor:
                gender === "female" ? theme.colors.secondPrimary : "#fff",
              borderRadius: 10,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text
              style={{
                color: gender === "female" ? "#fff" : theme.colors.dark,
              }}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={calculateBMR}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.dark, fontWeight: "bold" }}>
            Calculate BMR
          </Text>
        </TouchableOpacity>

        {bmr && (
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: theme.colors.secondPrimary,
              }}
            >
              Your BMR is:
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: theme.colors.dark,
              }}
            >
              {bmr.toFixed(0)} kcal/day
            </Text>
          </View>
        )}
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#000000aa",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 12,
              width: "85%",
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={40}
              color={theme.colors.secondPrimary}
              style={{ alignSelf: "center", marginBottom: 10 }}
            />
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.normal,
                textAlign: "center",
              }}
            >
              {modalContent}
            </Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: theme.colors.link,
                padding: 10,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
