import React, { useCallback, useState } from 'react';
import { FileInfo, ParsedData } from '@types/dataprism';

interface FileUploadProps {
  onFileUpload: (data: ParsedData) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedTypes = ['.csv', '.json', '.txt'],
  maxSize = 10,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} not supported. Accepted types: ${acceptedTypes.join(', ')}`);
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File too large. Maximum size: ${maxSize}MB`);
      }

      const fileInfo: FileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };

      // Parse file based on type
      const startTime = Date.now();
      const parsedData = await parseFile(file);
      const processingTime = Date.now() - startTime;

      const result: ParsedData = {
        ...parsedData,
        summary: {
          ...parsedData.summary,
          processingTime,
        },
      };

      onFileUpload(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const parseFile = async (file: File): Promise<Omit<ParsedData, 'summary'> & { summary: Omit<ParsedData['summary'], 'processingTime'> }> => {
    const text = await file.text();
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    switch (fileExtension) {
      case '.csv':
        return parseCSV(text);
      case '.json':
        return parseJSON(text);
      case '.txt':
        return parseTXT(text);
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  };

  const parseCSV = (text: string): Omit<ParsedData, 'summary'> & { summary: Omit<ParsedData['summary'], 'processingTime'> } => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    const columns = headers.map(name => ({
      name,
      type: inferColumnType(data, name),
      nullable: true,
    }));

    return {
      data,
      columns,
      errors: [],
      summary: {
        rowCount: data.length,
        columnCount: headers.length,
        memoryUsage: new Blob([text]).size / (1024 * 1024), // MB
      },
    };
  };

  const parseJSON = (text: string): Omit<ParsedData, 'summary'> & { summary: Omit<ParsedData['summary'], 'processingTime'> } => {
    try {
      const parsed = JSON.parse(text);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      
      if (data.length === 0) {
        throw new Error('JSON file contains no data');
      }

      const sampleRow = data[0];
      const columnNames = Object.keys(sampleRow);
      const columns = columnNames.map(name => ({
        name,
        type: inferColumnType(data, name),
        nullable: true,
      }));

      return {
        data,
        columns,
        errors: [],
        summary: {
          rowCount: data.length,
          columnCount: columnNames.length,
          memoryUsage: new Blob([text]).size / (1024 * 1024), // MB
        },
      };
    } catch (err) {
      throw new Error('Invalid JSON format');
    }
  };

  const parseTXT = (text: string): Omit<ParsedData, 'summary'> & { summary: Omit<ParsedData['summary'], 'processingTime'> } => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const data = lines.map((line, index) => ({ id: index + 1, text: line }));

    return {
      data,
      columns: [
        { name: 'id', type: 'number' as const, nullable: false },
        { name: 'text', type: 'string' as const, nullable: false },
      ],
      errors: [],
      summary: {
        rowCount: data.length,
        columnCount: 2,
        memoryUsage: new Blob([text]).size / (1024 * 1024), // MB
      },
    };
  };

  const inferColumnType = (data: any[], columnName: string): 'string' | 'number' | 'boolean' | 'date' => {
    const sampleValues = data.slice(0, 10).map(row => row[columnName]).filter(v => v != null && v !== '');
    
    if (sampleValues.length === 0) return 'string';

    // Check if all values are numbers
    if (sampleValues.every(v => !isNaN(Number(v)))) {
      return 'number';
    }

    // Check if all values are booleans
    if (sampleValues.every(v => v === 'true' || v === 'false' || v === true || v === false)) {
      return 'boolean';
    }

    // Check if all values are dates
    if (sampleValues.every(v => !isNaN(Date.parse(v)))) {
      return 'date';
    }

    return 'string';
  };

  return (
    <div className={`${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-dataprism-500 bg-dataprism-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-2">
          {uploading ? (
            <>
              <div className="w-8 h-8 border-4 border-gray-200 border-t-dataprism-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Processing file...</p>
            </>
          ) : (
            <>
              <div className="text-4xl text-gray-400">📁</div>
              <p className="text-lg font-medium text-gray-700">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: {acceptedTypes.join(', ')} (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;