import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ImageBackground,
} from "react-native";
import SmallHeader from "@/app/modules/SmallHeader";
import Icon from "react-native-vector-icons/Feather";
import BackHeader from "@/app/modules/BackHeader";
import ChooseDateSection from "@/app/Components/PurchaseDetails.tsx/DateSelection";
import SlotSelectionSection from "@/app/Components/PurchaseDetails.tsx/SlotSelection";
import PlaceSelectionSection from "@/app/Components/PurchaseDetails.tsx/PlaceSelection";
import BottomButton from "@/app/Components/PurchaseDetails.tsx/BottomButton";
import { useLocalSearchParams } from "expo-router";
import { slots } from "@/utils/staticDataUtils";
import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";

///// Main functional component for the Book session details screen --------------/
const BookSessionDetailsScreen = () => {
  const { type } = useLocalSearchParams();
  console.log(type);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("8:00 AM - 9:00 AM");
  const [place, setPlace] = useState<"Home" | "Gym">("Home");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [addressMap, setAddressMap] = useState<{ [key: string]: string }>({
    Home: "",
    Gym: "",
  });

  function onSelectSlot(currentSlot: string) {
    setSelectedSlot(currentSlot);
  }
  //// Function for adding to the cart ---------------------------/
  async function addToCart() {
    if (type === "offline" && addressMap.Home == "") {
      setSnackbarMessage("Write down your address");
      setSnackbarOpen(true);
    } else {
      //// when type is online address is not needed
    }
  }
  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpeg")} // Adjust path as needed
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        <SmallHeader title="Plans" />
        <BackHeader />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <ChooseDateSection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <SlotSelectionSection
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            slots={slots}
          />
          {type == "offline" ? (
            <PlaceSelectionSection
              place={place}
              onPlaceChange={setPlace}
              addressMap={addressMap}
              onAddressChange={(placeKey, text) =>
                setAddressMap((prev) => ({ ...prev, [placeKey]: text }))
              }
            />
          ) : null}
        </ScrollView>

        {/* Bottom Bar */}
        <BottomButton onSubmit={addToCart} />
      </View>
      <CustomSnackbar
        visible={snackbarOpen}
        message={snackbarMessage}
        onDismiss={() => setSnackbarOpen(false)}
        bgColor={theme.colors.primary}
      />
    </ImageBackground>
  );
};

export default BookSessionDetailsScreen;
