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
import { SafeAreaView } from "react-native-safe-area-context";

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
          const preferences = response?.user?.preferences ?? {};
          const { slot, date, address } = preferences;

          if (slot && date && address) {
            const dateObject = new Date(date);

            setSnackbarMessage("Profile updated successfully.");
            setSnackbarOpen(true);
            setSelectedSlot(slot);
            setSelectedDate(dateObject);
            setAddressMap({
              Home: address,
              Gym: "",
            });
            setPreferences(true);
          } else {
            setSnackbarOpen(true);
            setSnackbarMessage("Unable to update your data, try again");
            // Optionally set default values or show a warning
          }
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
      source={require("../../../assets/images/basicBackground.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["top", "left", "right"]}
      >
        <View style={{ paddingLeft: 20, paddingTop: 20 }}>
          <NormalHeader screenName="Preferences" />
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
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
                paddingVertical: 40,
              }}
            >
              <ActivityIndicator color={theme.colors.secondPrimary} size="large" />
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
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 20,
            backgroundColor: "transparent",
          }}
        >
          <AnimatedSubmitButton
            loading={loading}
            title={preferences ? "Request to Change" : "Add"}
            onPress={handleUpdate}
            height={50}
          />
        </View>
      </SafeAreaView>
      <CustomSnackbar
        visible={snackbarOpen}
        message={snackbarMessage}
        onDismiss={() => setSnackbarOpen(false)}
        bgColor={theme.colors.success}
      />
    </ImageBackground>
  );
};

export default BookSessionDetailsScreen;
