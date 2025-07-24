# Production Deployment Guide

## DataPrism CDN Integration

### Development vs Production

This template uses a **mock DataPrism implementation** by default to avoid COEP/CORS issues during development. For production deployment with the real DataPrism engine, follow the configuration steps below.

### COEP/CORS Issue Explanation

The error `ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep` occurs when:

1. Your application has Cross-Origin Embedder Policy (COEP) enabled
2. The external CDN (DataPrism) doesn't serve resources with proper CORS headers
3. The browser blocks the cross-origin request for security reasons

### Solutions for Production

#### Option 1: Host DataPrism Assets Locally (Recommended)

```bash
# Download DataPrism assets to your public directory
curl -o public/dataprism.umd.js https://srnarasim.github.io/DataPrism/dataprism.umd.js
curl -o public/manifest.json https://srnarasim.github.io/DataPrism/manifest.json

# Update your CDN configuration
const localConfig = {
  baseUrl: '/dataprism', // Serve from your own domain
  coreBundle: '/dataprism.umd.js',
  manifest: '/manifest.json'
};
```

#### Option 2: Configure Reverse Proxy

Set up a reverse proxy in your server configuration to serve DataPrism assets:

**Nginx Configuration:**

```nginx
location /dataprism/ {
    proxy_pass https://srnarasim.github.io/DataPrism/;
    proxy_set_header Host srnarasim.github.io;

    # Add CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
    add_header Access-Control-Allow-Headers Content-Type;
}
```

**Express.js Proxy:**

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(
  '/dataprism',
  createProxyMiddleware({
    target: 'https://srnarasim.github.io',
    changeOrigin: true,
    pathRewrite: {
      '^/dataprism': '/DataPrism',
    },
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    },
  })
);
```

#### Option 3: Enable Real CDN Loading

To test real CDN loading in development, add the query parameter:

```
http://localhost:3000?use-real-cdn=true
```

Or set the environment variable:

```bash
NODE_ENV=production npm run dev
```

### Production Checklist

- [ ] Configure DataPrism asset serving (local hosting or proxy)
- [ ] Update CDN base URL in configuration
- [ ] Test with real data to ensure performance
- [ ] Set up monitoring for DataPrism engine health
- [ ] Configure proper error boundaries for WebAssembly failures
- [ ] Implement analytics for DataPrism usage patterns

### Security Considerations

#### Content Security Policy (CSP)

The template includes relaxed CSP headers for development. For production, tighten the policy:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://your-domain.com;
  connect-src 'self' https://your-domain.com;
  wasm-src 'self' https://your-domain.com;
"
/>
```

#### COEP Configuration

If you need COEP for other features, configure it properly:

```html
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp" />
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin" />
```

And ensure DataPrism assets are served with:

```
Cross-Origin-Resource-Policy: cross-origin
```

### Performance Optimization

#### CDN Configuration

```typescript
// Optimized production configuration
const productionConfig = {
  cdnUrl: '/dataprism', // Your local/proxied assets
  timeout: 10000, // Reduced timeout for local assets
  retries: 2,
  enableFallbacks: false, // No fallbacks in production
  dependencyManagement: {
    enabled: true,
    progressTracking: false, // Disable for production
    preloadDependencies: true,
  },
};
```

#### Monitoring

Add monitoring for DataPrism initialization:

```typescript
// In your DataPrismContext
useEffect(() => {
  const initStart = performance.now();

  initializeDataPrism()
    .then(() => {
      const initTime = performance.now() - initStart;
      analytics.track('dataprism_init_success', { duration: initTime });
    })
    .catch(error => {
      analytics.track('dataprism_init_failure', { error: error.message });
    });
}, []);
```

### Troubleshooting

#### Common Issues

1. **Assets not loading**: Check network tab, verify URLs are correct
2. **COEP errors**: Ensure proper CORS headers on DataPrism assets
3. **WebAssembly failures**: Check browser compatibility and memory limits
4. **Performance issues**: Monitor initialization times and memory usage

#### Debug Mode

Enable debug logging:

```typescript
const debugConfig = {
  ...config,
  logLevel: 'debug',
  enablePerformanceMetrics: true,
};
```

This will provide detailed information about DataPrism loading and initialization.
