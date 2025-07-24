import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the DataPrism context with simple working mocks
vi.mock('@contexts/DataPrismContext', () => ({
  DataPrismProvider: ({ children }: { children: React.ReactNode }) => children,
  useDataPrism: () => ({
    engine: {
      processData: vi.fn(),
      query: vi.fn(),
      initialize: vi.fn(),
      cleanup: vi.fn(),
    },
    isLoading: false,
    error: null,
    isInitialized: true,
  }),
}));

// Mock other components to avoid complex interactions
vi.mock('@components/common/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@components/data/FileUpload', () => ({
  FileUpload: () => <div data-testid="file-upload">File Upload Component</div>,
}));

vi.mock('@components/charts/SimpleChart', () => ({
  SimpleChart: () => <div data-testid="simple-chart">Chart Component</div>,
}));

vi.mock('@components/SampleDataDownload', () => ({
  SampleDataDownload: () => <div data-testid="sample-download">Sample Data Download</div>,
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
    expect(
      screen.getByText('Upload a file and configure chart settings to get started')
    ).toBeInTheDocument();
  });

  it('renders footer with correct links', () => {
    render(<App />);

    expect(screen.getByText(/Built with ❤️ using/)).toBeInTheDocument();

    const dataPrismLink = screen.getByRole('link', { name: /DataPrism/i });
    expect(dataPrismLink).toHaveAttribute('href', 'https://github.com/srnarasim/dataprism-core');
    expect(dataPrismLink).toHaveAttribute('target', '_blank');

    const templateLink = screen.getByRole('link', { name: /View Template Source/i });
    expect(templateLink).toHaveAttribute(
      'href',
      'https://github.com/srnarasim/dataprism-app-template'
    );
    expect(templateLink).toHaveAttribute('target', '_blank');
  });
});
