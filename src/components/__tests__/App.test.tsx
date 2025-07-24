import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import App from '../../App';
import { mockDataPrismEngine } from '../../test-setup';

// Mock the DataPrism context
vi.mock('@contexts/DataPrismContext', () => ({
  DataPrismProvider: ({ children }: { children: React.ReactNode }) => children,
  useDataPrism: () => ({
    engine: mockDataPrismEngine,
    isLoading: false,
    error: null,
    isInitialized: true,
  }),
}));

// Mock the components to focus on App integration
vi.mock('@components/common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@components/common/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@components/data/FileUpload', () => ({
  FileUpload: ({ onFileUpload }: { onFileUpload: (data: any) => void }) => (
    <div data-testid="file-upload">
      <button
        onClick={() =>
          onFileUpload({
            data: [
              { name: 'Alice', age: 25, salary: 50000 },
              { name: 'Bob', age: 30, salary: 60000 },
            ],
            columns: [
              { name: 'name', type: 'string', nullable: false },
              { name: 'age', type: 'number', nullable: false },
              { name: 'salary', type: 'number', nullable: false },
            ],
            summary: {
              rowCount: 2,
              columnCount: 3,
              memoryUsage: 0.001,
              processingTime: 50,
            },
            errors: [],
          })
        }
      >
        Upload Test Data
      </button>
    </div>
  ),
}));

vi.mock('@components/charts/SimpleChart', () => ({
  SimpleChart: ({ data, config }: { data: any[]; config: any }) => (
    <div data-testid="simple-chart">
      <div>Chart: {config.title}</div>
      <div>Type: {config.type}</div>
      <div>Data points: {data.length}</div>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main application header', () => {
    render(<App />);
    
    expect(screen.getByText('DataPrism App Template')).toBeInTheDocument();
    expect(screen.getByText('WebAssembly-powered analytics in your browser')).toBeInTheDocument();
  });

  it('shows ready status when DataPrism is initialized', () => {
    render(<App />);
    
    expect(screen.getByText('✓ Ready')).toBeInTheDocument();
  });

  it('renders file upload section', () => {
    render(<App />);
    
    expect(screen.getByText('📊 Data Upload')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });

  it('renders visualization section with placeholder', () => {
    render(<App />);
    
    expect(screen.getByText('📈 Visualization')).toBeInTheDocument();
    expect(screen.getByText('Ready for Data Visualization')).toBeInTheDocument();
    expect(screen.getByText('Upload a file and configure chart settings to get started')).toBeInTheDocument();
  });

  it('renders footer with correct links', () => {
    render(<App />);
    
    expect(screen.getByText('Built with ❤️ using')).toBeInTheDocument();
    
    const dataPrismLink = screen.getByRole('link', { name: /DataPrism/i });
    expect(dataPrismLink).toHaveAttribute('href', 'https://github.com/srnarasim/dataprism-core');
    expect(dataPrismLink).toHaveAttribute('target', '_blank');
    
    const templateLink = screen.getByRole('link', { name: /View Template Source/i });
    expect(templateLink).toHaveAttribute('href', 'https://github.com/srnarasim/dataprism-app-template');
    expect(templateLink).toHaveAttribute('target', '_blank');
  });

  it('handles file upload and shows data summary', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Data Summary')).toBeInTheDocument();
      expect(screen.getByText('Rows: 2')).toBeInTheDocument();
      expect(screen.getByText('Columns: 3')).toBeInTheDocument();
      expect(screen.getByText('Size: 0.00 MB')).toBeInTheDocument();
      expect(screen.getByText('Processing: 50ms')).toBeInTheDocument();
    });
  });

  it('shows chart configuration after file upload', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('⚙️ Chart Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('Chart Type')).toBeInTheDocument();
      expect(screen.getByLabelText('X-Axis Field')).toBeInTheDocument();
      expect(screen.getByLabelText('Y-Axis Field')).toBeInTheDocument();
      expect(screen.getByLabelText('Chart Title')).toBeInTheDocument();
    });
  });

  it('auto-configures chart with first two columns', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    await waitFor(() => {
      const chartTitleInput = screen.getByDisplayValue('age by name');
      expect(chartTitleInput).toBeInTheDocument();
    });
  });

  it('displays chart when data and configuration are available', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('simple-chart')).toBeInTheDocument();
      expect(screen.getByText('Chart: age by name')).toBeInTheDocument();
      expect(screen.getByText('Type: bar')).toBeInTheDocument();
      expect(screen.getByText('Data points: 2')).toBeInTheDocument();
    });
  });

  it('shows data preview table after upload', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByText('🔍 Data Preview')).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
      expect(screen.getByText('salary')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  it('updates chart configuration when form inputs change', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Upload data first
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    await waitFor(() => {
      expect(screen.getByLabelText('Chart Type')).toBeInTheDocument();
    });
    
    // Change chart type
    const chartTypeSelect = screen.getByLabelText('Chart Type');
    await user.selectOptions(chartTypeSelect, 'line');
    
    await waitFor(() => {
      expect(screen.getByText('Type: line')).toBeInTheDocument();
    });
    
    // Change chart title
    const chartTitleInput = screen.getByLabelText('Chart Title');
    await user.clear(chartTitleInput);
    await user.type(chartTitleInput, 'Custom Chart Title');
    
    await waitFor(() => {
      expect(screen.getByText('Chart: Custom Chart Title')).toBeInTheDocument();
    });
  });

  it('shows row count information in data preview', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const uploadButton = screen.getByText('Upload Test Data');
    await user.click(uploadButton);
    
    // Note: With only 2 rows, the "Showing X of Y rows" message won't appear
    // since we only show it when there are more than 5 rows
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });
});

describe('App Error States', () => {
  it('displays loading state when DataPrism is initializing', () => {
    vi.doMock('@contexts/DataPrismContext', () => ({
      DataPrismProvider: ({ children }: { children: React.ReactNode }) => children,
      useDataPrism: () => ({
        engine: null,
        isLoading: true,
        error: null,
        isInitialized: false,
      }),
    }));

    render(<App />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Initializing DataPrism engine...')).toBeInTheDocument();
  });

  it('displays error state when DataPrism fails to load', () => {
    vi.doMock('@contexts/DataPrismContext', () => ({
      DataPrismProvider: ({ children }: { children: React.ReactNode }) => children,
      useDataPrism: () => ({
        engine: null,
        isLoading: false,
        error: 'Failed to initialize DataPrism engine',
        isInitialized: false,
      }),
    }));

    render(<App />);
    
    expect(screen.getByText('DataPrism Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to initialize DataPrism engine')).toBeInTheDocument();
    expect(screen.getByText('Reload Application')).toBeInTheDocument();
  });
});