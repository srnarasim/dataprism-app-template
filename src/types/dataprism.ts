// DataPrism Engine Types
export interface DataPrismEngine {
  initialize(): Promise<void>;
  cleanup(): void;
  processData(data: any[], options?: ProcessingOptions): Promise<any>;
  query(sql: string): Promise<QueryResult>;
  loadPlugin(plugin: string): Promise<void>;
}

export interface ProcessingOptions {
  type?: 'visualization' | 'aggregation' | 'transformation';
  parameters?: Record<string, any>;
}

export interface QueryResult {
  data: any[];
  columns: ColumnInfo[];
  rowCount: number;
  executionTime: number;
}

export interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  nullable: boolean;
}

// DataPrism Context Types
export interface DataPrismContextValue {
  engine: DataPrismEngine | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface DataPrismConfig {
  maxMemoryMB?: number;
  enableOptimizations?: boolean;
  plugins?: string[];
  cdnUrl?: string;
}

// Chart and Visualization Types
export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  xField: string;
  yField: string;
  colorField?: string;
  title?: string;
  width?: number;
  height?: number;
}

// File Processing Types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface ParsedData {
  data: any[];
  columns: ColumnInfo[];
  errors: string[];
  summary: DataSummary;
}

export interface DataSummary {
  rowCount: number;
  columnCount: number;
  memoryUsage: number;
  processingTime: number;
}