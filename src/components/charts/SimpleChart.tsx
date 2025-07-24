import React, { useEffect, useState } from 'react';
import { useDataPrism } from '@contexts/DataPrismContext';
import { ChartConfig } from '@types/app';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface SimpleChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  config,
  className = '',
}) => {
  const { engine } = useDataPrism();
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!engine || !data.length) {
      setChartData(null);
      return;
    }

    async function processChartData() {
      setLoading(true);
      setError(null);

      try {
        // Use DataPrism engine to process data for visualization
        const processed = await engine.processData(data, {
          type: 'visualization',
          parameters: {
            chartType: config.type,
            xField: config.xField,
            yField: config.yField,
            colorField: config.colorField,
            aggregation: config.aggregation,
            groupBy: config.groupBy,
          },
        });

        setChartData(processed);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process chart data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    processChartData();
  }, [engine, data, config]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner message="Processing chart data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-700 font-medium">Chart Error</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {config.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {config.title}
        </h3>
      )}
      
      <div className="chart-container">
        {renderChart(config.type, chartData, config)}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        {data.length} records • Processed by DataPrism
      </div>
    </div>
  );
};

// Simple chart rendering functions (mock implementation)
function renderChart(type: string, data: any, config: ChartConfig) {
  const mockData = data.processedData || [];
  
  switch (type) {
    case 'bar':
      return <BarChart data={mockData} config={config} />;
    case 'line':
      return <LineChart data={mockData} config={config} />;
    case 'pie':
      return <PieChart data={mockData} config={config} />;
    default:
      return <div className="text-center text-gray-500">Chart type '{type}' not implemented</div>;
  }
}

// Mock chart components (in a real app, you'd use a proper charting library)
const BarChart: React.FC<{ data: any[]; config: ChartConfig }> = ({ data, config }) => {
  const values = data.map(item => Number(item[config.yField]) || 0);
  const maxValue = Math.max(...values);
  
  return (
    <div className="space-y-2">
      {data.slice(0, 10).map((item, index) => {
        const value = Number(item[config.yField]) || 0;
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <div className="w-20 text-sm text-gray-600 truncate">
              {item[config.xField]}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6">
              <div
                className="bg-dataprism-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${percentage}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LineChart: React.FC<{ data: any[]; config: ChartConfig }> = ({ data, config }) => {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <div className="text-4xl mb-2">📈</div>
      <p className="text-gray-600">Line Chart</p>
      <p className="text-sm text-gray-500 mt-2">
        {data.length} data points using {config.xField} vs {config.yField}
      </p>
    </div>
  );
};

const PieChart: React.FC<{ data: any[]; config: ChartConfig }> = ({ data, config }) => {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <div className="text-4xl mb-2">🥧</div>
      <p className="text-gray-600">Pie Chart</p>
      <p className="text-sm text-gray-500 mt-2">
        {data.length} data points using {config.yField}
      </p>
    </div>
  );
};

export default SimpleChart;