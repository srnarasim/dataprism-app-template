# DataPrism App Template - Context Engineering Guide

## Project Overview

This is a template repository for building applications with the DataPrism ecosystem. It provides a complete starting point with best practices, testing infrastructure, documentation, and deployment configuration for creating high-performance, browser-based analytics applications.

## Architecture Context

DataPrism App Template implements modern web application architecture optimized for data-heavy applications:

### Core Architecture Patterns
- **React + TypeScript**: Modern, type-safe frontend development
- **DataPrism Core Integration**: WebAssembly-powered analytics engine
- **Plugin-Based Architecture**: Extensible visualization and data processing
- **CDN-First Loading**: Optimized for production deployment
- **Component-Driven Development**: Reusable, testable UI components

### Technology Stack
- **Frontend**: React 18+, TypeScript 5+, Vite 5+ 
- **Styling**: Tailwind CSS 4+ for modern, responsive design
- **DataPrism**: Core engine with visualization plugins
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Documentation**: Markdown-based with live examples
- **Deployment**: GitHub Actions + GitHub Pages

### Repository Structure
```
dataprism-app-template/
├── src/
│   ├── components/          # React components
│   │   ├── common/          # Shared UI components
│   │   ├── data/            # Data visualization components
│   │   └── charts/          # Chart and graph components
│   ├── contexts/            # React contexts for state management
│   │   ├── DataPrismContext.tsx    # Main DataPrism integration
│   │   └── AppContext.tsx          # Application state
│   ├── pages/               # Page components
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── hooks/               # Custom React hooks
├── public/                  # Static assets
├── docs/                    # Documentation files
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── e2e/                 # End-to-end tests
├── examples/                # Usage examples and PRPs
├── .claude/                 # Claude Code commands
└── .github/workflows/       # CI/CD workflows
```

## Development Principles

### DataPrism Integration Best Practices

- **CDN-First Loading**: Always prefer CDN loading for production
- **Error Boundary Protection**: Wrap DataPrism components in error boundaries
- **Progressive Enhancement**: Graceful degradation when DataPrism unavailable
- **Memory Management**: Proper cleanup of DataPrism resources
- **Type Safety**: Comprehensive TypeScript definitions

### Component Architecture

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Use React composition patterns
- **Props Interface Design**: Clear, well-documented prop types
- **State Management**: Context for global state, local state for components
- **Performance Optimization**: Memoization and lazy loading where appropriate

### Testing Strategy

- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test DataPrism integration points
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Monitor DataPrism initialization and query times
- **Visual Regression**: Ensure UI consistency

## Context Engineering Rules

### Planning and Research

- Always understand the user's data analysis requirements first
- Check existing components before creating new ones
- Review DataPrism plugin ecosystem for available functionality
- Plan for both development and production deployment scenarios

### Code Organization

- Keep components under 200 lines when possible
- Use clear, descriptive names following React conventions
- Implement proper TypeScript types for all DataPrism interactions
- Follow established patterns in the template structure

### DataPrism Specific Guidelines

- Initialize DataPrism engine once per application lifecycle
- Use proper loading states during engine initialization
- Handle WebAssembly loading failures gracefully
- Implement proper query error handling and user feedback
- Cache frequently used data transformations

### Performance Optimization

- Lazy load DataPrism engine when first needed
- Use React.memo for expensive visualization components  
- Implement proper cleanup in useEffect hooks
- Monitor memory usage with large datasets
- Use streaming for large file uploads

## Common Patterns to Follow

### DataPrism Context Provider

```typescript
// src/contexts/DataPrismContext.tsx
export const DataPrismProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [engine, setEngine] = useState<DataPrismEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeEngine() {
      try {
        setIsLoading(true);
        await loadDataPrismFromCDN();
        const engineInstance = new DataPrismEngine({
          maxMemoryMB: 512,
          enableOptimizations: true,
        });
        await engineInstance.initialize();
        setEngine(engineInstance);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize DataPrism');
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeEngine();
    
    return () => {
      engine?.cleanup();
    };
  }, []);

  return (
    <DataPrismContext.Provider value={{ engine, isLoading, error }}>
      {children}
    </DataPrismContext.Provider>
  );
};
```

