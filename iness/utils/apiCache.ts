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
  private memoryCache: Map<string, CacheEntry<any>> = new Map();

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
        return await inFlightRequest;
      }

      // Try to get from cache
      const cached = await this.getFromCache<T>(cacheKey);

      if (cached) {
        const isExpired = now > cached.expiresAt;

        if (!isExpired) {
          // Cache is fresh
          return cached.data;
        }

        if (staleWhileRevalidate) {
          // Return stale data immediately, fetch fresh in background
          this.revalidateInBackground(cacheKey, fetchFn, config);
          return cached.data;
        }
      }

      // No cache or cache expired and no stale-while-revalidate
      return await this.fetchAndCache(cacheKey, fetchFn, config);
    } catch (error) {
      console.error("Cache request failed");
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
      .catch(() => {
        console.error("Cache background revalidation failed");
      });
  }

  /**
   * Get data from AsyncStorage cache
   */
  private async getFromCache<T>(cacheKey: string): Promise<CacheEntry<T> | null> {
    try {
      const memoryEntry = this.memoryCache.get(cacheKey) as
        | CacheEntry<T>
        | undefined;
      if (memoryEntry) return memoryEntry;

      const cached = await AsyncStorage.getItem(`cache:${cacheKey}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      this.memoryCache.set(cacheKey, entry);
      return entry;
    } catch {
      console.error("Cache read failed");
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
      if (data === undefined || data === null || (Array.isArray(data) && data.length === 0)) {
        return;
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      if (this.memoryCache.size >= 50) {
        const oldestKey = this.memoryCache.keys().next().value;
        if (oldestKey) {
          this.memoryCache.delete(oldestKey);
        }
      }

      this.memoryCache.set(cacheKey, entry);
      await AsyncStorage.setItem(`cache:${cacheKey}`, JSON.stringify(entry));
    } catch {
      console.error("Cache save failed");
    }
  }

  /**
   * Clear specific cache entry
   */
  async clear(cacheKey: string): Promise<void> {
    try {
      this.memoryCache.delete(cacheKey);
      await AsyncStorage.removeItem(`cache:${cacheKey}`);
    } catch {
      console.error("Cache clear failed");
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    try {
      this.memoryCache.clear();
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch {
      console.error('Cache clear-all failed');
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
    } catch {
      console.error('Cache statistics lookup failed');
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
