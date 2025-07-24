import { useState } from 'react';
import { DataPrismProvider, useDataPrism } from '@contexts/DataPrismContext';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { FileUpload } from '@components/data/FileUpload';
import { SimpleChart } from '@components/charts/SimpleChart';
import { SampleDataDownload } from '@components/SampleDataDownload';
import type { ParsedData } from '@types/dataprism';
import type { ChartConfig } from '@types/app';

function AppContent() {
  const { isLoading, error, isInitialized } = useDataPrism();
  const [uploadedData, setUploadedData] = useState<ParsedData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    id: 'default-chart',
    type: 'bar',
    title: 'Data Visualization',
    xField: '',
    yField: '',
  });

  const handleFileUpload = (data: ParsedData) => {
    setUploadedData(data);

    // Auto-configure chart with first two columns
    if (data.columns.length >= 2) {
      setChartConfig(prev => ({
        ...prev,
        xField: data.columns[0].name,
        yField: data.columns[1].name,
        title: `${data.columns[1].name} by ${data.columns[0].name}`,
      }));
    }
  };

  const handleChartConfigChange = (field: keyof ChartConfig, value: any) => {
    setChartConfig(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" message="Initializing DataPrism engine..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">DataPrism Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🚀</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DataPrism App Template</h1>
                <p className="text-sm text-gray-600">
                  WebAssembly-powered analytics in your browser
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {isInitialized ? '✓ Ready' : 'Initializing...'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Data Upload</h2>

              <FileUpload
                onFileUpload={handleFileUpload}
                acceptedTypes={['.csv', '.json', '.txt']}
                maxSize={10}
                className="mb-4"
              />

              <SampleDataDownload className="mb-4" />

              {uploadedData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Data Summary</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Rows: {uploadedData.summary.rowCount.toLocaleString()}</div>
                    <div>Columns: {uploadedData.summary.columnCount}</div>
                    <div>Size: {uploadedData.summary.memoryUsage.toFixed(2)} MB</div>
                    <div>Processing: {uploadedData.summary.processingTime}ms</div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Configuration */}
            {uploadedData && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Chart Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chart Type
                    </label>
                    <select
                      value={chartConfig.type}
                      onChange={e => handleChartConfigChange('type', e.target.value as any)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X-Axis Field
                    </label>
                    <select
                      value={chartConfig.xField}
                      onChange={e => handleChartConfigChange('xField', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select field...</option>
                      {uploadedData.columns.map(col => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y-Axis Field
                    </label>
                    <select
                      value={chartConfig.yField}
                      onChange={e => handleChartConfigChange('yField', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select field...</option>
                      {uploadedData.columns.map(col => (
                        <option key={col.name} value={col.name}>
                          {col.name} ({col.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chart Title
                    </label>
                    <input
                      type="text"
                      value={chartConfig.title}
                      onChange={e => handleChartConfigChange('title', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Enter chart title..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visualization Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">📈 Visualization</h2>

              {uploadedData && chartConfig.xField && chartConfig.yField ? (
                <SimpleChart data={uploadedData.data} config={chartConfig} className="h-96" />
              ) : (
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl text-gray-400 mb-4">📊</div>
                    <p className="text-lg font-medium text-gray-500 mb-2">
                      Ready for Data Visualization
                    </p>
                    <p className="text-sm text-gray-400">
                      Upload a file and configure chart settings to get started
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Data Preview */}
            {uploadedData && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Data Preview</h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {uploadedData.columns.slice(0, 5).map(column => (
                          <th
                            key={column.name}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column.name}
                            <span className="text-gray-400 ml-1">({column.type})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadedData.data.slice(0, 5).map((row, index) => (
                        <tr key={index}>
                          {uploadedData.columns.slice(0, 5).map(column => (
                            <td
                              key={column.name}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {String(row[column.name] || '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {uploadedData.data.length > 5 && (
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    Showing 5 of {uploadedData.data.length.toLocaleString()} rows
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>
              Built with ❤️ using{' '}
              <a
                href="https://github.com/srnarasim/dataprism-core"
                className="text-dataprism-600 hover:text-dataprism-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                DataPrism
              </a>
              {' • '}
              <a
                href="https://github.com/srnarasim/dataprism-app-template"
                className="text-dataprism-600 hover:text-dataprism-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Template Source
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DataPrismProvider>
        <AppContent />
      </DataPrismProvider>
    </ErrorBoundary>
  );
}

export default App;