### Reusable Chart Component

```typescript
// src/components/charts/DataChart.tsx
interface DataChartProps {
  data: any[];
  type: 'bar' | 'line' | 'scatter';
  xField: string;
  yField: string;
  title?: string;
  height?: number;
}

export const DataChart: React.FC<DataChartProps> = ({
  data,
  type,
  xField,
  yField,
  title,
  height = 400
}) => {
  const { engine } = useDataPrism();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!engine || !data.length) return;
    
    async function processData() {
      setLoading(true);
      try {
        const processedData = await engine.processVisualizationData(data, {
          type,
          x: xField,
          y: yField
        });
        setChartData(processedData);
      } catch (error) {
        console.error('Chart data processing failed:', error);
      } finally {
        setLoading(false);
      }
    }
    
    processData();
  }, [engine, data, type, xField, yField]);

  if (loading) return <ChartSkeleton height={height} />;
  if (!chartData) return <ChartError message="No data available" />;

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <VisualizationPlugin 
        data={chartData}
        type={type}
        height={height}
      />
    </div>
  );
};
```

### Error Boundary Pattern

```typescript
// src/components/common/DataPrismErrorBoundary.tsx
export class DataPrismErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DataPrism Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>DataPrism Error</h2>
          <p>Something went wrong with the data processing engine.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Build and Testing Context

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
npm run test:coverage    # Generate coverage report

# Linting and Type Checking
npm run lint             # ESLint checking
npm run type-check       # TypeScript type checking
npm run format           # Prettier formatting

# Documentation
npm run docs:dev         # Start documentation server
npm run docs:build       # Build documentation

# Deployment
npm run deploy           # Deploy to GitHub Pages
```

## PRP (Product Requirements Prompt) Guidelines

### Writing Effective PRPs

- Start with clear user requirements and use cases
- Specify data types and expected volumes
- Include performance requirements and constraints  
- Define success criteria and acceptance tests
- Provide sample data and expected outputs

### Example PRP Structure

```markdown
# Feature: Interactive Sales Dashboard

## User Story
As a sales manager, I want to visualize sales performance data in real-time so that I can make informed decisions about team performance and resource allocation.

## Requirements
- Load CSV sales data (up to 10,000 records)
- Display monthly sales trends as line chart
- Show top performers in bar chart format
- Enable filtering by date range and sales rep
- Update visualizations in real-time as filters change

## Technical Specs
- Use DataPrism engine for data processing  
- Implement responsive design for mobile/desktop
- Target <2s load time for initial data processing
- Support CSV files up to 5MB

## Success Criteria  
- Dashboard loads within 2 seconds
- Charts update smoothly when filters change
- Mobile responsive on screens >375px width
- Handles edge cases (empty data, invalid formats)
```

## Performance Considerations

### DataPrism Optimization

- Initialize engine once and reuse across components
- Use streaming for large file processing
- Implement proper data caching strategies
- Monitor memory usage and implement cleanup

### React Performance  

- Use React.memo for expensive components
- Implement proper key props for list rendering
- Lazy load heavy components and plugins
- Use useCallback and useMemo appropriately

### Bundle Optimization

- Code splitting for DataPrism plugins
- Tree shaking for unused dependencies  
- Asset optimization for production builds
- CDN loading for external dependencies

## Communication Style

- Focus on practical examples and real-world scenarios
- Provide both beginner-friendly and advanced usage patterns
- Include troubleshooting guides for common issues
- Emphasize best practices for production deployment
- Document all DataPrism integration patterns clearly

## Template Usage Guidelines

When using this template:
1. Review the example implementations in `/examples/`
2. Customize the DataPrismContext for your specific needs
3. Add your domain-specific types in `/src/types/`
4. Create PRPs in `/examples/` for new features
5. Update tests as you add functionality
6. Deploy early and often using the provided CI/CD pipeline

Remember: This template prioritizes developer experience, type safety, and production readiness while maintaining flexibility for various use cases.