import React, { useEffect, useState } from "react";
import { View, ScrollView, ImageBackground } from "react-native";

import ChooseDateSection from "@/app/Components/PurchaseDetails.tsx/DateSelection";
import SlotSelectionSection from "@/app/Components/PurchaseDetails.tsx/SlotSelection";
import PlaceSelectionSection from "@/app/Components/PurchaseDetails.tsx/PlaceSelection";

import CustomSnackbar from "@/app/modules/Snackbar";
import theme from "@/app/Theme/globalTheme";
import NormalHeader from "@/app/modules/NormalHeader";
import { ActivityIndicator } from "react-native-paper";
import AnimatedSubmitButton from "@/app/modules/AnimatedSubmitButton";
import { userService } from "@/app/services/user.service";
import { asyncStorageUtils } from "@/utils/asyncStorageUtils";
import { notificationService } from "@/app/services/notification.service";

///// Main functional component for the Book session details screen --------------/
const BookSessionDetailsScreen = () => {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [place, setPlace] = useState<"Home" | "Gym">("Home");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [addressMap, setAddressMap] = useState<{ [key: string]: string }>({
    Home: "",
    Gym: "",
  });
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  function onSelectSlot(currentSlot: string) {
    if (preferences) {
      return;
    }
    setSelectedSlot(currentSlot);
  }
  const handleUpdate = async () => {
    try {
      setLoading(true);
      if (preferences) {
        //// when preferences is true it means user has set it's preferences he/she can do it
        /// only once so need to send the notification in this case ----------------/

        let response = await notificationService.createNotification({
          title: "Slot change request",
          body: "User wants to change his slots",
          isAdmin: true,
        });
        if (response.success) {
          setSnackbarOpen(true);
          setSnackbarMessage("Your slot change request has been send ");
        } else {
          setSnackbarOpen(false);
          setSnackbarMessage("Some error has happened");
        }
      } else {
        if (!selectedSlot && addressMap.Home == "") {
          setSnackbarOpen(true);
          setSnackbarMessage("Kindly provide the details");
          return;
        }
        let data = {
          preferences: {
            date: selectedDate,
            slot: selectedSlot,
            address: addressMap.Home,
          },
        };
        // Update the user via your service
        let response = await userService.updateUser(data);

        if (response.success) {
          /// update the data in the async stroage --------/
          await asyncStorageUtils.updateUserDataInAsyncStorage(response.user);
          setSnackbarMessage("Profile updated successfully.");
          setSnackbarOpen(true);
          setSelectedSlot(null);
          setAddressMap({
            Home: "",
            Gym: "",
          });
          setPreferences(true);
        } else {
          setSnackbarOpen(true);
          setSnackbarMessage("Unable to update your data, try again");
        }
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      setSnackbarMessage("Failed to update profile. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  //// Function for getting the slots from the cloud  ------------------------------/
  async function getSlotsFromCloud() {
    try {
      setSlotsLoading(true);
      const response = await fetch(
        "https://inessstorage.blob.core.windows.net/admin-data/Jsons/slotsJson"
      );
      if (!response.ok) {
        throw new Error("Some error has happened");
      }
      let data = await response.json();
      setSlots(data.slots);
      /// getting data from the asyncstorage -----------------/
      const userResponse =
        await asyncStorageUtils.checkIfKeyExistsInAsyncStorage("user");
      if (!userResponse.exists) {
        return;
      } else {
        if (userResponse.data.preferences) {
          setSelectedSlot(userResponse.data.preferences.slot);
          let date = new Date(userResponse.data.preferences.date);
          setSelectedDate(date);
          setAddressMap({
            Home: userResponse.data.preferences.address,
            Gym: "",
          });
          setPreferences(true);
        }
      }
    } catch (error) {
    } finally {
      setSlotsLoading(false);
    }
  }
  useEffect(() => {
    getSlotsFromCloud();
  }, []);
  return (
    <ImageBackground
      source={require("../../../assets/images/basicBackground.jpg")} // Adjust path as needed
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        <View style={{ paddingLeft: 20, paddingTop: 20 }}>
          <NormalHeader screenName="Preferences" />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          <ChooseDateSection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            preferences={preferences}
          />
          {slotsLoading ? (
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator />
            </View>
          ) : (
            <SlotSelectionSection
              selectedSlot={selectedSlot}
              onSelectSlot={onSelectSlot}
              slots={slots}
            />
          )}

          <PlaceSelectionSection
            place={place}
            onPlaceChange={setPlace}
            addressMap={addressMap}
            preferences={preferences}
            onAddressChange={(placeKey, text) =>
              setAddressMap((prev) => ({ ...prev, [placeKey]: text }))
            }
          />
        </ScrollView>
        <AnimatedSubmitButton
          loading={false}
          title={preferences ? "Request to Change" : "Add"}
          onPress={handleUpdate}
        />
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
