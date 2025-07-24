import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { DataPrismContextValue, DataPrismEngine, DataPrismConfig } from '@types/dataprism';
import { loadDataPrismFromCDN } from '@utils/cdnLoader';

const DataPrismContext = createContext<DataPrismContextValue | undefined>(undefined);

interface DataPrismProviderProps {
  children: ReactNode;
  config?: DataPrismConfig;
}

export const DataPrismProvider: React.FC<DataPrismProviderProps> = ({ children, config = {} }) => {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function initializeDataPrism() {
      try {
        setIsLoading(true);
        setError(null);

        // Load DataPrism from CDN
        // eslint-disable-next-line no-console
        console.log('Loading DataPrism from CDN...');
        await loadDataPrismFromCDN(config.cdnUrl);

        // Create engine instance (mock implementation for template)
        const engineInstance = createMockEngine(config);

        // Initialize the engine
        // eslint-disable-next-line no-console
        console.log('Initializing DataPrism engine...');
        await engineInstance.initialize();

        setEngine(engineInstance);
        setIsInitialized(true);
        // eslint-disable-next-line no-console
        console.log('DataPrism initialized successfully');

        // Setup cleanup function
        cleanup = () => {
          engineInstance.cleanup();
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize DataPrism';
        // eslint-disable-next-line no-console
        console.error('DataPrism initialization error:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    initializeDataPrism();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [config]);

  const contextValue: DataPrismContextValue = {
    engine,
    isLoading,
    error,
    isInitialized,
  };

  return <DataPrismContext.Provider value={contextValue}>{children}</DataPrismContext.Provider>;
};

export function useDataPrism(): DataPrismContextValue {
  const context = useContext(DataPrismContext);
  if (context === undefined) {
    throw new Error('useDataPrism must be used within a DataPrismProvider');
  }
  return context;
}

// Mock DataPrism Engine Implementation for Template
function createMockEngine(config: DataPrismConfig): DataPrismEngine {
  return {
    async initialize() {
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // eslint-disable-next-line no-console
      console.log('Mock DataPrism engine initialized with config:', config);
    },

    cleanup() {
      // eslint-disable-next-line no-console
      console.log('Mock DataPrism engine cleaned up');
    },

    async processData(data: any[], options = {}) {
      // Simulate data processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // eslint-disable-next-line no-console
      console.log('Processing data with options:', options);

      // Return mock processed data
      return {
        processedData: data.map(row => ({ ...row, processed: true })),
        summary: {
          rowCount: data.length,
          processingTime: 500,
          memoryUsed: data.length * 0.001, // MB
        },
      };
    },

    async query(sql: string) {
      // Simulate SQL query execution
      await new Promise(resolve => setTimeout(resolve, 300));

      // eslint-disable-next-line no-console
      console.log('Executing SQL query:', sql);

      // Return mock query result
      return {
        data: [
          { id: 1, name: 'Sample 1', value: 100 },
          { id: 2, name: 'Sample 2', value: 200 },
        ],
        columns: [
          { name: 'id', type: 'number' as const, nullable: false },
          { name: 'name', type: 'string' as const, nullable: false },
          { name: 'value', type: 'number' as const, nullable: false },
        ],
        rowCount: 2,
        executionTime: 300,
      };
    },

    async loadPlugin(plugin: string) {
      // Simulate plugin loading
      await new Promise(resolve => setTimeout(resolve, 200));
      // eslint-disable-next-line no-console
      console.log('Loaded plugin:', plugin);
    },
  };
}
