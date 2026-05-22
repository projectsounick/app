import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
  key: string;
}

class APICache {
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  /**
   * Get cached data or fetch fresh data
   * Implements stale-while-revalidate pattern
   */
  async get<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    const { ttl, staleWhileRevalidate = false } = config;
    const now = Date.now();

    try {
      // Check if request is already in flight (deduplication)
      const inFlightRequest = this.inFlightRequests.get(cacheKey);
      if (inFlightRequest) {
        console.log(`🔄 [Cache] Deduplicating request for: ${cacheKey}`);
        return await inFlightRequest;
      }

      // Try to get from cache
      const cached = await this.getFromCache<T>(cacheKey);

      if (cached) {
        const age = now - cached.timestamp;
        const isExpired = now > cached.expiresAt;

        if (!isExpired) {
          // Cache is fresh
          console.log(`✅ [Cache] Fresh hit for: ${cacheKey} (age: ${Math.round(age / 1000)}s)`);
          return cached.data;
        }

        if (staleWhileRevalidate) {
          // Return stale data immediately, fetch fresh in background
          console.log(`⚡ [Cache] Stale hit for: ${cacheKey}, returning stale + revalidating`);
          this.revalidateInBackground(cacheKey, fetchFn, config);
          return cached.data;
        }
      }

      // No cache or cache expired and no stale-while-revalidate
      console.log(`❌ [Cache] Miss for: ${cacheKey}, fetching fresh data`);
      return await this.fetchAndCache(cacheKey, fetchFn, config);
    } catch (error) {
      console.error(`[Cache] Error for ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Fetch data and store in cache, with request deduplication
   */
  private async fetchAndCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    // Create the fetch promise
    const fetchPromise = fetchFn().then((data) => {
      // Save to cache
      this.saveToCache(cacheKey, data, config.ttl);
      // Remove from in-flight requests
      this.inFlightRequests.delete(cacheKey);
      return data;
    }).catch((error) => {
      // Remove from in-flight requests on error too
      this.inFlightRequests.delete(cacheKey);
      throw error;
    });

    // Store in-flight request for deduplication
    this.inFlightRequests.set(cacheKey, fetchPromise);

    return fetchPromise;
  }

  /**
   * Revalidate in background without blocking
   */
  private revalidateInBackground<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    config: CacheConfig
  ): void {
    // Don't await, let it run in background
    this.fetchAndCache(cacheKey, fetchFn, config)
      .then(() => {
        console.log(`🔄 [Cache] Background revalidation completed for: ${cacheKey}`);
      })
      .catch((error) => {
        console.error(`[Cache] Background revalidation failed for ${cacheKey}:`, error);
      });
  }

  /**
   * Get data from AsyncStorage cache
   */
  private async getFromCache<T>(cacheKey: string): Promise<CacheEntry<T> | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      return entry;
    } catch (error) {
      console.error(`[Cache] Error reading cache for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Save data to AsyncStorage cache
   */
  private async saveToCache<T>(
    cacheKey: string,
    data: T,
    ttl: number
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(entry));
      console.log(`💾 [Cache] Saved: ${cacheKey} (TTL: ${Math.round(ttl / 1000)}s)`);
    } catch (error) {
      console.error(`[Cache] Error saving cache for ${cacheKey}:`, error);
    }
  }

  /**
   * Clear specific cache entry
   */
  async clear(cacheKey: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache:${cacheKey}`);
      console.log(`🗑️ [Cache] Cleared: ${cacheKey}`);
    } catch (error) {
      console.error(`[Cache] Error clearing cache for ${cacheKey}:`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️ [Cache] Cleared all cache entries (${cacheKeys.length} items)`);
    } catch (error) {
      console.error('[Cache] Error clearing all cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ totalEntries: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return {
        totalEntries: cacheKeys.length,
        totalSize,
      };
    } catch (error) {
      console.error('[Cache] Error getting cache stats:', error);
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Cache TTL presets (in milliseconds)
export const CacheTTL = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
};
