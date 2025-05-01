# DataConsole

A minimalist web console for displaying tabular data, charts, and markdown in the browser. DataConsole allows analysts, quants, and developers to quickly visualize data analysis results without the need to configure complex frameworks.

## Features

- Display data tables (with sorting)
- Build interactive charts using Plotly.js
- Markdown support for formatted text
- Sequential output of results in Jupyter Notebook style
- Works entirely in the browser without a server-side component
- Live mode with automatic updates when code changes

## Quick Start

```bash
# Installation
pnpm install

# Run in development mode
pnpm dev
```

After launching, the browser will open with a demo page.

## Usage

```javascript
import { display, plot, view } from './src/display.js';

// Display Markdown
display('# Heading');
display('## Subheading');

// Display chart
const data = [
  { time: '2024-01-01', value: 100 },
  { time: '2024-01-02', value: 110 }
];
plot(data);

// Display table
view(data);

// Display JSON
display({ sharpe: 1.42, maxDD: -0.12 });
```

## Project Structure

```
dataconsole/
├── index.html           # Main HTML file
├── index.js             # Usage example
├── style.css            # Console styles
├── vite.config.js       # Vite configuration
├── package.json
└── src/
    ├── display.js       # Main display module
    ├── index.js         # Library entry point
    └── renderers/       # Modules for displaying different data types
        ├── TableRenderer.js
        ├── PlotRenderer.js
        └── MarkdownRenderer.js
```

## Technologies

- **JavaScript** (pure JS without frameworks)
- **Vite** (for development and building)
- **Plotly.js** (for charts)
- **Marked.js** (for markdown rendering)

## Development Plans

- Integration with TinyFrameJS for working with DataFrame
- Advanced table capabilities (filtering, virtualization)
- Export results to various formats
- Drag & drop blocks
- Dark/light theme

## License

MIT
