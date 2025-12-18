import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PromotionalVideoItem {
  url: string;
  active: boolean;
  number?: number;
}

const STORAGE_KEY = "promotionalVideo";
const JSON_URL = "https://inessstorage.blob.core.windows.net/iness-public/promotionVideos.json";

/**
 * Fetch promotional videos from the JSON file
 */
export async function fetchPromotionalVideos(): Promise<PromotionalVideoItem[]> {
  try {
    const cacheBuster = Date.now();
    const response = await fetch(`${JSON_URL}?cacheBuster=${cacheBuster}`);
    if (!response.ok) {
      throw new Error("Failed to fetch promotional videos");
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching promotional videos:", error);
    return [];
  }
}

/**
 * Get the stored promotional video from AsyncStorage
 */
export async function getStoredPromotionalVideo(): Promise<PromotionalVideoItem | null> {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error("Error getting stored promotional video:", error);
    return null;
  }
}

/**
 * Store promotional video object in AsyncStorage
 */
export async function storePromotionalVideo(video: PromotionalVideoItem): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(video));
  } catch (error) {
    console.error("Error storing promotional video:", error);
  }
}

/**
 * Check if there's a new promotional video with higher number that should be shown
 * Only considers active videos - inactive videos are ignored even if they have higher numbers
 * Returns the video to show, or null if no new video should be shown
 */
export async function checkForNewPromotionalVideo(): Promise<PromotionalVideoItem | null> {
  try {
    // Fetch videos from JSON file
    const videos = await fetchPromotionalVideos();
    
    // Get active videos only - inactive videos are completely ignored, even if they have higher numbers
    const activeVideos = videos.filter((video) => video.active === true);
    
    if (activeVideos.length === 0) {
      return null;
    }

    // Get stored video from AsyncStorage
    const storedVideo = await getStoredPromotionalVideo();

    // If no stored video, return the active video with highest number (or first one)
    if (!storedVideo) {
      const highestNumberVideo = activeVideos.reduce((prev, current) => {
        const prevNumber = prev.number || 0;
        const currentNumber = current.number || 0;
        return currentNumber > prevNumber ? current : prev;
      });
      return highestNumberVideo;
    }

    // Get stored video number (default to 0 if not present)
    const storedNumber = storedVideo.number || 0;

    // Find active videos with higher number than stored
    // Note: Only active videos are considered - inactive videos with higher numbers are ignored
    const higherNumberVideos = activeVideos.filter(
      (video) => video.active === true && (video.number || 0) > storedNumber
    );

    if (higherNumberVideos.length === 0) {
      return null;
    }

    // Return the active video with the highest number
    const highestNumberVideo = higherNumberVideos.reduce((prev, current) => {
      const prevNumber = prev.number || 0;
      const currentNumber = current.number || 0;
      return currentNumber > prevNumber ? current : prev;
    });

    return highestNumberVideo;
  } catch (error) {
    console.error("Error checking for new promotional video:", error);
    return null;
  }
}

/**
 * Export service object
 */
export const promotionalVideoService = {
  fetchPromotionalVideos,
  getStoredPromotionalVideo,
  storePromotionalVideo,
  checkForNewPromotionalVideo,
};
