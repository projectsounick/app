import theme from "../app/Theme/globalTheme";
export const bookSessionCardData = {
  title: "Book a session with our fitness expert.",
  subtitle: "Get answers to all questions about your goals.",
  buttonText: "Book Session",
  icon: "clock",
  backgroundColor: "rgba(58, 27, 99, 1)",
  imageSource: require("../assets/images/booksession.png"), // your local image
  textColor: theme.colors.text, // optional, any hex
};

//// Data for tracking card -----------------------/
export const trackingCardData = {
  title: "Track your activity",
  subtitle: "Tailored equipment for your personalized lifestyles.",
  buttonText: "Track Now",
  icon: "target",
  backgroundColor: "rgba(214, 182, 255, 1)",
  imageSource: require("../assets/images/track.png"), // your local image
  textColor: theme.colors.dark, // optional, any hex
};
