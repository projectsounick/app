export const formatDateTime = (date: string | Date): string => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return ""; // invalid date fallback

  return parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
