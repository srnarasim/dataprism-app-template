# DataPrism App Template 🚀

A comprehensive template for building high-performance, browser-based analytics applications with the [DataPrism](https://github.com/srnarasim/dataprism-core) ecosystem. This template provides everything you need to get started with WebAssembly-powered data analysis and visualization in your browser.

![DataPrism App Template](./docs/images/dataprism-template-preview.png)

## ✨ Features

- **🔥 Modern Stack**: React 18+, TypeScript 5+, Vite 5+, Tailwind CSS 4+
- **⚡ WebAssembly-Powered**: DataPrism core engine for high-performance analytics
- **🎨 Rich Visualizations**: Interactive charts, graphs, and data tables
- **📱 Responsive Design**: Mobile-first, accessible, and cross-browser compatible
- **🧪 Testing Ready**: Vitest for unit tests, Playwright for E2E testing
- **🚀 Deploy Anywhere**: GitHub Actions + GitHub Pages included
- **🤖 Claude Code Integration**: Advanced context engineering with PRPs (Product Requirements Prompts)
- **📁 File Processing**: Drag-and-drop CSV, JSON, and TXT file support
- **🔄 Real-time Processing**: Instant data analysis and visualization updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Modern browser with WebAssembly support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) (recommended for enhanced development experience)

### 1. Create Your Project

```bash
# Using this template
git clone https://github.com/srnarasim/dataprism-app-template.git my-analytics-app
cd my-analytics-app

# Remove template git history and initialize fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit from DataPrism App Template"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see your app running! 🎉

### 4. Try the Demo

1. **Upload Data**: Drag and drop a CSV file or use the sample data
2. **Configure Chart**: Select fields for X and Y axes
3. **Visualize**: See your data come to life with interactive charts
4. **Explore**: Filter, sort, and analyze your data in real-time

## 📊 Sample Data

Try the template with these sample datasets:

```csv
name,age,salary,department
Alice,25,50000,Engineering
Bob,30,60000,Marketing  
Carol,28,55000,Engineering
David,35,75000,Sales
Eve,22,45000,Marketing
```

Save as `sample-data.csv` and upload to see the template in action!

## 🛠️ Development

### Project Structure

```
dataprism-app-template/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components
│   │   ├── data/            # Data handling components
│   │   └── charts/          # Visualization components
│   ├── contexts/            # React contexts
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── examples/                # Sample PRPs and use cases
├── .claude/                 # Claude Code commands
├── docs/                    # Documentation
└── tests/                   # Test files
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run clean            # Clean build artifacts

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run end-to-end tests

# Documentation & Deployment
npm run docs:dev         # Start documentation server
npm run docs:build       # Build documentation
npm run deploy           # Deploy to GitHub Pages
```

## 🧪 Testing

The template includes comprehensive testing setup:

### Unit Tests (Vitest)
```bash
npm run test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### Coverage Reports
```bash
npm run test:coverage
```

## 🤖 Claude Code Integration

This template is optimized for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with advanced context engineering:

### PRP Workflow

1. **Generate Requirements**:
   ```bash
   /generate-prp
   ```
   Creates structured requirements for new features

2. **Execute Implementation**:
   ```bash
   /execute-prp
   ```
   Implements features following best practices

### Context Engineering

The template includes:
- **CLAUDE.md**: Comprehensive context for the codebase
- **Custom Commands**: `/generate-prp` and `/execute-prp` slash commands
- **Settings**: Optimized Claude Code configuration
- **Examples**: Sample PRPs for common use cases

## 📈 DataPrism Integration

### Engine Initialization

```typescript
import { useDataPrism } from '@contexts/DataPrismContext';

function MyComponent() {
  const { engine, isLoading, error } = useDataPrism();
  
  if (isLoading) return <div>Loading DataPrism...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // Use engine for data processing
  const processData = async (data: any[]) => {
    return await engine.processData(data, {
      type: 'visualization',
      parameters: { chartType: 'bar' }
    });
  };
}
```

### File Processing

