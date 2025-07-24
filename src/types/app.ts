// Application State Types
export interface AppState {
  currentData: any[] | null;
  selectedChart: ChartConfig | null;
  filters: FilterConfig[];
  loading: boolean;
  error: string | null;
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
  active: boolean;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area';
  title: string;
  xField: string;
  yField: string;
  colorField?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
}

// UI Component Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
  retry?: () => void;
}

// Navigation Types
export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

// Theme Types
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}