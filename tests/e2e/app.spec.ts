import { test, expect } from '@playwright/test';

test.describe('DataPrism App Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title and header', async ({ page }) => {
    await expect(page).toHaveTitle(/DataPrism App Template/);
    await expect(page.getByRole('heading', { name: 'DataPrism App Template' })).toBeVisible();
    await expect(page.getByText('WebAssembly-powered analytics in your browser')).toBeVisible();
  });

  test('shows ready status', async ({ page }) => {
    // Wait for DataPrism to initialize (mocked, so should be quick)
    await expect(page.getByText('✓ Ready')).toBeVisible({ timeout: 10000 });
  });

  test('displays main sections', async ({ page }) => {
    await expect(page.getByText('📊 Data Upload')).toBeVisible();
    await expect(page.getByText('📈 Visualization')).toBeVisible();
    await expect(page.getByText('Ready for Data Visualization')).toBeVisible();
    await expect(
      page.getByText('Upload a file and configure chart settings to get started')
    ).toBeVisible();
  });

  test('has working footer links', async ({ page }) => {
    const dataPrismLink = page.getByRole('link', { name: /DataPrism/i });
    await expect(dataPrismLink).toHaveAttribute(
      'href',
      'https://github.com/srnarasim/dataprism-core'
    );
    await expect(dataPrismLink).toHaveAttribute('target', '_blank');

    const templateLink = page.getByRole('link', { name: /View Template Source/i });
    await expect(templateLink).toHaveAttribute(
      'href',
      'https://github.com/srnarasim/dataprism-app-template'
    );
    await expect(templateLink).toHaveAttribute('target', '_blank');
  });

  test('file upload flow works correctly', async ({ page }) => {
    // Create a test CSV file
    const csvContent = 'name,age,salary\nAlice,25,50000\nBob,30,60000\nCarol,28,55000';

    // Upload file via input
    const fileInput = page.locator('input[type="file"]');

    // Create a temporary file for testing
    const testFile = await page.evaluateHandle(content => {
      const blob = new Blob([content], { type: 'text/csv' });
      const file = new File([blob], 'test-data.csv', { type: 'text/csv' });
      return file;
    }, csvContent);

    await fileInput.setInputFiles(testFile as any);

    // Wait for upload to complete and check data summary
    await expect(page.getByText('Data Summary')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Rows: 3')).toBeVisible();
    await expect(page.getByText('Columns: 3')).toBeVisible();

    // Check that chart settings appear
    await expect(page.getByText('⚙️ Chart Settings')).toBeVisible();

    // Check that fields are auto-populated
    const xFieldSelect = page.getByLabel('X-Axis Field');
    const yFieldSelect = page.getByLabel('Y-Axis Field');

    await expect(xFieldSelect).toHaveValue('name');
    await expect(yFieldSelect).toHaveValue('age');

    // Check that chart title is auto-generated
    await expect(page.getByDisplayValue('age by name')).toBeVisible();

    // Verify chart is displayed
    await expect(page.getByText('📈 Visualization')).toBeVisible();
    // Chart should render (mocked implementation will show some content)

    // Check data preview
    await expect(page.getByText('🔍 Data Preview')).toBeVisible();
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText('Carol')).toBeVisible();
  });

  test('chart configuration updates work', async ({ page }) => {
    // Upload test data first
    const csvContent = 'product,sales,region\nLaptop,1000,North\nMouse,50,South\nKeyboard,200,East';
    const testFile = await page.evaluateHandle(content => {
      const blob = new Blob([content], { type: 'text/csv' });
      return new File([blob], 'sales-data.csv', { type: 'text/csv' });
    }, csvContent);

    await page.locator('input[type="file"]').setInputFiles(testFile as any);
    await expect(page.getByText('Data Summary')).toBeVisible({ timeout: 5000 });

    // Change chart type
    await page.getByLabel('Chart Type').selectOption('line');

    // Change Y-axis field
    await page.getByLabel('Y-Axis Field').selectOption('sales');

    // Update chart title
    await page.getByLabel('Chart Title').fill('Sales by Product');

    // Verify changes are reflected (in a real implementation, chart would update)
    await expect(page.getByDisplayValue('Sales by Product')).toBeVisible();
  });

  test('handles file upload errors gracefully', async ({ page }) => {
    // Try to upload an unsupported file type
    const textContent = 'This is not a CSV file';
    const testFile = await page.evaluateHandle(content => {
      const blob = new Blob([content], { type: 'application/pdf' });
      return new File([blob], 'document.pdf', { type: 'application/pdf' });
    }, textContent);

    await page.locator('input[type="file"]').setInputFiles(testFile as any);

    // Should show error message
    await expect(page.getByText(/File type \.pdf not supported/)).toBeVisible({ timeout: 5000 });
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that main elements are still visible and properly arranged
    await expect(page.getByRole('heading', { name: 'DataPrism App Template' })).toBeVisible();
    await expect(page.getByText('📊 Data Upload')).toBeVisible();
    await expect(page.getByText('📈 Visualization')).toBeVisible();

    // Check that the layout adapts (elements should stack vertically)
    const uploadSection = page.getByText('📊 Data Upload').locator('..');
    const visualSection = page.getByText('📈 Visualization').locator('..');

    await expect(uploadSection).toBeVisible();
    await expect(visualSection).toBeVisible();
  });

  test('drag and drop file upload works', async ({ page }) => {
    const csvContent = 'name,value\nTest1,100\nTest2,200';

    // Create drag and drop event
    const dataTransfer = await page.evaluateHandle(content => {
      const dt = new DataTransfer();
      const file = new File([content], 'drag-test.csv', { type: 'text/csv' });
      dt.items.add(file);
      return dt;
    }, csvContent);

    // Find the drop zone
    const dropZone = page.getByText('Drop files here or click to browse').locator('..');

    // Simulate drag and drop
    await dropZone.dispatchEvent('dragenter', { dataTransfer });
    await dropZone.dispatchEvent('dragover', { dataTransfer });
    await dropZone.dispatchEvent('drop', { dataTransfer });

    // Check that file was processed
    await expect(page.getByText('Data Summary')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Rows: 2')).toBeVisible();
  });

  test('accessibility features work correctly', async ({ page }) => {
    // Check that main elements have proper roles and labels
    await expect(page.locator('input[type="file"]')).toHaveAttribute('accept', '.csv,.json,.txt');

    // Check heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check that interactive elements can be focused
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Check color contrast (basic check)
    const styles = await page
      .getByRole('heading', { name: 'DataPrism App Template' })
      .evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      });

    // Basic check that we have contrast (not pure white on white)
    expect(styles.color).not.toBe('rgb(255, 255, 255)');
  });

  test('performance metrics are reasonable', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'DataPrism App Template' })).toBeVisible();
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (generous for testing)
    expect(loadTime).toBeLessThan(5000);

    // Check that DataPrism initialization doesn't take too long
    const initStart = Date.now();
    await expect(page.getByText('✓ Ready')).toBeVisible({ timeout: 10000 });
    const initTime = Date.now() - initStart;

    // DataPrism mock should initialize quickly
    expect(initTime).toBeLessThan(3000);
  });
});