```typescript
import { FileUpload } from '@components/data/FileUpload';

function DataUploader() {
  const handleFileUpload = (parsedData: ParsedData) => {
    console.log('Processed:', parsedData.data);
    console.log('Columns:', parsedData.columns);
    console.log('Summary:', parsedData.summary);
  };

  return (
    <FileUpload
      onFileUpload={handleFileUpload}
      acceptedTypes={['.csv', '.json']}
      maxSize={10} // MB
    />
  );
}
```

### Chart Creation

```typescript
import { SimpleChart } from '@components/charts/SimpleChart';

function DataVisualization({ data }: { data: any[] }) {
  const config = {
    id: 'my-chart',
    type: 'bar',
    title: 'Sales by Region',
    xField: 'region',
    yField: 'sales'
  };

  return (
    <SimpleChart
      data={data}
      config={config}
      className="h-96"
    />
  );
}
```

## 🎨 Customization

### Styling

The template uses Tailwind CSS with a custom DataPrism theme:

```css
/* Custom colors available */
.bg-dataprism-500     /* Primary blue */
.text-dataprism-600   /* Darker blue */
.border-dataprism-300 /* Light blue */
```

### Configuration

Customize your app in `src/config/app.ts`:

```typescript
export const appConfig = {
  name: 'My Analytics App',
  description: 'Powered by DataPrism',
  maxFileSize: 50, // MB
  supportedFormats: ['.csv', '.json', '.xlsx'],
  theme: {
    primary: '#0ea5e9',
    secondary: '#38bdf8'
  }
};
```

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Configure Repository**:
   ```bash
   # Set up GitHub Pages in your repo settings
   # Choose "GitHub Actions" as the source
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

The included GitHub Actions workflow will automatically build and deploy your app.

### Other Platforms

- **Vercel**: `npm run build` + drag `dist/` folder
- **Netlify**: Connect GitHub repo, build command: `npm run build`, publish directory: `dist`
- **AWS S3**: Upload `dist/` folder contents
- **Firebase Hosting**: `firebase deploy` after `npm run build`

## 📚 Examples & Use Cases

### Sales Dashboard
See [`examples/sample-dashboard-prp.md`](./examples/sample-dashboard-prp.md) for a complete sales analytics dashboard implementation.

### Scientific Data Analysis
```typescript
// Process scientific datasets
const scientificData = await engine.processData(data, {
  type: 'scientific',
  parameters: {
    analysis: 'correlation',
    variables: ['temperature', 'pressure'],
    method: 'pearson'
  }
});
```

### Financial Charts
```typescript
// Create financial visualizations
const financialChart = {
  type: 'candlestick',
  xField: 'date',
  yFields: ['open', 'high', 'low', 'close'],
  title: 'Stock Price Movement'
};
```

## 🔧 Troubleshooting

### Common Issues

**DataPrism fails to load**
```bash
# Check browser console for WASM errors
# Ensure modern browser with WebAssembly support
# Try running in incognito mode to avoid extension conflicts
```

**File upload errors**
```bash
# Check file size (default max: 10MB)
# Verify file format (CSV, JSON, TXT supported)
# Ensure proper CSV formatting with headers
```

**Build failures**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (18+ required)
node --version
```

### Performance Tips

- **Large Files**: Use streaming for files >5MB
- **Memory**: Monitor browser memory usage with large datasets
- **Charts**: Limit data points displayed (virtualization for large datasets)
- **Loading**: Show progress indicators for long operations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [DataPrism Core](https://github.com/srnarasim/dataprism-core) - The powerful WebAssembly analytics engine
- [React](https://reactjs.org/) - The web framework
- [Vite](https://vitejs.dev/) - The build tool
- [Tailwind CSS](https://tailwindcss.com/) - The utility-first CSS framework
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) - AI-powered development environment

## 🆘 Support

- **Documentation**: [DataPrism Docs](https://github.com/srnarasim/dataprism-core/docs)
- **Issues**: [GitHub Issues](https://github.com/srnarasim/dataprism-app-template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/srnarasim/dataprism-app-template/discussions)
- **Claude Code**: [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code)

---

<div align="center">
  <strong>Built with ❤️ using DataPrism</strong>
  <br>
  <a href="https://github.com/srnarasim/dataprism-core">DataPrism Core</a> •
  <a href="https://github.com/srnarasim/dataprism-app-template">Template Source</a> •
  <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a>
</div>