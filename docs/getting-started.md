# Getting Started with DataPrism App Template

This guide will help you get up and running with the DataPrism App Template quickly.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm 9+**
- **Git** for version control
- A modern web browser with WebAssembly support:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

## Quick Start

### 1. Clone the Template

```bash
# Clone the template repository
git clone https://github.com/srnarasim/dataprism-app-template.git my-app
cd my-app

# Remove the template's git history
rm -rf .git
git init
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see your app!

## First Steps

### Try the Demo

1. **Upload Sample Data**: Create a CSV file with this content:
   ```csv
   name,age,department,salary
   Alice,25,Engineering,75000
   Bob,30,Marketing,65000
   Carol,28,Engineering,80000
   David,35,Sales,70000
   ```

2. **Upload the File**: Drag and drop your CSV file or click to browse

3. **Explore Visualizations**: The app will automatically create charts based on your data

4. **Configure Charts**: Use the settings panel to customize visualizations

### Understanding the Structure

```
src/
├── components/          # React components
│   ├── common/          # Shared UI components
│   ├── data/            # Data handling components
│   └── charts/          # Visualization components
├── contexts/            # React contexts for state management
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── App.tsx              # Main application component
```

## Key Features

### File Upload & Processing
- **Supported Formats**: CSV, JSON, TXT
- **Drag & Drop**: Intuitive file upload interface
- **Automatic Type Detection**: Smart column type inference
- **Error Handling**: Graceful handling of invalid files

### Data Visualization
- **Interactive Charts**: Bar, line, and pie charts
- **Real-time Updates**: Instant visualization updates
- **Responsive Design**: Works on desktop and mobile
- **Customizable**: Easy chart configuration

### DataPrism Integration
- **WebAssembly Performance**: High-speed data processing
- **CDN Loading**: Optimized for production deployment
- **Error Boundaries**: Robust error handling
- **Memory Management**: Efficient resource usage

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript checking
npm run format           # Format with Prettier

# Testing
npm run test             # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:coverage    # Coverage report
```

### Making Changes

1. **Modify Components**: Edit files in `src/components/`
2. **Add Types**: Define TypeScript types in `src/types/`
3. **Update Styles**: Customize Tailwind CSS classes
4. **Run Tests**: Ensure your changes don't break existing functionality

## Next Steps

### Customization

1. **Update App Title**: Edit the title in `index.html` and `App.tsx`
2. **Change Colors**: Modify the DataPrism theme in `src/index.css`
3. **Add Features**: Use the PRP workflow to add new functionality
4. **Configure Build**: Adjust settings in `vite.config.ts`

### Deployment

1. **GitHub Pages**: Use the included GitHub Actions workflow
2. **Vercel**: Connect your GitHub repository
3. **Netlify**: Deploy with a single click
4. **Custom Hosting**: Build and upload the `dist/` folder

### Learning More

- [DataPrism Core Documentation](https://github.com/srnarasim/dataprism-core)
- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Troubleshooting

### Common Issues

**Development server won't start**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Build fails with type errors**
```bash
# Run type checking
npm run type-check
# Fix reported TypeScript errors
```

**Tests are failing**
```bash
# Run tests with verbose output
npm run test -- --reporter=verbose
# Update snapshots if needed
npm run test -- --update-snapshots
```

### Getting Help

- **Documentation**: Check the `docs/` folder for detailed guides
- **Examples**: Look at `examples/` for implementation patterns
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

Happy coding with DataPrism! 🚀