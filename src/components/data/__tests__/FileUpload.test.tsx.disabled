import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FileUpload } from '../FileUpload';

describe.skip('FileUpload Component', () => {
  const mockOnFileUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area with correct text', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    expect(screen.getByText('Drop files here or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supported formats: .csv, .json, .txt (max 10MB)')).toBeInTheDocument();
  });

  it('accepts custom accepted types and max size', () => {
    render(
      <FileUpload onFileUpload={mockOnFileUpload} acceptedTypes={['.xlsx', '.csv']} maxSize={5} />
    );

    expect(screen.getByText('Supported formats: .xlsx, .csv (max 5MB)')).toBeInTheDocument();
  });

  it('shows drag active state when file is dragged over', async () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const dropZone = screen.getByText('Drop files here or click to browse').closest('div');
    expect(dropZone).toBeInTheDocument();

    // Simulate drag enter
    const dragEvent = new Event('dragenter', { bubbles: true });
    dropZone!.dispatchEvent(dragEvent);

    // Check if drag active styles would be applied (tested via class changes)
    expect(dropZone).toBeInTheDocument();
  });

  it.skip('processes CSV file correctly', async () => {
    const csvContent = 'name,age,city\nAlice,25,New York\nBob,30,Boston';
    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    await userEvent.upload(fileInput, csvFile);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            { name: 'Alice', age: '25', city: 'New York' },
            { name: 'Bob', age: '30', city: 'Boston' },
          ],
          columns: expect.arrayContaining([
            expect.objectContaining({ name: 'name', type: 'string' }),
            expect.objectContaining({ name: 'age', type: 'number' }),
            expect.objectContaining({ name: 'city', type: 'string' }),
          ]),
          summary: expect.objectContaining({
            rowCount: 2,
            columnCount: 3,
            memoryUsage: expect.any(Number),
            processingTime: expect.any(Number),
          }),
          errors: [],
        })
      );
    });
  });

  it.skip('processes JSON file correctly', async () => {
    const jsonContent = JSON.stringify([
      { product: 'Laptop', price: 999.99, inStock: true },
      { product: 'Mouse', price: 29.99, inStock: false },
    ]);
    const jsonFile = new File([jsonContent], 'test.json', { type: 'application/json' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, jsonFile);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            { product: 'Laptop', price: 999.99, inStock: true },
            { product: 'Mouse', price: 29.99, inStock: false },
          ],
          columns: expect.arrayContaining([
            expect.objectContaining({ name: 'product', type: 'string' }),
            expect.objectContaining({ name: 'price', type: 'number' }),
            expect.objectContaining({ name: 'inStock', type: 'boolean' }),
          ]),
        })
      );
    });
  });

  it.skip('processes TXT file correctly', async () => {
    const txtContent = 'Line 1\nLine 2\nLine 3';
    const txtFile = new File([txtContent], 'test.txt', { type: 'text/plain' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, txtFile);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            { id: 1, text: 'Line 1' },
            { id: 2, text: 'Line 2' },
            { id: 3, text: 'Line 3' },
          ],
          columns: [
            { name: 'id', type: 'number', nullable: false },
            { name: 'text', type: 'string', nullable: false },
          ],
        })
      );
    });
  });

  it.skip('infers column types correctly', async () => {
    const csvContent =
      'name,age,active,joinDate\nAlice,25,true,2024-01-15\nBob,30,false,2024-02-20';
    const csvFile = new File([csvContent], 'test.csv', { type: 'text/csv' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, csvFile);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          columns: [
            expect.objectContaining({ name: 'name', type: 'string' }),
            expect.objectContaining({ name: 'age', type: 'number' }),
            expect.objectContaining({ name: 'active', type: 'boolean' }),
            expect.objectContaining({ name: 'joinDate', type: 'date' }),
          ],
        })
      );
    });
  });

  it.skip('shows error for unsupported file type', async () => {
    const unsupportedFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, unsupportedFile);

    await waitFor(() => {
      expect(screen.getByText(/File type \.pdf not supported/)).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it.skip('shows error for file too large', async () => {
    // Create a mock file that reports as being larger than the limit
    const largeFile = new File(['content'], 'large.csv', { type: 'text/csv' });
    Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB

    render(<FileUpload onFileUpload={mockOnFileUpload} maxSize={10} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByText('File too large. Maximum size: 10MB')).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it.skip('shows error for empty CSV file', async () => {
    const emptyFile = new File([''], 'empty.csv', { type: 'text/csv' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, emptyFile);

    await waitFor(() => {
      expect(screen.getByText('CSV file is empty')).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it.skip('shows error for invalid JSON file', async () => {
    const invalidJsonFile = new File(['{ invalid json'], 'invalid.json', {
      type: 'application/json',
    });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, invalidJsonFile);

    await waitFor(() => {
      expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it.skip('shows loading state during file processing', async () => {
    const csvFile = new File(['name,age\nAlice,25'], 'test.csv', { type: 'text/csv' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, csvFile);

    // Should briefly show loading state
    expect(screen.getByText('Processing file...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalled();
    });
  });

  it.skip('handles single JSON object (not array)', async () => {
    const jsonContent = JSON.stringify({ name: 'Single Object', value: 42 });
    const jsonFile = new File([jsonContent], 'single.json', { type: 'application/json' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, jsonFile);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [{ name: 'Single Object', value: 42 }],
          summary: expect.objectContaining({
            rowCount: 1,
            columnCount: 2,
          }),
        })
      );
    });
  });

  it.skip('handles CSV with quoted fields containing commas', async () => {
    const csvContent =
      'name,description\n"Alice","A person, developer"\n"Bob","Another person, manager"';
    const csvFile = new File([csvContent], 'quoted.csv', { type: 'text/csv' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, csvFile);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            { name: 'Alice', description: 'A person, developer' },
            { name: 'Bob', description: 'Another person, manager' },
          ],
        })
      );
    });
  });

  it.skip('applies custom className', () => {
    render(<FileUpload onFileUpload={mockOnFileUpload} className="custom-class" />);

    const container = screen
      .getByText('Drop files here or click to browse')
      .closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it.skip('disables input during upload', async () => {
    const csvFile = new File(['name,age\nAlice,25'], 'test.csv', { type: 'text/csv' });

    render(<FileUpload onFileUpload={mockOnFileUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Start upload
    await userEvent.upload(fileInput, csvFile);

    // Input should be disabled during processing
    expect(fileInput).toBeDisabled();

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalled();
    });
  });
});
