/**
 * Request throttling and caching utilities to prevent 429 errors
 */

interface CachedRequest {
  data: any;
  timestamp: number;
}

// Request cache with TTL
const requestCache = new Map<string, CachedRequest>();
const DEFAULT_CACHE_TTL = 30000; // 30 seconds

/**
 * Fetch with caching to avoid duplicate requests
 */
export async function fetchWithCache(
  url: string,
  options: RequestInit = {},
  cacheTTL: number = DEFAULT_CACHE_TTL
): Promise<Response> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cacheTTL) {
    // Return cached response as a new Response object
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const response = await fetch(url, options);
  
  if (response.ok) {
    try {
      const data = await response.json();
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    } catch (error) {
      // If response is not JSON, don't cache
    }
  }
  
  return response;
}

/**
 * Fetch with exponential backoff on 429 errors
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<Response> {
  let delay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        if (attempt < maxRetries) {
          console.warn(`Rate limited (429) on attempt ${attempt + 1}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        } else {
          console.error(`Rate limited (429) after ${maxRetries} retries, giving up`);
          return response;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn(`Request failed on attempt ${attempt + 1}, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Process requests in batches with delays
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  batchSize: number = 5,
  delayBetweenBatches: number = 200,
  delayBetweenRequests: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    // Process batch with delays between requests
    for (let j = 0; j < batch.length; j++) {
      if (j > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
      
      try {
        const result = await batch[j]();
        results.push(result);
      } catch (error) {
        console.error(`Error in batch request ${i + j}:`, error);
        // Continue with next request even if one fails
      }
    }
    
    // Delay between batches (except after last batch)
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

/**
 * Clear request cache
 */
export function clearRequestCache(): void {
  requestCache.clear();
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(ttl: number = DEFAULT_CACHE_TTL): void {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > ttl) {
      requestCache.delete(key);
    }
  }
}

