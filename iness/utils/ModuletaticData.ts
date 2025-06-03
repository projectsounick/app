import theme from "../app/Theme/globalTheme";
export const bookSessionCardData = {
  title: "Book a session with our fitness expert.",
  subtitle: "Get answers to all questions about your goals.",
  buttonText: "Book Session",
  icon: "clock",
  redirectionPageName: "/dashboard/session",
  backgroundColor: ["#3D0E7B", "#000000"],
  imageSource: require("../assets/images/booksession.png"), // your local image
  textColor: theme.colors.text, // optional, any hex
};

//// Data for tracking card -----------------------/
export const trackingCardData = {
  title: "Track your activity",
  subtitle: "Tailored equipment for your personalized lifestyles.",
  buttonText: "Track Now",
  redirectionPageName: "/dashboard/track",
  icon: "target",
  backgroundColor: ["#9C56F6", "#3A1B63"],
  imageSource: require("../assets/images/track.png"), // your local image
  textColor: theme.colors.text, // optional, any hex
};
// cardsData.ts
export const onlineSessionCardData = {
  title: "Online Session",
  subtitle:
    "Join a live 1-on-1 session with a certified trainer from anywhere.",
  buttonText: "Book Session",
  params: "online",
  redirectionPageName: "/dashboard/addressconfirmation",
  icon: "video", // or any icon from your icon set
  backgroundColor: ["#3D0E7B", "#000000"], // Gradient purple background
  imageSource: require("../assets/images/onlineSession.png"), // Replace with your actual image
  textColor: "#FFFFFF",
};

export const offlineSessionCardData = {
  title: "Offline Session",
  subtitle: "Book an in-person session at your preferred location.",
  buttonText: "Book Session",
  params: "offline",
  redirectionPageName: "/dashboard/addressconfirmation",
  icon: "users", // or any icon
  backgroundColor: ["#3D0E7B", "#000000"], // Gradient dark background (optional)
  imageSource: require("../assets/images/offlineSession.png"),
  textColor: "#FFFFFF",
};
