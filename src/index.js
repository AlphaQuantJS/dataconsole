/**
 * DataConsole - minimalist web console for displaying tabular data, charts, and markdown
 * @module dataconsole
 */

// Export main functions for working with the console
export { display, plot, view, clear } from './display.js';

// Export renderers for extensibility
export { renderTable } from './renderers/TableRenderer.js';
export { renderPlot } from './renderers/PlotRenderer.js';
export { renderMarkdown } from './renderers/MarkdownRenderer.js';

/**
 * Library version
 * @type {string}
 */
export const VERSION = '0.0.1';

/**
 * Library information
 * @returns {Object} - Library information
 */
export function info() {
  return {
    name: 'DataConsole',
    version: VERSION,
    description:
      'Minimalist web console for displaying tabular data, charts, and markdown in the browser',
    repository: 'https://github.com/AlphaQuantJS/dataconsole',
  };
}
