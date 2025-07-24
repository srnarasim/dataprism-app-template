/**
 * CDN Loader for DataPrism Core
 * Handles loading DataPrism engine from CDN with fallback options
 */

const DEFAULT_CDN_URL = 'https://cdn.jsdelivr.net/npm/@dataprism/core@latest/dist/dataprism-core.js';
const FALLBACK_CDN_URLS = [
  'https://unpkg.com/@dataprism/core@latest/dist/dataprism-core.js',
  'https://cdn.skypack.dev/@dataprism/core@latest',
];

interface LoaderOptions {
  timeout?: number;
  retries?: number;
  enableFallbacks?: boolean;
}

interface LoaderState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadTime?: number;
}

let loaderState: LoaderState = {
  isLoaded: false,
  isLoading: false,
  error: null,
};

/**
 * Load DataPrism from CDN with automatic fallbacks
 */
export async function loadDataPrismFromCDN(
  cdnUrl?: string,
  options: LoaderOptions = {}
): Promise<void> {
  const {
    timeout = 10000,
    retries = 3,
    enableFallbacks = true,
  } = options;

  // Return immediately if already loaded
  if (loaderState.isLoaded) {
    return;
  }

  // Prevent concurrent loading
  if (loaderState.isLoading) {
    return waitForLoad();
  }

  loaderState.isLoading = true;
  loaderState.error = null;
  const startTime = Date.now();

  try {
    const urlsToTry = [
      cdnUrl || DEFAULT_CDN_URL,
      ...(enableFallbacks ? FALLBACK_CDN_URLS : []),
    ];

    let lastError: Error | null = null;

    for (const url of urlsToTry) {
      try {
        await loadScriptWithTimeout(url, timeout);
        
        // Verify DataPrism is available
        if (typeof window !== 'undefined' && (window as any).DataPrism) {
          loaderState.isLoaded = true;
          loaderState.loadTime = Date.now() - startTime;
          console.log(`DataPrism loaded successfully from ${url} in ${loaderState.loadTime}ms`);
          return;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(`Failed to load from ${url}`);
        console.warn(`Failed to load DataPrism from ${url}:`, lastError.message);
      }
    }

    throw lastError || new Error('All CDN URLs failed');

  } catch (error) {
    loaderState.error = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load DataPrism: ${loaderState.error}`);
  } finally {
    loaderState.isLoading = false;
  }
}

/**
 * Load a script with timeout
 */
function loadScriptWithTimeout(url: string, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const timeoutId = setTimeout(() => {
      script.remove();
      reject(new Error(`Script loading timeout: ${url}`));
    }, timeout);

    script.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      reject(new Error(`Script loading error: ${url}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Wait for ongoing load to complete
 */
function waitForLoad(): Promise<void> {
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (!loaderState.isLoading) {
        clearInterval(checkInterval);
        if (loaderState.isLoaded) {
          resolve();
        } else {
          reject(new Error(loaderState.error || 'Loading failed'));
        }
      }
    }, 100);

    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Wait for load timeout'));
    }, 30000);
  });
}

/**
 * Get current loader state
 */
export function getLoaderState(): LoaderState {
  return { ...loaderState };
}

/**
 * Reset loader state (for testing)
 */
export function resetLoaderState(): void {
  loaderState = {
    isLoaded: false,
    isLoading: false,
    error: null,
  };
}

/**
 * Check if DataPrism is available in the global scope
 */
export function isDataPrismAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).DataPrism;
}