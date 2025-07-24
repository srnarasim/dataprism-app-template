import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface SampleDataDownloadProps {
  className?: string;
}

export const SampleDataDownload: React.FC<SampleDataDownloadProps> = ({ className = '' }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/sample-data.csv';
    link.download = 'sample-data.csv';
    link.click();
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="h-8 w-8 text-blue-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900">Sample Dataset</h3>
          <p className="text-sm text-blue-700">
            30 rows of business data with products, services, regions, and metrics
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </button>
      </div>
    </div>
  );
};
