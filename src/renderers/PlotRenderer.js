/**
 * Module for rendering charts using Plotly.js
 * @module PlotRenderer
 */

// Check if Plotly is loaded and load it if not
let Plotly;
try {
  Plotly = require('plotly.js-dist-min');
} catch (e) {
  console.error('Error loading Plotly:', e);
  // Fallback: try to load from CDN if not installed locally
  if (typeof window !== 'undefined') {
    if (!window.Plotly) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      script.async = true;
      document.head.appendChild(script);
      console.log('Loading Plotly from CDN');
    }
    Plotly = window.Plotly;
  }
}

/**
 * Renders a chart based on data
 * @param {Array<Object>} data - Array of objects with data for the chart
 * @param {Object} options - Additional options for the chart
 * @returns {HTMLDivElement} - HTML element with the chart
 */
export function renderPlot(data, options = {}) {
  if (!Array.isArray(data) || data.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'No data to build a chart';
    return emptyMessage;
  }

  // Create container for the chart
  const container = document.createElement('div');
  container.className = 'plot-container';
  container.style.width = '100%';
  container.style.height = '400px';

  // Ensure Plotly is loaded before rendering
  if (typeof Plotly === 'undefined' || !Plotly) {
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'Loading chart library...';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.textAlign = 'center';
    container.appendChild(loadingMessage);

    // Try to load Plotly again after a delay
    setTimeout(() => {
      if (window.Plotly) {
        Plotly = window.Plotly;
        container.removeChild(loadingMessage);
        renderChartWhenReady(container, data, options);
      }
    }, 1000);

    return container;
  }

  // Render chart immediately if Plotly is available
  renderChartWhenReady(container, data, options);
  return container;
}

/**
 * Renders the appropriate chart when Plotly is ready
 * @param {HTMLDivElement} container - Container for the chart
 * @param {Array<Object>} data - Data for the chart
 * @param {Object} options - Additional options
 */
function renderChartWhenReady(container, data, options) {
  // Determine data type and create the appropriate chart
  if (isTimeSeriesData(data)) {
    renderTimeSeriesPlot(container, data, options);
  } else if (isScatterData(data)) {
    renderScatterPlot(container, data, options);
  } else {
    renderGenericPlot(container, data, options);
  }
}

/**
 * Checks if the data is a time series
 * @param {Array<Object>} data - Data to check
 * @returns {boolean} - true if the data is a time series
 */
function isTimeSeriesData(data) {
  return (
    data.length > 0 && data[0].time !== undefined && data[0].value !== undefined
  );
}

/**
 * Checks if the data is suitable for a scatter plot
 * @param {Array<Object>} data - Data to check
 * @returns {boolean} - true if the data is suitable for a scatter plot
 */
function isScatterData(data) {
  return data.length > 0 && data[0].x !== undefined && data[0].y !== undefined;
}

/**
 * Renders a time series chart
 * @param {HTMLDivElement} container - Container for the chart
 * @param {Array<Object>} data - Data for the chart
 * @param {Object} options - Additional options
 */
function renderTimeSeriesPlot(container, data, options) {
  if (!Plotly) {
    console.error('Plotly is not available');
    container.textContent = 'Chart library not available';
    return;
  }

  const title = options.title || 'Time Series';
  const xField = options.xField || 'time';
  const yField = options.yField || 'value';

  const trace = {
    x: data.map((d) => d[xField]),
    y: data.map((d) => d[yField]),
    type: 'scatter',
    mode: 'lines+markers',
    name: options.name || yField,
    line: {
      color: options.color || '#1f77b4',
      width: 2,
    },
    marker: {
      size: 6,
    },
  };

  const layout = {
    title,
    height: options.height || 400,
    margin: { t: 50, r: 50, b: 50, l: 50 },
    // eslint-disable-next-line camelcase
    paper_bgcolor: 'rgba(0,0,0,0)',
    // eslint-disable-next-line camelcase
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#ddd',
    },
    xaxis: {
      title: options.xLabel || xField,
      gridcolor: '#444',
    },
    yaxis: {
      title: options.yLabel || yField,
      gridcolor: '#444',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  };

  try {
    Plotly.newPlot(container, [trace], layout, config);
  } catch (error) {
    console.error('Error rendering plot:', error);
    container.textContent = 'Error rendering chart: ' + error.message;
  }

  // Add button to export the chart
  addExportButton(container);
}

/**
 * Renders a scatter plot
 * @param {HTMLDivElement} container - Container for the chart
 * @param {Array<Object>} data - Data for the chart
 * @param {Object} options - Additional options
 */
function renderScatterPlot(container, data, options) {
  if (!Plotly) {
    console.error('Plotly is not available');
    container.textContent = 'Chart library not available';
    return;
  }

  const title = options.title || 'Scatter Plot';
  const xField = options.xField || 'x';
  const yField = options.yField || 'y';

  const trace = {
    x: data.map((d) => d[xField]),
    y: data.map((d) => d[yField]),
    type: 'scatter',
    mode: 'markers',
    name: options.name || 'Points',
    marker: {
      size: 8,
      color: options.color || '#1f77b4',
      opacity: 0.7,
    },
  };

  const layout = {
    title,
    height: options.height || 400,
    margin: { t: 50, r: 50, b: 50, l: 50 },
    // eslint-disable-next-line camelcase
    paper_bgcolor: 'rgba(0,0,0,0)',
    // eslint-disable-next-line camelcase
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#ddd',
    },
    xaxis: {
      title: options.xLabel || xField,
      gridcolor: '#444',
    },
    yaxis: {
      title: options.yLabel || yField,
      gridcolor: '#444',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
  };

  try {
    Plotly.newPlot(container, [trace], layout, config);
  } catch (error) {
    console.error('Error rendering plot:', error);
    container.textContent = 'Error rendering chart: ' + error.message;
  }

  // Add button to export the chart
  addExportButton(container);
}

/**
 * Renders a generic plot
 * @param {HTMLDivElement} container - Container for the chart
 * @param {Array<Object>} data - Data for the chart
 * @param {Object} options - Additional options
 */
function renderGenericPlot(container, data, options) {
  if (!Plotly) {
    console.error('Plotly is not available');
    container.textContent = 'Chart library not available';
    return;
  }

  // Try to determine keys for x and y
  const keys = Object.keys(data[0]);
  const xField = options.xField || keys[0];
  const yField = options.yField || keys[1];

  const trace = {
    x: data.map((d) => d[xField]),
    y: data.map((d) => d[yField]),
    type: 'scatter',
    mode: 'markers',
    name: options.name || 'Data',
    marker: {
      size: 8,
      color: options.color || '#1f77b4',
      opacity: 0.7,
    },
  };

  const layout = {
    title: options.title || 'Chart',
    height: options.height || 400,
    margin: { t: 50, r: 50, b: 50, l: 50 },
    // eslint-disable-next-line camelcase
    paper_bgcolor: 'rgba(0,0,0,0)',
    // eslint-disable-next-line camelcase
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: '#ddd',
    },
    xaxis: {
      title: options.xLabel || xField,
      gridcolor: '#444',
    },
    yaxis: {
      title: options.yLabel || yField,
      gridcolor: '#444',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
  };

  try {
    Plotly.newPlot(container, [trace], layout, config);
  } catch (error) {
    console.error('Error rendering plot:', error);
    container.textContent = 'Error rendering chart: ' + error.message;
  }

  // Add button to export the chart
  addExportButton(container);
}

/**
 * Adds an export button to the chart
 * @param {HTMLDivElement} container - Container with the chart
 */
function addExportButton(container) {
  // Export button implementation will be added in future versions
}
