import React, { useEffect, useState } from 'react';
import { useDataPrism } from '@contexts/DataPrismContext';
import type { ChartConfig } from '@types/app';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface SimpleChartProps {
  data: any[];
  config: ChartConfig;
  className?: string;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ data, config, className = '' }) => {
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
        const processed = await engine!.processData(data, {
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{config.title}</h3>
      )}

      <div className="chart-container">{renderChart(config.type, chartData, config)}</div>

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
            <div className="w-20 text-sm text-gray-600 truncate">{item[config.xField]}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6">
              <div
                className="bg-dataprism-500 h-6 rounded-full flex items-center justify-end pr-2"
                style={{ width: `${percentage}%` }}
              >
                <span className="text-xs text-white font-medium">{value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LineChart: React.FC<{ data: any[]; config: ChartConfig }> = ({ data, config }) => {
  // Sort data by x-field for proper line progression
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[config.xField];
    const bVal = b[config.xField];

    // Handle date strings
    if (typeof aVal === 'string' && aVal.includes('-')) {
      return new Date(aVal).getTime() - new Date(bVal).getTime();
    }

    // Handle numeric values
    return Number(aVal) - Number(bVal);
  });

  const values = sortedData.map(item => Number(item[config.yField]) || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;

  return (
    <div className="bg-white">
      <svg width={chartWidth + padding * 2} height={chartHeight + padding * 2} className="mx-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <g key={ratio}>
            <line
              x1={padding}
              y1={padding + chartHeight * ratio}
              x2={padding + chartWidth}
              y2={padding + chartHeight * ratio}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={padding + chartHeight * ratio + 5}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {Math.round(maxValue - range * ratio)}
            </text>
          </g>
        ))}

        {/* Data line */}
        <polyline
          points={sortedData
            .map((item, index) => {
              const x = padding + (index / (sortedData.length - 1)) * chartWidth;
              const value = Number(item[config.yField]) || 0;
              const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Data points */}
        {sortedData.map((item, index) => {
          const x = padding + (index / (sortedData.length - 1)) * chartWidth;
          const value = Number(item[config.yField]) || 0;
          const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;

          return (
            <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2">
              <title>{`${item[config.xField]}: ${value}`}</title>
            </circle>
          );
        })}

        {/* X-axis labels */}
        {sortedData
          .filter((_, i) => i % Math.ceil(sortedData.length / 5) === 0)
          .map(item => {
            const originalIndex = sortedData.indexOf(item);
            const x = padding + (originalIndex / (sortedData.length - 1)) * chartWidth;

            return (
              <text
                key={originalIndex}
                x={x}
                y={padding + chartHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {String(item[config.xField]).slice(0, 10)}
              </text>
            );
          })}
      </svg>
    </div>
  );
};

const PieChart: React.FC<{ data: any[]; config: ChartConfig }> = ({ data, config }) => {
  // Group data by categories (x-field) and sum values (y-field)
  const groupedData = data.reduce(
    (acc, item) => {
      const category = String(item[config.xField] || 'Unknown');
      const value = Number(item[config.yField]) || 0;

      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += value;

      return acc;
    },
    {} as Record<string, number>
  );

  const categories = Object.keys(groupedData);
  const values = Object.values(groupedData);
  const total = values.reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600">No data to display</p>
      </div>
    );
  }

  const radius = 80;
  const centerX = 120;
  const centerY = 120;
  const colors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  let currentAngle = 0;
  const slices = categories.map((category, index) => {
    const value = groupedData[category];
    const percentage = (value / total) * 100;
    const angle = (value / total) * 2 * Math.PI;

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle += angle;

    return {
      category,
      value,
      percentage,
      pathData,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-8">
        {/* Pie Chart */}
        <svg width={240} height={240}>
          {slices.map((slice, index) => (
            <path key={index} d={slice.pathData} fill={slice.color} stroke="white" strokeWidth="2">
              <title>{`${slice.category}: ${slice.value} (${slice.percentage.toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>

        {/* Legend */}
        <div className="space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: slice.color }} />
              <span className="text-sm text-gray-700">{slice.category}</span>
              <span className="text-sm text-gray-500">({slice.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleChart;
