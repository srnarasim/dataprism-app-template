/**
 * CDN Loader for DataPrism Core
 * Handles loading DataPrism engine from CDN with fallback options
 * Based on the actual DataPrism implementation pattern
 */

const DEFAULT_CDN_BASE_URL = 'https://srnarasim.github.io/DataPrism';
// CDN asset URLs for DataPrism
// const CDN_ASSETS = {
//   coreBundle: `${DEFAULT_CDN_BASE_URL}/dataprism.umd.js`, // ~29KB with hybrid loading
//   coreESModule: `${DEFAULT_CDN_BASE_URL}/dataprism.min.js`, // ~36KB with hybrid loading
//   manifest: `${DEFAULT_CDN_BASE_URL}/manifest.json`,
//   wasmAssets: `${DEFAULT_CDN_BASE_URL}/assets/`,
//   workers: `${DEFAULT_CDN_BASE_URL}/workers/`
// };

// Interface for loader configuration options
// interface LoaderOptions {
//   timeout?: number;
//   retries?: number;
//   enableFallbacks?: boolean;
//   useESModule?: boolean;
//   dependencyManagement?: {
//     enabled: boolean;
//     timeout?: number;
//     progressTracking: boolean;
//     preloadDependencies: boolean;
//   };
// }

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
 * Load DataPrism from CDN using the proven dataprism-apps pattern
 */
export async function loadDataPrismFromCDN(): Promise<any> {
  const timeout = 30000;
  const retries = 3;
  const enableFallbacks = true;

  // Return immediately if already loaded
  if (loaderState.isLoaded) {
    return (window as any).DataPrism;
  }

  // Prevent concurrent loading
  if (loaderState.isLoading) {
    await waitForLoad();
    return (window as any).DataPrism;
  }

  loaderState.isLoading = true;
  loaderState.error = null;
  const startTime = Date.now();

  try {
    // Ensure Apache Arrow is available globally (critical for DataPrism)
    await ensureApacheArrowAvailable();

    const baseUrl = DEFAULT_CDN_BASE_URL;
    const scriptUrl = `${baseUrl}/dataprism.umd.js`;

    // eslint-disable-next-line no-console
    console.log(`📦 Loading DataPrism from ${scriptUrl}...`);

    // Preload the script for better performance
    await preloadScript(scriptUrl);

    // Try to load the main script with retries
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < retries) {
      try {
        await loadScriptWithTimeout(scriptUrl, timeout);

        // Verify DataPrism is available
        if (typeof window !== 'undefined' && (window as any).DataPrism) {
          loaderState.isLoaded = true;
          loaderState.loadTime = Date.now() - startTime;

          // eslint-disable-next-line no-console
          console.log(`✅ DataPrism loaded successfully in ${loaderState.loadTime}ms`);

          return (window as any).DataPrism;
        } else {
          throw new Error('DataPrism not found on window after script load');
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(`Failed to load from ${scriptUrl}`);
        attempt++;

        if (attempt < retries) {
          // eslint-disable-next-line no-console
          console.warn(
            `⚠️ DataPrism load attempt ${attempt} failed, retrying...`,
            lastError.message
          );
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // If all retries failed, try fallback with mock implementation as last resort
    if (enableFallbacks) {
      // eslint-disable-next-line no-console
      console.warn('❌ DataPrism CDN loading failed, using mock implementation as fallback');
      return createMockDataPrism();
    }

    throw lastError || new Error('All DataPrism loading attempts failed');
  } catch (error) {
    loaderState.error = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to load DataPrism: ${loaderState.error}`);
  } finally {
    loaderState.isLoading = false;
  }
}

/**
 * Load a script with timeout using the dataprism-apps proven pattern
 */
function loadScriptWithTimeout(url: string, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous'; // Critical for CORS compliance

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
 * Preload script for better performance
 */
function preloadScript(url: string): Promise<void> {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'script';
    link.crossOrigin = 'anonymous';

    link.onload = () => resolve();
    link.onerror = () => resolve(); // Don't fail on preload errors

    document.head.appendChild(link);

    // Fallback timeout
    setTimeout(() => resolve(), 1000);
  });
}

/**
 * Ensure Apache Arrow is available globally (required for DataPrism)
 */
async function ensureApacheArrowAvailable(): Promise<void> {
  if ((window as any).Arrow) {
    return; // Already available
  }

  try {
    // Import Apache Arrow from our local bundle
    const Arrow = await import('apache-arrow');
    (window as any).Arrow = Arrow;
    // eslint-disable-next-line no-console
    console.log('✅ Apache Arrow made available globally for DataPrism');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️ Failed to load Apache Arrow locally:', error);
    throw new Error('Apache Arrow is required for DataPrism but could not be loaded');
  }
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

/**
 * Create a mock DataPrism implementation as fallback
 * This provides basic functionality when the real CDN is unavailable
 */
function createMockDataPrism() {
  // eslint-disable-next-line no-console
  console.warn(
    '🔧 Using DataPrism mock implementation. For production, ensure proper CDN configuration.'
  );

  const mockDataPrism = {
    DataPrismEngine: class MockDataPrismEngine {
      private config: any;

      constructor(config: any = {}) {
        this.config = config;
      }

      async initialize() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // eslint-disable-next-line no-console
        console.log('🔧 Mock DataPrism engine initialized');
      }

      cleanup() {
        // eslint-disable-next-line no-console
        console.log('🔧 Mock DataPrism engine cleaned up');
      }

      async processData(data: any[]) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          processedData: data.map(row => ({ ...row, processed: true })),
          summary: {
            rowCount: data.length,
            processingTime: 500,
            memoryUsed: data.length * 0.001,
          },
        };
      }

      async query() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          data: [
            { id: 1, name: 'Sample Data 1', value: 100, category: 'A' },
            { id: 2, name: 'Sample Data 2', value: 200, category: 'B' },
            { id: 3, name: 'Sample Data 3', value: 150, category: 'A' },
          ],
          columns: [
            { name: 'id', type: 'number' as const, nullable: false },
            { name: 'name', type: 'string' as const, nullable: false },
            { name: 'value', type: 'number' as const, nullable: false },
            { name: 'category', type: 'string' as const, nullable: false },
          ],
          rowCount: 3,
          executionTime: 300,
        };
      }

      async loadPlugin(plugin: string) {
        await new Promise(resolve => setTimeout(resolve, 200));
        // eslint-disable-next-line no-console
        console.log('🔧 Mock plugin loaded:', plugin);
      }

      async waitForReady(options: any = {}) {
        const { onProgress } = options;

        for (let i = 0; i <= 100; i += 25) {
          if (onProgress) {
            onProgress({
              percentage: i,
              status: i === 100 ? 'Ready' : `Mock loading... ${i}%`,
            });
          }
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    },

    version: '1.0.0-template-mock',
    isLoaded: true,
    isMock: true, // Flag to identify mock implementation
  };

  // Make it available globally
  (window as any).DataPrism = mockDataPrism;

  return mockDataPrism;
}
