/**
 * Centralized configuration for pagination limits
 * Update values here to change limits across the app
 */

export const PAGINATION_LIMITS = {
  // Podcast limits
  PODCAST_INITIAL: 4, // Initial fetch for dashboard/home screen
  PODCAST_LOAD_MORE: 20, // Number of podcasts to load when scrolling in media screen
  
  // Add more limits here as needed
  // BLOG_INITIAL: 5,
  // BLOG_LOAD_MORE: 10,
} as const;

