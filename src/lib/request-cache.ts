/**
 * Request Cache & Deduplication
 * 
 * Provides request deduplication and caching to prevent
 * duplicate API calls during concurrent component mounts.
 * 
 * @module request-cache
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
  promise?: Promise<unknown>;
}

// In-memory cache with TTL
const cache = new Map<string, CacheEntry>();

// Default cache TTL: 30 seconds
const DEFAULT_CACHE_TTL = 30 * 1000;

// Pending requests for deduplication
const pendingRequests = new Map<string, Promise<Response>>();

/**
 * Configuration for cached fetch
 */
export interface CachedFetchOptions extends RequestInit {
  /** Cache TTL in milliseconds (default: 30000) */
  cacheTtl?: number;
  /** Skip cache and force fresh fetch */
  skipCache?: boolean;
  /** Cache key override (default: url) */
  cacheKey?: string;
}

/**
 * Generate a cache key from URL and options
 */
function generateCacheKey(url: string, options?: CachedFetchOptions): string {
  if (options?.cacheKey) return options.cacheKey;
  
  // Include relevant headers in cache key
  const headers = options?.headers as Record<string, string> | undefined;
  const auth = headers?.Authorization || headers?.authorization || '';
  
  return `${url}:${auth.slice(-10)}`; // Use last 10 chars of auth for privacy
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry, ttl: number): boolean {
  return Date.now() - entry.timestamp < ttl;
}

/**
 * Cached fetch with request deduplication
 * 
 * Features:
 * - Deduplicates concurrent requests to the same URL
 * - Caches successful responses with configurable TTL
 * - Falls back to regular fetch on cache miss
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options with cache configuration
 * @returns Promise resolving to the response
 */
export async function cachedFetch(
  url: string,
  options?: CachedFetchOptions
): Promise<Response> {
  const cacheTtl = options?.cacheTtl ?? DEFAULT_CACHE_TTL;
  const skipCache = options?.skipCache ?? false;
  const cacheKey = generateCacheKey(url, options);
  
  // Check if we have a pending request for this URL (deduplication)
  if (pendingRequests.has(cacheKey)) {
    // Clone the response since it can only be consumed once
    const pendingResponse = await pendingRequests.get(cacheKey)!;
    return pendingResponse.clone();
  }
  
  // Check cache for valid entry
  if (!skipCache) {
    const cached = cache.get(cacheKey);
    if (cached && isCacheValid(cached, cacheTtl)) {
      // Return cached response as a new Response object
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }
  }
  
  // Create fetch promise and store for deduplication
  const fetchPromise = fetch(url, options);
  pendingRequests.set(cacheKey, fetchPromise);
  
  try {
    const response = await fetchPromise;
    
    // Cache successful responses
    if (response.ok) {
      // Clone response to read data for cache
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      } catch {
        // Non-JSON response, skip caching
      }
    }
    
    return response;
  } finally {
    // Clean up pending request
    pendingRequests.delete(cacheKey);
  }
}

/**
 * Clear all cached entries
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Clear specific cache entry
 */
export function invalidateCache(url: string, options?: CachedFetchOptions): void {
  const cacheKey = generateCacheKey(url, options);
  cache.delete(cacheKey);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

/**
 * Staggered load delay calculator
 * @deprecated No longer used - UI renders immediately, data populates as it arrives
 * 
 * @param index - The item index (0-based)
 * @param baseDelay - Base delay in ms between items (default: 50)
 * @param maxDelay - Maximum delay cap in ms (default: 500)
 * @returns Delay in milliseconds
 */
export function getStaggerDelay(
  index: number, 
  baseDelay: number = 50,
  maxDelay: number = 500
): number {
  return Math.min(index * baseDelay, maxDelay);
}

/**
 * Execute with staggered delay
 * @deprecated No longer used - UI renders immediately, data populates as it arrives
 */
export function staggeredExecute<T>(
  fn: () => Promise<T>,
  index: number,
  baseDelay: number = 50
): Promise<T> {
  const delay = getStaggerDelay(index, baseDelay);
  
  if (delay === 0) {
    return fn();
  }
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fn().then(resolve).catch(reject);
    }, delay);
  });
}
